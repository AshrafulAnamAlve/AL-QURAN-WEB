import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  PlayableAyah,
  PlaybackQueue,
  REPEAT_COUNT,
  RepeatMode,
} from '../models/audio';
import { Reciter } from '../models/quran';
import { buildAyahAudioUrl } from '../utils/audio-url';
import { LoggerService } from './logger';
import { ReciterService, reciterLabel } from './reciter';
import { STORAGE_KEYS, StorageService } from './storage';
import { TaskService } from './task';

/** How far the lock-screen skip actions move, in seconds. */
const SKIP_SECONDS = 5;

/**
 * Plays Quran recitation, one ayah at a time, from a queue.
 *
 * Design notes, in the order they matter:
 *
 * **One shared HTMLAudioElement.** Creating one per ayah would leave hundreds of
 * media elements alive on a long surah, and would let two ayahs play at once.
 *
 * **Nothing is fetched until play is pressed.** The element is created lazily
 * with `preload="none"`, so a reader who never plays anything downloads no audio
 * at all. Once playback starts, exactly one ayah ahead is warmed in a second,
 * silent element - enough that auto-advance does not stall, and no more. A surah
 * is never bulk-downloaded.
 *
 * **The queue outlives the page.** This service is app-wide and the mini player
 * lives in the shell, so navigating away from the reader does not stop the
 * recitation. A reader registers its ayahs with {@link setPageQueue}, which
 * changes what the *next* press of play uses and never what is playing now.
 *
 * **URLs are built here.** Ayahs arrive from the API carrying an audio URL for
 * the default reciter, but rebuilding it locally means switching reciter costs
 * no request - see core/utils/audio-url.ts.
 */
@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly logger = inject(LoggerService);
  private readonly storage = inject(StorageService);
  private readonly reciterService = inject(ReciterService);
  private readonly taskService = inject(TaskService);

  private lastReportedAudioTime = 0;

  private element?: HTMLAudioElement;

  /** Silent second element, used only to warm the next ayah into the HTTP cache. */
  private prefetchElement?: HTMLAudioElement;

  /** The queue the open page registered. Not playing until play is pressed. */
  private pageQueue: PlaybackQueue | null = null;

  /** Flag preventing premature pause state during continuous auto-advance in background. */
  private isAdvancing = false;

  /** Screen wake lock held during active playback. */
  private wakeLockSentinel: unknown = null;

  // --- What is playing ----------------------------------------------------

  private readonly queueState = signal<PlaybackQueue | null>(null);
  private readonly indexState = signal(-1);

  readonly queue = this.queueState.asReadonly();
  readonly index = this.indexState.asReadonly();

  /** The ayah loaded in the player, or null when idle. */
  readonly current = computed<PlayableAyah | null>(() => {
    const queue = this.queueState();
    const index = this.indexState();
    return queue && index >= 0 ? (queue.ayahs[index] ?? null) : null;
  });

  /** Global number of the ayah currently loaded, or null when idle. */
  readonly currentAyah = computed(() => this.current()?.globalNumber ?? null);

  /** True once something is loaded, which is when the mini player appears. */
  readonly isActive = computed(() => this.current() !== null);

  readonly hasPrevious = computed(() => this.indexState() > 0);

  readonly hasNext = computed(() => {
    const queue = this.queueState();
    return queue !== null && this.indexState() < queue.ayahs.length - 1;
  });

  /** "Ayah 3 of 286", for the player and for screen readers. */
  readonly positionLabel = computed(() => {
    const queue = this.queueState();
    const index = this.indexState();
    return queue && index >= 0 ? `Ayah ${index + 1} of ${queue.ayahs.length}` : '';
  });

  // --- Transport state ----------------------------------------------------

  readonly isPlaying = signal(false);

  /** True between pressing play and the first audio frame. */
  readonly isBuffering = signal(false);

  /** Set when playback fails, so the player can say why. */
  readonly error = signal<string | null>(null);

  /** Length of the current ayah in seconds, or 0 before metadata arrives. */
  readonly duration = signal(0);

  /** How far into the current ayah we are, in seconds. */
  readonly position = signal(0);

  /** 0 to 100, for the seek bar. */
  readonly progress = computed(() => {
    const total = this.duration();
    return total > 0 ? Math.min(100, (this.position() / total) * 100) : 0;
  });

  // --- Preferences --------------------------------------------------------

  private readonly settings = signal<AudioSettings>(this.restoreSettings());

  readonly volume = computed(() => this.settings().volume);
  readonly muted = computed(() => this.settings().muted);
  readonly rate = computed(() => this.settings().rate);
  readonly repeatMode = computed(() => this.settings().repeatMode);
  readonly repeatCount = computed(() => this.settings().repeatCount);

  /** The reciter in use, re-exported so the player binds to one service. */
  readonly reciter = this.reciterService.selected;

  /** How many times the current ayah has finished under "repeat ayah". */
  private readonly repeatsDone = signal(0);

  /** "2 of 3" while an ayah is repeating, empty otherwise. */
  readonly repeatProgress = computed(() =>
    this.repeatMode() === 'ayah' && this.isActive()
      ? `${this.repeatsDone() + 1} of ${this.repeatCount()}`
      : '',
  );

  constructor() {
    effect(() => {
      const current = this.settings();
      this.storage.write(STORAGE_KEYS.audio, current);
      this.applySettingsToElement(current);
    });

    // Changing reciter reloads the same ayah from the new source, keeping the
    // place in the surah and whether it was playing.
    effect(() => {
      const reciter = this.reciterService.selected();
      const ayah = this.current();

      if (ayah) {
        this.applyReciter(reciter, ayah);
      }
    });
  }

  // --- Queue registration -------------------------------------------------

  /**
   * Tells the player what the open page contains.
   *
   * Deliberately does not touch playback: opening one surah while listening to
   * another must not interrupt the recitation.
   */
  setPageQueue(queue: PlaybackQueue | null): void {
    this.pageQueue = queue;
  }

  /** True when this ayah is the one being recited right now. */
  isPlayingAyah(globalNumber: number): boolean {
    return this.isPlaying() && this.currentAyah() === globalNumber;
  }

  /** True when this ayah is loaded, whether playing or paused. */
  isCurrentAyah(globalNumber: number): boolean {
    return this.currentAyah() === globalNumber;
  }

  // --- Commands -----------------------------------------------------------

  /**
   * Plays an ayah of the open page, or pauses it if it is already the one
   * playing. This is what the play button on each ayah calls.
   */
  async toggleAyah(globalNumber: number): Promise<void> {
    if (this.currentAyah() === globalNumber) {
      await this.toggle();
      return;
    }

    const queue = this.pageQueue;
    const index = queue?.ayahs.findIndex((ayah) => ayah.globalNumber === globalNumber) ?? -1;

    if (!queue || index < 0) {
      this.logger.warn('No queue is registered for ayah', globalNumber);
      return;
    }

    await this.playFrom(queue, index);
  }

  /** Starts a queue at a given position. */
  async playFrom(queue: PlaybackQueue, index: number): Promise<void> {
    if (index < 0 || index >= queue.ayahs.length) {
      return;
    }

    this.queueState.set(queue);
    this.repeatsDone.set(0);
    await this.load(index, true);
  }

  /** Play or pause the ayah already loaded. */
  async toggle(): Promise<void> {
    if (this.isPlaying()) {
      this.pause();
      return;
    }

    if (!this.isActive()) {
      // Nothing loaded yet: start the open page from its first ayah.
      if (this.pageQueue) {
        await this.playFrom(this.pageQueue, 0);
      }

      return;
    }

    await this.resume();
  }

  pause(): void {
    this.isAdvancing = false;
    this.releaseWakeLock();
    this.element?.pause();
  }

  async next(): Promise<void> {
    if (!this.hasNext()) {
      return;
    }

    this.repeatsDone.set(0);
    if (this.wasPlaying()) {
      this.isAdvancing = true;
    }
    await this.load(this.indexState() + 1, this.wasPlaying());
  }

  /**
   * Goes back an ayah, or restarts the current one when it is already a couple
   * of seconds in - the behaviour every media player has.
   */
  async previous(): Promise<void> {
    if (this.position() > 2 || !this.hasPrevious()) {
      this.seek(0);
      return;
    }

    this.repeatsDone.set(0);
    if (this.wasPlaying()) {
      this.isAdvancing = true;
    }
    await this.load(this.indexState() - 1, this.wasPlaying());
  }

  /** Moves to a position within the current ayah, in seconds. */
  seek(seconds: number): void {
    const audio = this.element;
    const total = this.duration();

    if (!audio || total <= 0) {
      return;
    }

    const target = Math.min(total, Math.max(0, seconds));
    audio.currentTime = target;
    this.lastReportedAudioTime = target;
    this.position.set(target);
    this.publishPosition();
  }

  /** Seeks by a relative amount, used by the lock-screen skip buttons. */
  seekBy(delta: number): void {
    this.seek(this.position() + delta);
  }

  /** Retries the current ayah after a failure. */
  async retry(): Promise<void> {
    const index = this.indexState();

    if (index >= 0) {
      await this.load(index, true, { force: true });
    }
  }

  /** Stops playback and unloads the queue. The mini player disappears. */
  stop(): void {
    this.isAdvancing = false;
    this.releaseWakeLock();
    const audio = this.element;

    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    this.clearPrefetch();

    this.queueState.set(null);
    this.indexState.set(-1);
    this.isPlaying.set(false);
    this.isBuffering.set(false);
    this.error.set(null);
    this.duration.set(0);
    this.position.set(0);
    this.repeatsDone.set(0);
    this.clearMediaSession();
  }

  // --- Preference setters -------------------------------------------------

  setVolume(value: number): void {
    const volume = clamp01(value);
    // Dragging the slider up from silence is a clear intent to hear something.
    this.patchSettings({ volume, muted: volume === 0 ? this.muted() : false });
  }

  toggleMute(): void {
    this.patchSettings({ muted: !this.muted() });
  }

  setRate(value: number): void {
    if (Number.isFinite(value) && value > 0) {
      this.patchSettings({ rate: value });
    }
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatsDone.set(0);
    this.patchSettings({ repeatMode: mode });
  }

  setRepeatCount(value: number): void {
    const count = Math.round(value);

    if (!Number.isFinite(count)) {
      return;
    }

    this.repeatsDone.set(0);
    this.patchSettings({
      repeatCount: Math.min(REPEAT_COUNT.max, Math.max(REPEAT_COUNT.min, count)),
    });
  }

  selectReciter(reciter: Reciter): void {
    this.reciterService.select(reciter);
  }

  // --- Loading ------------------------------------------------------------

  /**
   * Points the element at an ayah and optionally starts it.
   *
   * `force` reloads even when the same ayah is already loaded, which is what
   * repeating an ayah and retrying after a failure both need.
   */
  private async load(
    index: number,
    autoplay: boolean,
    options: { force?: boolean } = {},
  ): Promise<void> {
    const queue = this.queueState();
    const ayah = queue?.ayahs[index];

    if (!queue || !ayah) {
      return;
    }

    const audio = this.ensureElement();
    const url = buildAyahAudioUrl(ayah.globalNumber, this.reciterService.selected());

    this.indexState.set(index);
    this.error.set(null);
    this.lastReportedAudioTime = 0;

    if (options.force || audio.src !== url) {
      this.duration.set(0);
      this.position.set(0);
      audio.src = url;
      audio.load();
    }

    this.applySettingsToElement(this.settings());
    this.updateMediaSession(ayah, queue);

    if (autoplay) {
      this.isBuffering.set(true);
      await this.start(audio);
    }
  }

  private async resume(): Promise<void> {
    const audio = this.element;

    if (!audio) {
      return;
    }

    this.error.set(null);
    this.isBuffering.set(true);
    await this.start(audio);
  }

  /** Calls play() and turns its several failure modes into something readable. */
  private async start(audio: HTMLAudioElement): Promise<void> {
    try {
      await audio.play();
    } catch (cause) {
      this.isAdvancing = false;
      this.releaseWakeLock();
      this.isBuffering.set(false);
      this.isPlaying.set(false);
      this.publishPlaybackState();

      // A play() cut short by loading another ayah is normal, not a failure.
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        this.logger.debug('Playback superseded by another ayah');
        return;
      }

      if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
        this.error.set('Your browser blocked playback. Press play again to start it.');
        return;
      }

      this.logger.warn('Could not start playback', cause);
      this.error.set('Could not play this recitation. Please try again.');
    }
  }

  /** True when a transport move should keep playing rather than just load. */
  private wasPlaying(): boolean {
    return this.isPlaying() || this.isBuffering();
  }

  /** Reloads the current ayah from a different reciter, keeping place and state. */
  private applyReciter(reciter: Reciter, ayah: PlayableAyah): void {
    const audio = this.element;

    if (!audio) {
      return;
    }

    const url = buildAyahAudioUrl(ayah.globalNumber, reciter);

    if (audio.src === url) {
      return;
    }

    const resume = this.wasPlaying();

    this.duration.set(0);
    this.position.set(0);
    this.error.set(null);
    audio.src = url;
    audio.load();
    this.primePrefetch();

    if (resume) {
      this.isBuffering.set(true);
      void this.start(audio);
    }
  }

  // --- Advancing ----------------------------------------------------------

  /**
   * Decides what happens when an ayah finishes: repeat it, move on, loop the
   * surah, or stop.
   */
  private handleEnded(): void {
    const mode = this.repeatMode();

    if (mode === 'ayah' && this.repeatsDone() + 1 < this.repeatCount()) {
      this.isAdvancing = true;
      this.repeatsDone.update((done) => done + 1);
      void this.load(this.indexState(), true, { force: true });
      return;
    }

    this.repeatsDone.set(0);

    if (this.hasNext()) {
      this.isAdvancing = true;
      void this.load(this.indexState() + 1, true);
      return;
    }

    if (mode === 'queue') {
      this.isAdvancing = true;
      void this.load(0, true);
      return;
    }

    // The end, with no repeat: stay on the last ayah so pressing play replays
    // it, rather than emptying the player out from under the reader.
    this.isAdvancing = false;
    this.isPlaying.set(false);
    this.isBuffering.set(false);
    this.position.set(this.duration());
    this.publishPlaybackState();
    this.releaseWakeLock();
    this.seek(0);
  }

  /**
   * Warms exactly the next ayah into the browser's HTTP cache.
   *
   * A second element with `preload="auto"` that is never played: it downloads
   * one file so auto-advance does not stall, and nothing beyond it.
   */
  private primePrefetch(): void {
    const queue = this.queueState();
    const next = queue?.ayahs[this.indexState() + 1];

    if (!next) {
      this.clearPrefetch();
      return;
    }

    const url = buildAyahAudioUrl(next.globalNumber, this.reciterService.selected());
    const element = (this.prefetchElement ??= new Audio());

    if (element.src === url) {
      return;
    }

    element.preload = 'auto';
    element.muted = true;
    element.src = url;
    element.load();
  }

  private clearPrefetch(): void {
    const element = this.prefetchElement;

    if (!element?.getAttribute('src')) {
      return;
    }

    element.removeAttribute('src');
    element.load();
  }

  // --- The element --------------------------------------------------------

  /** Creates the audio element on first use, so a silent reader never gets one. */
  private ensureElement(): HTMLAudioElement {
    if (this.element) {
      return this.element;
    }

    const audio = new Audio();
    // Nothing is fetched until a src is set and play is pressed.
    audio.preload = 'none';
    // Keeps recitation at its proper pitch when the speed is changed.
    audio.preservesPitch = true;

    audio.addEventListener('playing', () => {
      this.isAdvancing = false;
      this.isPlaying.set(true);
      this.isBuffering.set(false);
      this.error.set(null);
      this.primePrefetch();
      this.publishPlaybackState();
      void this.requestWakeLock();
    });

    audio.addEventListener('pause', () => {
      if (!this.isAdvancing) {
        this.isPlaying.set(false);
        this.publishPlaybackState();
        this.releaseWakeLock();
      }
    });

    audio.addEventListener('waiting', () => this.isBuffering.set(true));
    audio.addEventListener('stalled', () => this.isBuffering.set(true));

    audio.addEventListener('canplay', () => {
      if (this.isBuffering() && !audio.paused) {
        this.isBuffering.set(false);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      this.duration.set(Number.isFinite(audio.duration) ? audio.duration : 0);
      this.publishPosition();
    });

    audio.addEventListener('timeupdate', () => {
      if (this.isBuffering()) {
        this.isBuffering.set(false);
      }
      const cur = audio.currentTime;
      const delta = cur - this.lastReportedAudioTime;
      if (delta >= 5 && delta < 15) {
        this.taskService.recordAudioListening(delta);
        this.lastReportedAudioTime = cur;
      } else if (delta < 0 || delta >= 15) {
        this.lastReportedAudioTime = cur;
      }
      this.position.set(cur);
      this.publishPosition();
    });

    audio.addEventListener('ended', () => this.handleEnded());

    audio.addEventListener('error', () => {
      this.isAdvancing = false;
      this.releaseWakeLock();
      this.isPlaying.set(false);
      this.isBuffering.set(false);
      this.error.set(this.describeLoadFailure());
      this.logger.warn('Audio element reported an error', audio.error);
    });

    this.element = audio;
    this.registerMediaSessionActions();
    return audio;
  }

  /** Says what actually went wrong, rather than giving one generic message. */
  private describeLoadFailure(): string {
    const online = typeof navigator === 'undefined' || navigator.onLine;

    return online
      ? 'This recitation could not be loaded. It may be a problem with the audio service '
        + '- try again, or choose another reciter.'
      : 'You appear to be offline. Recitation audio streams from the internet.';
  }

  private applySettingsToElement(settings: AudioSettings): void {
    const audio = this.element;

    if (!audio) {
      return;
    }

    audio.volume = settings.volume;
    audio.muted = settings.muted;
    audio.defaultPlaybackRate = settings.rate;
    audio.playbackRate = settings.rate;
  }

  private patchSettings(change: Partial<AudioSettings>): void {
    this.settings.update((current) => ({ ...current, ...change }));
  }

  /** Reads stored preferences, repairing anything missing or out of range. */
  private restoreSettings(): AudioSettings {
    const stored = this.storage.read<Partial<AudioSettings>>(STORAGE_KEYS.audio, {});

    return {
      volume: isFiniteNumber(stored.volume)
        ? clamp01(stored.volume)
        : DEFAULT_AUDIO_SETTINGS.volume,
      muted: typeof stored.muted === 'boolean' ? stored.muted : DEFAULT_AUDIO_SETTINGS.muted,
      rate:
        isFiniteNumber(stored.rate) && stored.rate > 0 && stored.rate <= 4
          ? stored.rate
          : DEFAULT_AUDIO_SETTINGS.rate,
      repeatMode: isRepeatMode(stored.repeatMode)
        ? stored.repeatMode
        : DEFAULT_AUDIO_SETTINGS.repeatMode,
      repeatCount: isFiniteNumber(stored.repeatCount)
        ? Math.min(REPEAT_COUNT.max, Math.max(REPEAT_COUNT.min, Math.round(stored.repeatCount)))
        : DEFAULT_AUDIO_SETTINGS.repeatCount,
    };
  }

  // --- Media Session ------------------------------------------------------
  //
  // Puts the ayah on the phone's lock screen and wires the notification and
  // hardware controls to this service. Guarded throughout: Media Session is
  // absent on some browsers, and each action can be rejected on its own.

  private get mediaSession(): MediaSession | null {
    return typeof navigator !== 'undefined' && 'mediaSession' in navigator
      ? navigator.mediaSession
      : null;
  }

  private registerMediaSessionActions(): void {
    const session = this.mediaSession;

    if (!session) {
      return;
    }

    const handlers: readonly [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => void this.toggle()],
      ['pause', () => this.pause()],
      ['previoustrack', () => void this.previous()],
      ['nexttrack', () => void this.next()],
      ['seekbackward', () => this.seekBy(-SKIP_SECONDS)],
      ['seekforward', () => this.seekBy(SKIP_SECONDS)],
      ['seekto', (details) => this.seek(details.seekTime ?? 0)],
      ['stop', () => this.stop()],
    ];

    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // An unsupported action is not a failure; the rest still work.
      }
    }
  }

  private updateMediaSession(ayah: PlayableAyah, queue: PlaybackQueue): void {
    const session = this.mediaSession;

    if (!session || typeof MediaMetadata === 'undefined') {
      return;
    }

    const base = typeof document !== 'undefined' ? document.baseURI : '/';
    const icon192 = new URL('icons/icon-192x192.png', base).href;
    const icon512 = new URL('icons/icon-512x512.png', base).href;

    session.metadata = new MediaMetadata({
      title: `${ayah.surahEnglishName} ${ayah.surahNumber}:${ayah.numberInSurah}`,
      artist: reciterLabel(this.reciterService.selected()),
      album: queue.title,
      artwork: [
        { src: icon192, sizes: '192x192', type: 'image/png' },
        { src: icon512, sizes: '512x512', type: 'image/png' },
      ],
    });

    this.publishPlaybackState();
  }

  private publishPlaybackState(): void {
    const session = this.mediaSession;

    if (session) {
      session.playbackState = this.isPlaying() ? 'playing' : 'paused';
    }
  }

  /** Keeps the lock-screen scrubber in step with the ayah. */
  private publishPosition(): void {
    const session = this.mediaSession;
    const duration = this.duration();

    if (!session?.setPositionState || duration <= 0) {
      return;
    }

    try {
      session.setPositionState({
        duration,
        playbackRate: this.rate(),
        position: Math.min(this.position(), duration),
      });
    } catch {
      // Some browsers throw if position momentarily exceeds duration.
    }
  }

  private clearMediaSession(): void {
    const session = this.mediaSession;

    if (session) {
      session.metadata = null;
      session.playbackState = 'none';
    }
  }

  private async requestWakeLock(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (!this.wakeLockSentinel) {
          const nav = navigator as unknown as {
            wakeLock: { request: (type: string) => Promise<unknown> };
          };
          this.wakeLockSentinel = await nav.wakeLock.request('screen');
        }
      } catch {
        // Silently ignore if wakeLock is denied or unsupported
      }
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        const sentinel = this.wakeLockSentinel as { release?: () => Promise<void> };
        void sentinel.release?.();
      } catch {
        // Ignore
      }
      this.wakeLockSentinel = null;
    }
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRepeatMode(value: unknown): value is RepeatMode {
  return value === 'off' || value === 'ayah' || value === 'queue';
}

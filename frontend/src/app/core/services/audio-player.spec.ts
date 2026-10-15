import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlaybackQueue } from '../models/audio';
import { DEFAULT_RECITER, Reciter } from '../models/quran';
import { AudioPlayerService } from './audio-player';
import { ReciterService } from './reciter';
import { STORAGE_KEYS, StorageService } from './storage';

/**
 * jsdom ships no media pipeline: play(), pause() and load() are unimplemented
 * and duration is always NaN. These stubs give the service a media element that
 * behaves, so the queue, repeat and auto-advance logic can be tested for real.
 */
function stubMediaElement(): void {
  HTMLMediaElement.prototype.play = vi.fn(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });

  HTMLMediaElement.prototype.pause = vi.fn(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event('pause'));
  });

  HTMLMediaElement.prototype.load = vi.fn();
}

/** The element the service created, so a test can fire media events at it. */
function elementOf(service: AudioPlayerService): HTMLAudioElement {
  return (service as unknown as { element: HTMLAudioElement }).element;
}

/** Pretends the ayah has finished playing. */
function finish(service: AudioPlayerService): void {
  elementOf(service).dispatchEvent(new Event('ended'));
}

const surahQueue = (ayahCount: number): PlaybackQueue => ({
  id: 'surah:112',
  kind: 'surah',
  title: 'Surah Al-Ikhlas',
  ayahs: Array.from({ length: ayahCount }, (_, index) => ({
    globalNumber: 6222 + index,
    surahNumber: 112,
    numberInSurah: index + 1,
    surahEnglishName: 'Al-Ikhlas',
    surahArabicName: 'سُورَةُ الإِخْلَاصِ',
  })),
});

describe('AudioPlayerService', () => {
  let service: AudioPlayerService;

  const create = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return TestBed.inject(AudioPlayerService);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    stubMediaElement();
    service = create();
  });

  // --- Nothing before play ------------------------------------------------

  it('creates no audio element until something is played', () => {
    service.setPageQueue(surahQueue(4));

    expect(elementOf(service)).toBeUndefined();
    expect(service.isActive()).toBe(false);
  });

  it('never fetches ahead of the reader: preload is off on the element', async () => {
    await service.playFrom(surahQueue(4), 0);

    expect(elementOf(service).preload).toBe('none');
  });

  // --- The queue ----------------------------------------------------------

  it('plays an ayah of the registered page queue', async () => {
    service.setPageQueue(surahQueue(4));
    await service.toggleAyah(6224);

    expect(service.currentAyah()).toBe(6224);
    expect(service.isPlaying()).toBe(true);
    expect(service.positionLabel()).toBe('Ayah 3 of 4');
  });

  it('does nothing when no page has registered a queue', async () => {
    await service.toggleAyah(6224);

    expect(service.isActive()).toBe(false);
  });

  it('pauses when the ayah already playing is pressed again', async () => {
    service.setPageQueue(surahQueue(4));
    await service.toggleAyah(6222);
    await service.toggleAyah(6222);

    expect(service.isPlaying()).toBe(false);
    // Still loaded, so pressing play resumes rather than restarting the surah.
    expect(service.currentAyah()).toBe(6222);
  });

  it('does not interrupt playback when another page registers its queue', async () => {
    service.setPageQueue(surahQueue(4));
    await service.toggleAyah(6222);

    service.setPageQueue({ ...surahQueue(3), id: 'surah:113' });

    expect(service.isPlaying()).toBe(true);
    expect(service.queue()?.id).toBe('surah:112');
  });

  it('builds the audio URL from the selected reciter', async () => {
    await service.playFrom(surahQueue(4), 0);

    expect(elementOf(service).src).toBe(
      `https://cdn.islamic.network/quran/audio/128/${DEFAULT_RECITER.identifier}/6222.mp3`,
    );
  });

  // --- Transport ----------------------------------------------------------

  it('moves to the next ayah and knows when there is none', async () => {
    await service.playFrom(surahQueue(2), 0);

    expect(service.hasNext()).toBe(true);
    await service.next();
    expect(service.currentAyah()).toBe(6223);
    expect(service.hasNext()).toBe(false);

    await service.next();
    expect(service.currentAyah()).toBe(6223);
  });

  it('steps back an ayah when the current one has only just started', async () => {
    await service.playFrom(surahQueue(3), 2);
    await service.previous();

    expect(service.currentAyah()).toBe(6223);
  });

  // --- Auto-advance and repeat -------------------------------------------

  it('advances to the next ayah when one finishes', async () => {
    await service.playFrom(surahQueue(3), 0);
    finish(service);

    expect(service.currentAyah()).toBe(6223);
    expect(service.isPlaying()).toBe(true);
  });

  it('stops at the end of the surah, staying on the last ayah', async () => {
    await service.playFrom(surahQueue(2), 1);
    finish(service);

    expect(service.currentAyah()).toBe(6223);
    expect(service.isPlaying()).toBe(false);
  });

  it('repeats one ayah the requested number of times, then moves on', async () => {
    service.setRepeatMode('ayah');
    service.setRepeatCount(3);
    await service.playFrom(surahQueue(3), 0);

    finish(service); // first repeat
    expect(service.currentAyah()).toBe(6222);
    expect(service.repeatProgress()).toBe('2 of 3');

    finish(service); // second repeat
    expect(service.currentAyah()).toBe(6222);
    expect(service.repeatProgress()).toBe('3 of 3');

    finish(service); // third play done - on to the next ayah
    expect(service.currentAyah()).toBe(6223);
    expect(service.repeatProgress()).toBe('1 of 3');
  });

  it('starts the surah again at the end when repeating the whole queue', async () => {
    service.setRepeatMode('queue');
    await service.playFrom(surahQueue(2), 1);
    finish(service);

    expect(service.currentAyah()).toBe(6222);
    expect(service.isPlaying()).toBe(true);
  });

  it('clamps the repeat count to a sensible range', () => {
    service.setRepeatCount(1);
    expect(service.repeatCount()).toBe(2);

    service.setRepeatCount(500);
    expect(service.repeatCount()).toBe(20);
  });

  // --- Reciter ------------------------------------------------------------

  it('reloads the current ayah from the new reciter without losing its place', async () => {
    const abdulBasit: Reciter = {
      identifier: 'ar.abdulbasitmurattal',
      name: 'عبد الباسط عبد الصمد المرتل',
      englishName: 'Abdul Basit Abdus-Samad',
      style: 'Murattal',
      bitrate: 64,
    };

    service.setPageQueue(surahQueue(4));
    await service.toggleAyah(6224);

    TestBed.inject(ReciterService).select(abdulBasit);
    TestBed.tick();

    // Same ayah, new source, and the bitrate is the one that reciter is stored at.
    expect(service.currentAyah()).toBe(6224);
    expect(elementOf(service).src).toBe(
      'https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/6224.mp3',
    );
  });

  // --- Failure ------------------------------------------------------------

  it('surfaces a clear message when the audio fails to load', async () => {
    await service.playFrom(surahQueue(2), 0);
    elementOf(service).dispatchEvent(new Event('error'));

    expect(service.isPlaying()).toBe(false);
    expect(service.error()).toBeTruthy();
    expect(service.error()).toContain('could not be loaded');
  });

  it('clears the error and reloads the same ayah on retry', async () => {
    await service.playFrom(surahQueue(2), 0);
    elementOf(service).dispatchEvent(new Event('error'));

    await service.retry();

    expect(service.error()).toBeNull();
    expect(service.currentAyah()).toBe(6222);
  });

  // --- Preferences --------------------------------------------------------

  it('persists volume, speed and repeat, and restores them', () => {
    service.setVolume(0.4);
    service.setRate(1.5);
    service.setRepeatMode('ayah');
    TestBed.tick();

    TestBed.resetTestingModule();
    stubMediaElement();
    const restored = create();

    expect(restored.volume()).toBeCloseTo(0.4);
    expect(restored.rate()).toBe(1.5);
    expect(restored.repeatMode()).toBe('ayah');
  });

  it('repairs stored preferences that are out of range or corrupt', () => {
    TestBed.inject(StorageService).write(STORAGE_KEYS.audio, {
      volume: 42,
      rate: -1,
      repeatMode: 'sideways',
      repeatCount: 900,
    });

    TestBed.resetTestingModule();
    stubMediaElement();
    const restored = create();

    expect(restored.volume()).toBe(1);
    expect(restored.rate()).toBe(1);
    expect(restored.repeatMode()).toBe('off');
    expect(restored.repeatCount()).toBe(20);
  });

  it('unmutes when the volume is dragged up from silence', () => {
    service.toggleMute();
    expect(service.muted()).toBe(true);

    service.setVolume(0.6);
    expect(service.muted()).toBe(false);
  });

  // --- Stopping -----------------------------------------------------------

  it('empties the player when it is closed', async () => {
    await service.playFrom(surahQueue(3), 1);
    service.stop();

    expect(service.isActive()).toBe(false);
    expect(service.currentAyah()).toBeNull();
    expect(service.isPlaying()).toBe(false);
  });
});

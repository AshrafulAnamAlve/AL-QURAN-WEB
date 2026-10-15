import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  PLAYBACK_RATES,
  REPEAT_COUNT,
  REPEAT_MODES,
  RepeatMode,
} from '../../../core/models/audio';
import { AudioPlayerService } from '../../../core/services/audio-player';
import { ReciterService, reciterLabel } from '../../../core/services/reciter';
import { IconComponent } from '../icon/icon';

/**
 * The recitation player: transport, seek bar, volume, speed, repeat and reciter.
 *
 * It is bound to {@link AudioPlayerService} rather than to inputs, because the
 * thing it controls is app-wide and there is exactly one of it. That also means
 * this component can be dropped anywhere - the sticky mini player today, the
 * Settings page later - without wiring state through the tree.
 *
 * The panel with speed, repeat and reciter is collapsed by default. The bar
 * should be a strip at the bottom of a reading screen, not a control desk.
 */
@Component({
  selector: 'aq-audio-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
})
export class AudioPlayerComponent {
  private readonly player = inject(AudioPlayerService);
  private readonly reciterService = inject(ReciterService);

  protected readonly rates = PLAYBACK_RATES;
  protected readonly repeatModes = REPEAT_MODES;
  protected readonly repeatLimits = REPEAT_COUNT;

  protected readonly isPlaying = this.player.isPlaying;
  protected readonly isBuffering = this.player.isBuffering;
  protected readonly error = this.player.error;
  protected readonly duration = this.player.duration;
  protected readonly position = this.player.position;
  protected readonly hasPrevious = this.player.hasPrevious;
  protected readonly hasNext = this.player.hasNext;
  protected readonly positionLabel = this.player.positionLabel;
  protected readonly repeatProgress = this.player.repeatProgress;
  protected readonly volume = this.player.volume;
  protected readonly muted = this.player.muted;
  protected readonly rate = this.player.rate;
  protected readonly repeatMode = this.player.repeatMode;
  protected readonly repeatCount = this.player.repeatCount;
  protected readonly current = this.player.current;
  protected readonly queue = this.player.queue;

  protected readonly reciters = this.reciterService.options;
  protected readonly reciterStatus = this.reciterService.status;
  protected readonly reciterName = this.reciterService.selectedLabel;
  protected readonly selectedReciterId = computed(() => this.reciterService.selected().identifier);

  /** Whether the speed / repeat / reciter panel is open. */
  protected readonly panelOpen = signal(false);

  /** "2:255 · Al-Baqarah", the line naming what is being recited. */
  protected readonly title = computed(() => {
    const ayah = this.current();
    return ayah ? `${ayah.surahNumber}:${ayah.numberInSurah}` : '';
  });

  protected readonly subtitle = computed(() => this.current()?.surahEnglishName ?? '');

  protected readonly playLabel = computed(() =>
    this.isPlaying() ? 'Pause the recitation' : 'Play the recitation',
  );

  protected readonly muteLabel = computed(() => (this.muted() ? 'Unmute' : 'Mute'));

  protected readonly elapsed = computed(() => formatTime(this.position()));
  protected readonly total = computed(() => formatTime(this.duration()));

  /** Seek bar maximum. 0 while metadata is still loading, which disables it. */
  protected readonly seekMax = computed(() => Math.max(0, Math.floor(this.duration())));

  /** "Repeat surah" or "Repeat juz", depending on what is queued. */
  protected readonly repeatAllLabel = computed(() =>
    this.queue()?.kind === 'juz' ? 'Repeat juz' : 'Repeat surah',
  );

  protected readonly repeatSummary = computed(() => {
    switch (this.repeatMode()) {
      case 'ayah':
        return `Repeating each ayah ${this.repeatCount()} times`;
      case 'queue':
        return this.repeatAllLabel();
      default:
        return 'No repeat';
    }
  });

  togglePanel(): void {
    const opening = !this.panelOpen();
    this.panelOpen.set(opening);

    // The reciter list is fetched only when someone actually opens the picker.
    if (opening) {
      this.reciterService.loadList();
    }
  }

  async togglePlay(): Promise<void> {
    await this.player.toggle();
  }

  async previous(): Promise<void> {
    await this.player.previous();
  }

  async next(): Promise<void> {
    await this.player.next();
  }

  async retry(): Promise<void> {
    await this.player.retry();
  }

  onSeek(event: Event): void {
    this.player.seek(readNumber(event));
  }

  onVolume(event: Event): void {
    this.player.setVolume(readNumber(event) / 100);
  }

  toggleMute(): void {
    this.player.toggleMute();
  }

  setRate(value: number): void {
    this.player.setRate(value);
  }

  setRepeatMode(mode: RepeatMode): void {
    this.player.setRepeatMode(mode);
  }

  onRepeatCount(event: Event): void {
    this.player.setRepeatCount(readNumber(event));
  }

  onReciter(event: Event): void {
    this.reciterService.selectById((event.target as HTMLSelectElement).value);
  }

  retryReciters(): void {
    this.reciterService.loadList();
  }

  protected label(identifier: string): string {
    const match = this.reciters().find((reciter) => reciter.identifier === identifier);
    return match ? reciterLabel(match) : identifier;
  }
}

function readNumber(event: Event): number {
  return Number((event.target as HTMLInputElement).value);
}

/** m:ss. Ayahs are seconds to a few minutes, so hours never appear. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;

  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

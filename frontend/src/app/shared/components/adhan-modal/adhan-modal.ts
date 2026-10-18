import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AdhanVoiceId, AdhanVoiceOption } from '../../../core/models/prayer-notification';
import { LanguageService } from '../../../core/services/language';
import { PrayerNotificationService } from '../../../core/services/prayer-notification';
import { PrayerTimesService } from '../../../core/services/prayer';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'aq-adhan-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './adhan-modal.html',
  styleUrl: './adhan-modal.scss',
})
export class AdhanModalComponent implements OnInit, OnDestroy {
  protected readonly notificationService = inject(PrayerNotificationService);
  protected readonly prayerTimes = inject(PrayerTimesService);
  protected readonly language = inject(LanguageService);
  private readonly el = inject(ElementRef);

  readonly state = this.notificationService.activeAdhanModal;
  readonly isBn = this.language.isBn;
  readonly voices = this.notificationService.voices;
  readonly nextPrayer = this.prayerTimes.nextPrayer;
  protected readonly Math = Math;

  // Audio state signals
  protected readonly isPlaying = signal<boolean>(false);
  protected readonly isMuted = signal<boolean>(false);
  protected readonly volume = signal<number>(0.8);
  protected readonly currentTime = signal<number>(0);
  protected readonly duration = signal<number>(0);
  protected readonly audioError = signal<string | null>(null);

  protected readonly currentVoiceId = signal<AdhanVoiceId>(
    this.notificationService.settings().adhanVoice,
  );

  protected readonly selectedVoice = computed<AdhanVoiceOption>(() => {
    const id = this.currentVoiceId();
    return this.voices.find((v) => v.id === id) ?? this.voices[0];
  });

  private audio: HTMLAudioElement | null = null;

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.dismiss();
    } else if (event.key === ' ' && (event.target === document.body || event.target === this.el.nativeElement)) {
      event.preventDefault();
      this.togglePlay();
    } else if (event.key.toLowerCase() === 'm' && (event.target === document.body || event.target === this.el.nativeElement)) {
      event.preventDefault();
      this.toggleMute();
    }
  }

  ngOnInit(): void {
    const modal = this.state();
    const shouldStartMuted =
      modal?.startMuted !== undefined
        ? modal.startMuted
        : this.notificationService.settings().defaultMuted;

    this.isMuted.set(shouldStartMuted);

    const initialVol = this.notificationService.settings().volume;
    this.volume.set(initialVol);

    this.initAudio(shouldStartMuted, initialVol);
  }

  ngOnDestroy(): void {
    this.destroyAudio();
  }

  formatTime(secs: number): string {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return this.isBn() ? this.prayerTimes.toBnDigits(formatted) : formatted;
  }

  private resolveAudioUrl(relPath: string): string {
    if (relPath.startsWith('http://') || relPath.startsWith('https://')) {
      return relPath;
    }
    if (typeof document !== 'undefined') {
      const base = document.baseURI || '/';
      return new URL(relPath, base).href;
    }
    return relPath;
  }

  private initAudio(startMuted: boolean, vol: number): void {
    if (typeof window === 'undefined') return;

    this.destroyAudio();
    this.audioError.set(null);

    const voice = this.selectedVoice();
    const url = this.resolveAudioUrl(voice.audioUrl);

    try {
      this.audio = new Audio(url);
      this.audio.preload = 'auto';
      this.audio.muted = startMuted;
      this.audio.volume = vol;

      this.audio.addEventListener('play', () => this.isPlaying.set(true));
      this.audio.addEventListener('pause', () => this.isPlaying.set(false));
      this.audio.addEventListener('ended', () => {
        this.isPlaying.set(false);
        this.currentTime.set(0);
      });
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          this.currentTime.set(this.audio.currentTime);
          this.duration.set(this.audio.duration || 0);
        }
      });
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          this.duration.set(this.audio.duration || 0);
        }
      });
      this.audio.addEventListener('error', () => {
        this.audioError.set(
          this.isBn()
            ? 'অডিও স্ট্রিম লোড করা যায়নি। অনুগ্রহ করে বিকল্প সুর নির্বাচন করুন।'
            : 'Audio stream failed to load. Please choose another voice option.',
        );
        this.isPlaying.set(false);
      });

      // Attempt playback
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser autoplay blocks unmuted audio, fallback to muted or paused
          if (!startMuted && this.audio) {
            this.audio.muted = true;
            this.isMuted.set(true);
            this.audio.play().catch(() => {
              this.isPlaying.set(false);
            });
          } else {
            this.isPlaying.set(false);
          }
        });
      }
    } catch (e) {
      this.audioError.set('Could not initialize audio player');
    }
  }

  private destroyAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
    this.isPlaying.set(false);
  }

  togglePlay(): void {
    if (!this.audio) {
      this.initAudio(this.isMuted(), this.volume());
      return;
    }
    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }

  toggleMute(): void {
    if (!this.audio) return;
    const nextMuted = !this.isMuted();
    this.audio.muted = nextMuted;
    this.isMuted.set(nextMuted);

    if (!nextMuted && !this.isPlaying()) {
      this.audio.play().catch(() => {});
    }
  }

  unmuteAdhan(): void {
    if (!this.audio) return;
    this.audio.muted = false;
    this.isMuted.set(false);
    if (!this.isPlaying()) {
      this.audio.play().catch(() => {});
    }
  }

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const target = parseFloat(input.value);
    if (this.audio && !isNaN(target)) {
      this.audio.currentTime = target;
      this.currentTime.set(target);
    }
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value);
    this.volume.set(val);
    if (this.audio) {
      this.audio.volume = val;
      if (val > 0 && this.isMuted()) {
        this.audio.muted = false;
        this.isMuted.set(false);
      }
    }
    this.notificationService.setVolume(val);
  }

  onVoiceSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const voiceId = select.value as AdhanVoiceId;
    this.currentVoiceId.set(voiceId);
    this.notificationService.setAdhanVoice(voiceId);

    // Re-initialize audio with current settings and play
    this.initAudio(this.isMuted(), this.volume());
  }

  snooze(): void {
    this.destroyAudio();
    this.notificationService.snooze(10);
  }

  dismiss(): void {
    this.destroyAudio();
    this.notificationService.closeAdhanModal();
  }
}

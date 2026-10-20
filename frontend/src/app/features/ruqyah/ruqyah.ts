import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RuqyahAudioTrack,
  RuqyahCategory,
  RuqyahItem,
} from '../../core/models/ruqyah';
import { LanguageService } from '../../core/services/language';
import { RuqyahService } from '../../core/services/ruqyah';
import { SeoService } from '../../core/services/seo';
import { ShareService } from '../../core/services/share';
import { IconComponent } from '../../shared/components/icon/icon';

export type RuqyahTab = 'reading' | 'audio' | 'guide';

@Component({
  selector: 'aq-ruqyah',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './ruqyah.html',
  styleUrls: ['./ruqyah.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuqyahPage implements OnInit, OnDestroy {
  readonly ruqyahService = inject(RuqyahService);
  readonly lang = inject(LanguageService);
  readonly shareService = inject(ShareService);
  private readonly seo = inject(SeoService);

  readonly isBn = this.lang.isBn;

  // Active sub-view tab
  readonly activeTab = signal<RuqyahTab>('reading');

  // Local search query input for instant binding
  readonly searchInput = signal<string>('');

  // Toast notification
  readonly toastMessage = signal<string | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Audio sleep timer dropdown open state
  readonly showTimerMenu = signal<boolean>(false);
  readonly showSpeedMenu = signal<boolean>(false);

  // Sleep timer presets in minutes
  readonly sleepOptions: readonly (number | null)[] = [null, 15, 30, 45, 60];
  readonly speedOptions: readonly number[] = [0.75, 1.0, 1.25, 1.5];

  // Service forwardings
  readonly categories = this.ruqyahService.categories;
  readonly selectedCategory = this.ruqyahService.selectedCategory;
  readonly filteredItems = this.ruqyahService.filteredItems;
  readonly totalCompletedCount = this.ruqyahService.totalCompletedCount;
  readonly bookmarksCount = this.ruqyahService.bookmarksCount;
  readonly showBookmarksOnly = this.ruqyahService.showBookmarksOnly;
  readonly audioTracks = this.ruqyahService.audioTracks;
  readonly guides = this.ruqyahService.guides;

  // Audio signals
  readonly activeTrack = this.ruqyahService.activeTrack;
  readonly isPlaying = this.ruqyahService.isPlaying;
  readonly currentTime = this.ruqyahService.currentTime;
  readonly duration = this.ruqyahService.duration;
  readonly isLooping = this.ruqyahService.isLooping;
  readonly playbackRate = this.ruqyahService.playbackRate;
  readonly sleepTimerMinutes = this.ruqyahService.sleepTimerMinutes;
  readonly sleepTimerRemainingSeconds = this.ruqyahService.sleepTimerRemainingSeconds;
  readonly audioError = this.ruqyahService.audioError;

  readonly formattedCurrentTime = computed(() =>
    this.formatSeconds(this.currentTime())
  );
  readonly formattedDuration = computed(() =>
    this.formatSeconds(this.duration())
  );
  readonly audioProgressPercent = computed(() => {
    const dur = this.duration();
    if (dur <= 0) return 0;
    return Math.min(100, (this.currentTime() / dur) * 100);
  });

  readonly timerCountdownDisplay = computed(() => {
    const secs = this.sleepTimerRemainingSeconds();
    if (secs === null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const str = `${m}:${s < 10 ? '0' : ''}${s}`;
    return this.isBn() ? this.toBnDigits(str) : str;
  });

  ngOnInit(): void {
    this.seo.apply({
      title: this.isBn()
        ? 'রুকইয়াহ আশ-শারইয়াহ — অডিও ও বিশুদ্ধ আমল'
        : 'Ruqyah Shariah — Authentic Audio & Verses',
      description: this.isBn()
        ? 'রোগমুক্তি, বদনজর, যাদু ও মানসিক অশান্তি দূরীকরণে পবিত্র কুরআন ও সহিহ হাদিসের বিশুদ্ধ রুকইয়াহ। প্রখ্যাত ক্বারিদের অডিও ও ট্যাপ কাউন্টার।'
        : 'Authentic Islamic Ruqyah Shariah for physical healing, evil eye protection, anxiety relief, with high quality reciter audio and counters.',
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  setTab(tab: RuqyahTab): void {
    this.activeTab.set(tab);
  }

  selectCategory(cat: RuqyahCategory): void {
    this.ruqyahService.setCategory(cat);
  }

  onCategorySelectChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as RuqyahCategory;
    this.selectCategory(val);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchInput.set(val);
    this.ruqyahService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.ruqyahService.setSearchQuery('');
  }

  toggleBookmarksOnly(): void {
    this.ruqyahService.toggleBookmarksOnly();
  }

  resetFilters(): void {
    this.searchInput.set('');
    this.ruqyahService.resetFilters();
  }

  // Counter & Bookmarks
  getItemCount(id: string): number {
    return this.ruqyahService.getItemCount(id);
  }

  onCardTap(item: RuqyahItem): void {
    this.ruqyahService.incrementCounter(item.id, item.targetCount);
  }

  resetCounter(event: Event, id: string): void {
    event.stopPropagation();
    this.ruqyahService.resetCounter(id);
  }

  toggleBookmark(event: Event, id: string): void {
    event.stopPropagation();
    this.ruqyahService.toggleBookmark(id);
    const added = this.ruqyahService.isBookmarked(id);
    this.showToast(
      added
        ? (this.isBn() ? 'বুকমার্কে যোগ করা হয়েছে' : 'Saved to bookmarks')
        : (this.isBn() ? 'বুকমার্ক থেকে সরানো হয়েছে' : 'Removed from bookmarks')
    );
  }

  copyItem(event: Event, item: RuqyahItem): void {
    event.stopPropagation();
    const text = `${item.titleBn}\n\n${item.arabic}\n\nউচ্চারণ: ${item.pronunciationBn}\n\nঅনুবাদ: ${item.translationBn}\n\nরেফারেন্স: ${item.reference}\n(আল-কুরআন ওয়েব - রুকইয়াহ আশ-শারইয়াহ)`;
    this.shareService.copy(text).then((ok) => {
      if (ok) {
        this.showToast(this.isBn() ? 'অনুলিপি করা হয়েছে!' : 'Copied to clipboard!');
      }
    });
  }

  // Audio Controls
  playTrack(track: RuqyahAudioTrack): void {
    this.ruqyahService.playTrack(track);
  }

  togglePlayPause(): void {
    this.ruqyahService.togglePlayPause();
  }

  toggleLoop(): void {
    this.ruqyahService.toggleLoop();
  }

  skip(delta: number): void {
    this.ruqyahService.skipBy(delta);
  }

  onSeekChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.ruqyahService.seek(val);
  }

  setSleepTimer(minutes: number | null): void {
    this.ruqyahService.setSleepTimer(minutes);
    this.showTimerMenu.set(false);
    if (minutes) {
      this.showToast(
        this.isBn()
          ? `${this.toBnDigits(minutes)} মিনিটের স্লিপ টাইমার সেট করা হয়েছে`
          : `Sleep timer set for ${minutes} min`
      );
    } else {
      this.showToast(this.isBn() ? 'স্লিপ টাইমার বাতিল করা হয়েছে' : 'Sleep timer cancelled');
    }
  }

  setPlaybackRate(rate: number): void {
    this.ruqyahService.setPlaybackRate(rate);
    this.showSpeedMenu.set(false);
  }

  // Formatters
  formatSeconds(totalSeconds: number): string {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) {
      return '0:00';
    }
    const secs = Math.floor(totalSeconds);
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainder = secs % 60;
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    let res = '';
    if (hours > 0) {
      res = `${hours}:${pad(mins)}:${pad(remainder)}`;
    } else {
      res = `${mins}:${pad(remainder)}`;
    }
    return this.isBn() ? this.toBnDigits(res) : res;
  }

  toBnDigits(val: string | number): string {
    const map: Record<string, string> = {
      '0': '০',
      '1': '১',
      '2': '২',
      '3': '৩',
      '4': '৪',
      '5': '৫',
      '6': '৬',
      '7': '৭',
      '8': '৮',
      '9': '৯',
    };
    return String(val).replace(/[0-9]/g, (ch) => map[ch] || ch);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 2800);
  }
}

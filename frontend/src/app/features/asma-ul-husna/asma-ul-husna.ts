import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AllahName } from '../../core/models/asma-ul-husna';
import { AsmaUlHusnaService, NamesFilterTab } from '../../core/services/asma-ul-husna';
import { LanguageService } from '../../core/services/language';
import { ShareService } from '../../core/services/share';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'aq-asma-ul-husna-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './asma-ul-husna.html',
  styleUrl: './asma-ul-husna.scss',
})
export class AsmaUlHusnaPage {
  protected readonly namesService = inject(AsmaUlHusnaService);
  protected readonly language = inject(LanguageService);
  private readonly shareService = inject(ShareService);

  readonly isBn = this.language.isBn;

  // Search input binding
  readonly searchInput = signal<string>('');

  // Toast notification for copy/share
  readonly toastMessage = signal<string | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Expose service signals
  readonly supremeName = this.namesService.supremeName;
  readonly filteredNames = this.namesService.filteredNames;
  readonly filterTab = this.namesService.filterTab;
  readonly bookmarkedCount = this.namesService.bookmarkedCount;
  readonly activePlayingNumber = this.namesService.activePlayingNumber;
  readonly isPlaying = this.namesService.isPlaying;
  readonly isPlayingAll = this.namesService.isPlayingAll;
  readonly activePlayingName = this.namesService.activePlayingName;
  readonly playbackProgress = this.namesService.playbackProgress;
  readonly selectedName = this.namesService.selectedName;

  // Track search results count text
  readonly resultCountText = computed(() => {
    const count = this.filteredNames().length;
    const total = this.namesService.allNames.length;
    if (this.isBn()) {
      return `মোট ${this.toBnDigits(total)}টি নামের মধ্যে ${this.toBnDigits(count)}টি দেখানো হচ্ছে`;
    }
    return `Showing ${count} of ${total} names`;
  });

  constructor() {
    // Auto-scroll active card into view when playing in sequence
    effect(() => {
      const activeNum = this.activePlayingNumber();
      const playingAll = this.isPlayingAll();
      if (activeNum !== null && playingAll && activeNum > 0) {
        if (typeof document !== 'undefined') {
          const el = document.getElementById(`name-card-${activeNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.selectedName()) {
      this.closeDetail();
    }
  }

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchInput.set(val);
    this.namesService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.namesService.setSearchQuery('');
  }

  setTab(tab: NamesFilterTab): void {
    this.namesService.setFilterTab(tab);
  }

  isBookmarked(num: number): boolean {
    return this.namesService.isBookmarked(num);
  }

  toggleBookmark(event: Event, num: number): void {
    event.stopPropagation();
    this.namesService.toggleBookmark(num);
    const added = this.isBookmarked(num);
    const msg = this.isBn()
      ? added
        ? 'নামটি সংরক্ষিত তালিকায় যুক্ত হয়েছে'
        : 'সংরক্ষিত তালিকা থেকে সরানো হয়েছে'
      : added
        ? 'Saved to contemplated list'
        : 'Removed from bookmarks';
    this.showToast(msg);
  }

  playName(event: Event, name: AllahName): void {
    event.stopPropagation();
    this.namesService.playName(name);
  }

  playAll(): void {
    this.namesService.playAll();
  }

  pauseAudio(): void {
    this.namesService.pause();
  }

  resumeAudio(): void {
    this.namesService.resume();
  }

  stopAudio(): void {
    this.namesService.stop();
  }

  nextTrack(): void {
    this.namesService.next();
  }

  prevTrack(): void {
    this.namesService.previous();
  }

  openDetail(name: AllahName): void {
    this.namesService.openDetail(name);
  }

  closeDetail(): void {
    this.namesService.closeDetail();
  }

  async copyOrShareName(event: Event, name: AllahName): Promise<void> {
    event.stopPropagation();
    const bnText = `${name.arabic} (${name.nameBn} — ${name.meaningBn})\n${name.transliteration} — ${name.meaningEn}\nকুরআনিক রেফারেন্স: ${name.quranReference}\n\nআল-কুরআন অ্যাপ`;
    const enText = `${name.arabic} (${name.transliteration} — ${name.meaningEn})\n${name.nameBn} — ${name.meaningBn}\nQuran Reference: ${name.quranReference}\n\nAl-Quran App`;
    const shareText = this.isBn() ? bnText : enText;

    const ok = await this.shareService.copy(shareText);
    if (ok) {
      this.showToast(this.isBn() ? 'নামের বিবরণ অনুলিপি করা হয়েছে' : 'Copied name details to clipboard');
    }
  }

  toBnDigits(val: string | number): string {
    return String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  }

  private showToast(msg: string): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(msg);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 2800);
  }
}

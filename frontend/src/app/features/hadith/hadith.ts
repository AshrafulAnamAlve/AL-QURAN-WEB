import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HADITH_CATEGORIES, Hadith, HadithCategory } from '../../core/models/hadith';
import { HadithService } from '../../core/services/hadith';
import { LanguageService } from '../../core/services/language';
import { ShareService } from '../../core/services/share';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'aq-hadith-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './hadith.html',
  styleUrl: './hadith.scss',
})
export class HadithPage {
  protected readonly hadithService = inject(HadithService);
  protected readonly language = inject(LanguageService);
  private readonly shareService = inject(ShareService);

  readonly isBn = this.language.isBn;

  // Search input binding
  readonly searchInput = signal<string>('');
  readonly showBookmarksOnly = signal<boolean>(false);

  // Toast notification for copy/share
  readonly toastMessage = signal<string | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Data
  readonly categories = HADITH_CATEGORIES;
  readonly dailyHadith = this.hadithService.dailyHadith;
  readonly selectedCategory = this.hadithService.selectedCategory;
  readonly selectedBook = this.hadithService.selectedBook;
  readonly books = this.hadithService.books;
  readonly bookmarksCount = this.hadithService.bookmarksCount;

  // Filtered hadiths incorporating search, category, book, and bookmarks
  readonly displayedHadiths = computed<readonly Hadith[]>(() => {
    let list = this.hadithService.filteredHadiths();
    if (this.showBookmarksOnly()) {
      list = list.filter((h) => this.hadithService.isBookmarked(h.id));
    }
    return list;
  });

  readonly resultCountText = computed(() => {
    const count = this.displayedHadiths().length;
    const total = this.hadithService.allHadiths.length;
    if (this.isBn()) {
      return `মোট ${this.toBnDigits(total)}টি হাদিসের মধ্যে ${this.toBnDigits(count)}টি দেখানো হচ্ছে`;
    }
    return `Showing ${count} of ${total} Hadiths`;
  });

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchInput.set(val);
    this.hadithService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.hadithService.setSearchQuery('');
  }

  selectCategory(category: HadithCategory): void {
    this.hadithService.setCategory(category);
  }

  selectBook(book: string): void {
    this.hadithService.setBook(book);
  }

  toggleBookmarksFilter(): void {
    this.showBookmarksOnly.update((v) => !v);
  }

  resetFilters(): void {
    this.clearSearch();
    this.hadithService.setCategory('all');
    this.hadithService.setBook('all');
    this.showBookmarksOnly.set(false);
  }

  toggleBookmark(id: number): void {
    this.hadithService.toggleBookmark(id);
    const isNowBookmarked = this.hadithService.isBookmarked(id);
    const msg = this.isBn()
      ? isNowBookmarked
        ? 'হাদিসটি বুকমার্ক করা হয়েছে'
        : 'বুকমার্ক সরানো হয়েছে'
      : isNowBookmarked
        ? 'Hadith bookmarked'
        : 'Bookmark removed';
    this.showToast(msg);
  }

  async copyHadith(hadith: Hadith): Promise<void> {
    const reference = `${this.isBn() ? hadith.bookBn : hadith.book} (${this.isBn() ? this.toBnDigits(hadith.hadithNumber) : hadith.hadithNumber})`;
    const text = [
      `【 ${reference} — ${this.isBn() ? hadith.gradeBn : hadith.gradeEn} 】`,
      '',
      hadith.arabic,
      '',
      `বাংলা অনুবাদ: ${hadith.bangla}`,
      '',
      `English: ${hadith.english}`,
      '',
      `বর্ণনাকারী: ${this.isBn() ? hadith.narratorBn : hadith.narratorEn}`,
      '',
      'Al-Quran App',
    ].join('\n');

    const success = await this.shareService.copy(text);
    if (success) {
      this.showToast(this.isBn() ? 'হাদিস অনুলিপি করা হয়েছে!' : 'Hadith copied to clipboard!');
    }
  }

  async shareHadith(hadith: Hadith): Promise<void> {
    const reference = `${this.isBn() ? hadith.bookBn : hadith.book} (${this.isBn() ? this.toBnDigits(hadith.hadithNumber) : hadith.hadithNumber})`;
    const text = [
      `【 ${reference} — ${this.isBn() ? hadith.gradeBn : hadith.gradeEn} 】`,
      '',
      hadith.arabic,
      '',
      `বাংলা অনুবাদ: ${hadith.bangla}`,
      '',
      `বর্ণনাকারী: ${this.isBn() ? hadith.narratorBn : hadith.narratorEn}`,
      '',
      'Al-Quran App',
    ].join('\n');

    const view = typeof window !== 'undefined' ? window : null;
    if (view?.navigator?.share) {
      try {
        await view.navigator.share({
          title: reference,
          text,
          url: view.location.href,
        });
        this.showToast(this.isBn() ? 'শেয়ার করা হয়েছে!' : 'Shared successfully!');
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    await this.copyHadith(hadith);
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

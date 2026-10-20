import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CANONICAL_BOOKS,
  CanonicalBook,
  CanonicalHadithItem,
  HADITH_CATEGORIES,
  Hadith,
  HadithCategory,
  HadithChapter,
} from '../../core/models/hadith';
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

  // Tab state: 'curated' (selected & daily) vs 'library' (36,000+ canonical collections)
  readonly activeTab = signal<'curated' | 'library'>('curated');

  // Search input binding for Curated
  readonly searchInput = signal<string>('');
  readonly showBookmarksOnly = signal<boolean>(false);
  readonly showUnreadOnly = signal<boolean>(false);

  // Canonical Library State
  readonly canonicalBooks = CANONICAL_BOOKS;
  readonly selectedBookId = this.hadithService.selectedBookId;
  readonly selectedChapterNumber = this.hadithService.selectedChapterNumber;
  readonly chapters = this.hadithService.chapters;
  readonly canonicalHadiths = this.hadithService.canonicalHadiths;
  readonly loadingCanonical = this.hadithService.loadingCanonical;
  readonly canonicalError = this.hadithService.canonicalError;

  // Search query within current canonical chapter
  readonly canonicalSearch = signal<string>('');
  // Progressive display limit for long chapters
  readonly canonicalDisplayLimit = signal<number>(25);

  // Toast notification for copy/share
  readonly toastMessage = signal<string | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Curated Data
  readonly categories = HADITH_CATEGORIES;
  readonly dailyHadith = this.hadithService.dailyHadith;
  readonly selectedCategory = this.hadithService.selectedCategory;
  readonly selectedBook = this.hadithService.selectedBook;
  readonly books = this.hadithService.books;
  readonly bookmarksCount = this.hadithService.bookmarksCount;
  readonly readCount = this.hadithService.readCount;

  // Filtered hadiths for Curated tab
  readonly displayedHadiths = computed<readonly Hadith[]>(() => {
    let list = this.hadithService.filteredHadiths();
    if (this.showBookmarksOnly()) {
      list = list.filter((h) => this.hadithService.isBookmarked(h.id));
    }
    if (this.showUnreadOnly()) {
      list = list.filter((h) => !this.hadithService.isRead(h.id));
    }
    return list;
  });

  readonly resultCountText = computed(() => {
    const count = this.displayedHadiths().length;
    const total = this.hadithService.allHadiths().length;
    if (this.isBn()) {
      return `মোট ${this.toBnDigits(total)}টি হাদিসের মধ্যে ${this.toBnDigits(count)}টি দেখানো হচ্ছে`;
    }
    return `Showing ${count} of ${total} Hadiths`;
  });

  // Current canonical book metadata
  readonly currentCanonicalBook = computed<CanonicalBook>(() => {
    const id = this.selectedBookId();
    return this.canonicalBooks.find((b) => b.id === id) || this.canonicalBooks[0];
  });

  // Current canonical chapter metadata
  readonly currentCanonicalChapter = computed<HadithChapter | undefined>(() => {
    const num = this.selectedChapterNumber();
    return this.chapters().find((c) => c.number === num);
  });

  // Canonical hadiths filtered by search, unread filter and limited by displayLimit
  readonly displayedCanonicalHadiths = computed<readonly CanonicalHadithItem[]>(() => {
    const query = this.canonicalSearch().trim().toLowerCase();
    let items = this.canonicalHadiths();

    if (this.showUnreadOnly()) {
      items = items.filter((h) => !this.hadithService.isRead(h.id));
    }

    if (query) {
      items = items.filter((h) => {
        const matchesBangla = h.bangla.toLowerCase().includes(query);
        const matchesArabic = h.arabic.includes(query);
        const matchesNumber = String(h.hadithNumber).includes(query);
        return matchesBangla || matchesArabic || matchesNumber;
      });
    }

    return items.slice(0, this.canonicalDisplayLimit());
  });

  readonly totalCanonicalCountInChapter = computed<number>(() => {
    const query = this.canonicalSearch().trim().toLowerCase();
    let items = this.canonicalHadiths();
    if (this.showUnreadOnly()) {
      items = items.filter((h) => !this.hadithService.isRead(h.id));
    }
    if (!query) return items.length;
    return items.filter((h) => {
      const matchesBangla = h.bangla.toLowerCase().includes(query);
      const matchesArabic = h.arabic.includes(query);
      const matchesNumber = String(h.hadithNumber).includes(query);
      return matchesBangla || matchesArabic || matchesNumber;
    }).length;
  });

  // Chapter navigation indices
  readonly currentChapterIndex = computed<number>(() => {
    const num = this.selectedChapterNumber();
    return this.chapters().findIndex((c) => c.number === num);
  });

  readonly hasPrevChapter = computed<boolean>(() => this.currentChapterIndex() > 0);
  readonly hasNextChapter = computed<boolean>(() => {
    const idx = this.currentChapterIndex();
    return idx >= 0 && idx < this.chapters().length - 1;
  });

  switchTab(tab: 'curated' | 'library'): void {
    this.activeTab.set(tab);
    if (tab === 'library' && this.chapters().length === 0) {
      void this.hadithService.selectCanonicalBook(this.selectedBookId());
    }
  }

  // --- Curated Actions ---
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

  toggleUnreadFilter(): void {
    this.showUnreadOnly.update((v) => !v);
  }

  isRead(id: number | string): boolean {
    return this.hadithService.isRead(id);
  }

  toggleRead(id: number | string): void {
    this.hadithService.toggleRead(id);
    const wasRead = this.hadithService.isRead(id);
    const msg = this.isBn()
      ? wasRead
        ? 'হাদিসটি পঠিত হিসেবে চিহ্নিত করা হয়েছে'
        : 'পঠিত তালিকা থেকে সরানো হয়েছে'
      : wasRead
        ? 'Hadith marked as read'
        : 'Marked as unread';
    this.showToast(msg);
  }

  resetFilters(): void {
    this.clearSearch();
    this.hadithService.setCategory('all');
    this.hadithService.setBook('all');
    this.showBookmarksOnly.set(false);
    this.showUnreadOnly.set(false);
  }

  // --- Canonical Library Actions ---
  async selectCanonicalBook(bookId: string): Promise<void> {
    this.canonicalSearch.set('');
    this.canonicalDisplayLimit.set(25);
    await this.hadithService.selectCanonicalBook(bookId);
  }

  async onChapterChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const num = parseInt(target.value, 10);
    if (!isNaN(num)) {
      this.canonicalSearch.set('');
      this.canonicalDisplayLimit.set(25);
      await this.hadithService.selectChapter(num);
    }
  }

  async selectChapterDirect(chapterNo: number): Promise<void> {
    this.canonicalSearch.set('');
    this.canonicalDisplayLimit.set(25);
    await this.hadithService.selectChapter(chapterNo);
  }

  async prevChapter(): Promise<void> {
    const idx = this.currentChapterIndex();
    if (idx > 0) {
      const prev = this.chapters()[idx - 1];
      await this.selectChapterDirect(prev.number);
    }
  }

  async nextChapter(): Promise<void> {
    const idx = this.currentChapterIndex();
    if (idx >= 0 && idx < this.chapters().length - 1) {
      const next = this.chapters()[idx + 1];
      await this.selectChapterDirect(next.number);
    }
  }

  onCanonicalSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.canonicalSearch.set(val);
    this.canonicalDisplayLimit.set(25);
  }

  clearCanonicalSearch(): void {
    this.canonicalSearch.set('');
    this.canonicalDisplayLimit.set(25);
  }

  loadMoreCanonical(): void {
    this.canonicalDisplayLimit.update((current) => current + 25);
  }

  async retryLoadChapter(): Promise<void> {
    await this.hadithService.loadChapterHadiths(this.selectedBookId(), this.selectedChapterNumber());
  }

  // --- Bookmark, Copy, Share ---
  toggleBookmark(id: number | string): void {
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

  async copyCanonicalHadith(item: CanonicalHadithItem): Promise<void> {
    const reference = `${item.bookNameBn} (হাদিস নং ${this.toBnDigits(item.hadithNumber)}), ${item.chapterNameBn}`;
    const text = [
      `【 ${reference} — ${item.grade || 'সহিহ'} 】`,
      '',
      item.arabic ? `${item.arabic}\n` : '',
      `বাংলা অনুবাদ: ${item.bangla}`,
      '',
      'Al-Quran App',
    ].filter(Boolean).join('\n');

    const success = await this.shareService.copy(text);
    if (success) {
      this.showToast(this.isBn() ? 'হাদিস অনুলিপি করা হয়েছে!' : 'Hadith copied to clipboard!');
    }
  }

  async shareCanonicalHadith(item: CanonicalHadithItem): Promise<void> {
    const reference = `${item.bookNameBn} (হাদিস নং ${this.toBnDigits(item.hadithNumber)}), ${item.chapterNameBn}`;
    const text = [
      `【 ${reference} — ${item.grade || 'সহিহ'} 】`,
      '',
      item.arabic ? `${item.arabic}\n` : '',
      `বাংলা অনুবাদ: ${item.bangla}`,
      '',
      'Al-Quran App',
    ].filter(Boolean).join('\n');

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
        // Fallback to copy
      }
    }

    await this.copyCanonicalHadith(item);
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

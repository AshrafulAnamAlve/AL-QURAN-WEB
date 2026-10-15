import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Bookmark } from '../../core/models/bookmark';
import { PlaybackQueue } from '../../core/models/audio';
import { AudioPlayerService } from '../../core/services/audio-player';
import { BookmarkService } from '../../core/services/bookmarks';
import { ShareService } from '../../core/services/share';
import { foldForSearch } from '../../core/utils/text';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'aq-bookmarks-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    EmptyStateComponent,
    FilterFieldComponent,
  ],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.scss',
})
export class BookmarksPage {
  private readonly bookmarksService = inject(BookmarkService);
  private readonly audio = inject(AudioPlayerService);
  private readonly share = inject(ShareService);

  readonly query = signal('');
  readonly confirmClearOpen = signal(false);

  /** Transient copy/share status banner for an ayah. */
  readonly feedback = signal<{ id: number; msg: string } | null>(null);

  readonly totalBookmarks = this.bookmarksService.bookmarks;
  readonly count = this.bookmarksService.count;

  /** Filtered list based on search term. */
  readonly filteredBookmarks = computed(() => {
    const list = this.totalBookmarks();
    const q = foldForSearch(this.query());

    if (!q) {
      return list;
    }

    return list.filter((b) => {
      const matchSurah = foldForSearch(b.surahEnglishName).includes(q)
        || foldForSearch(b.surahBanglaName).includes(q);
      const matchRef = `${b.surahNumber}:${b.ayahNumber}`.includes(q);
      const matchText = foldForSearch(b.arabic).includes(q)
        || foldForSearch(b.translation).includes(q);

      return matchSurah || matchRef || matchText;
    });
  });

  isPlaying(globalNumber: number): boolean {
    return this.audio.isPlayingAyah(globalNumber);
  }

  isCurrent(globalNumber: number): boolean {
    return this.audio.isCurrentAyah(globalNumber);
  }

  async togglePlay(b: Bookmark): Promise<void> {
    if (this.audio.currentAyah() === b.globalNumber) {
      await this.audio.toggle();
      return;
    }

    const queue: PlaybackQueue = {
      id: `bookmark:${b.globalNumber}`,
      kind: 'surah',
      title: `${b.surahEnglishName} ${b.surahNumber}:${b.ayahNumber}`,
      ayahs: [
        {
          globalNumber: b.globalNumber,
          surahNumber: b.surahNumber,
          numberInSurah: b.ayahNumber,
          surahEnglishName: b.surahEnglishName,
          surahArabicName: '',
        },
      ],
    };

    await this.audio.playFrom(queue, 0);
  }

  remove(globalNumber: number): void {
    this.bookmarksService.remove(globalNumber);
  }

  askClearAll(): void {
    this.confirmClearOpen.set(true);
  }

  cancelClear(): void {
    this.confirmClearOpen.set(false);
  }

  confirmClear(): void {
    this.bookmarksService.clear();
    this.confirmClearOpen.set(false);
  }

  async copy(b: Bookmark): Promise<void> {
    const ok = await this.share.copyAyah({
      surahEnglishName: b.surahEnglishName,
      surahNumber: b.surahNumber,
      ayahNumber: b.ayahNumber,
      arabic: b.arabic,
      translations: b.translation ? [b.translation] : [],
    });

    this.flash(b.globalNumber, ok ? 'Copied' : 'Failed to copy');
  }

  async shareAyah(b: Bookmark): Promise<void> {
    const outcome = await this.share.shareAyah({
      surahEnglishName: b.surahEnglishName,
      surahNumber: b.surahNumber,
      ayahNumber: b.ayahNumber,
      arabic: b.arabic,
      translations: b.translation ? [b.translation] : [],
    });

    if (outcome !== 'failed') {
      this.flash(b.globalNumber, 'Shared');
    }
  }

  formatDate(iso: string): string {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  private flash(id: number, msg: string): void {
    this.feedback.set({ id, msg });
    setTimeout(() => {
      if (this.feedback()?.id === id) {
        this.feedback.set(null);
      }
    }, 2000);
  }
}

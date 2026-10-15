import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { dataOf, errorOf } from '../../core/models/async-state';
import { Surah } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { createAsyncResource } from '../../core/utils/async-resource';
import { foldForSearch, looseIncludes } from '../../core/utils/text';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { SurahCardComponent } from './surah-card/surah-card';

/**
 * Browse all 114 surahs.
 *
 * Filtering happens in the browser, not on the server: the whole list is 30 kB,
 * it is already cached after the first visit, and matching locally means results
 * appear as the user types with no request and no debounce needed.
 */
@Component({
  selector: 'aq-quran-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    SurahCardComponent,
    FilterFieldComponent,
    SkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './quran.html',
  styleUrl: './quran.scss',
})
export class QuranPage {
  private readonly quranApi = inject(QuranApiService);

  private readonly resource = createAsyncResource(() => this.quranApi.getSurahs());

  protected readonly busy = computed(() => {
    const status = this.resource.state().status;
    return status === 'idle' || status === 'loading';
  });

  protected readonly error = computed(() => errorOf(this.resource.state()));
  protected readonly surahs = computed(() => dataOf(this.resource.state()));

  /** Text typed into the filter box. */
  protected readonly filter = signal('');

  /** Placeholder cards shown while the list loads. */
  protected readonly skeletons = Array.from({ length: 12 }, (_, index) => index);

  /**
   * Surahs matching the filter.
   *
   * Matches the number, the English name and meaning, the Bangla name and
   * meaning, and the Arabic name - so "18", "cave", "কাহফ" and "الكهف" all find
   * Al-Kahf.
   */
  protected readonly filtered = computed<readonly Surah[]>(() => {
    const all = this.surahs() ?? [];
    const raw = this.filter().trim();

    if (!raw) {
      return all;
    }

    // Folded so punctuation and spacing do not block a match: "ali imran"
    // finds "Ali 'Imran", "al fatihah" finds "Al-Fatihah".
    const query = foldForSearch(raw);

    if (!query) {
      return all;
    }

    return all.filter((surah) =>
      // Numbers match exactly, so "1" finds Al-Fatihah rather than 1, 18 and 114.
      String(surah.number) === raw
      || looseIncludes(surah.englishName, raw)
      || looseIncludes(surah.englishMeaning, raw)
      || looseIncludes(surah.banglaName, raw)
      || looseIncludes(surah.banglaMeaning, raw)
      || surah.arabicName.includes(raw),
    );
  });

  protected readonly isFiltering = computed(() => this.filter().trim().length > 0);

  protected readonly resultLabel = computed(() => {
    const count = this.filtered().length;

    if (!this.isFiltering()) {
      return `${count} surahs`;
    }

    return count === 1 ? '1 surah matches' : `${count} surahs match`;
  });

  retry(): void {
    this.resource.reload();
  }

  clearFilter(): void {
    this.filter.set('');
  }
}

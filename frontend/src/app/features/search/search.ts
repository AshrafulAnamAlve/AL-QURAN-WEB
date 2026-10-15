import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsyncState, idle } from '../../core/models/async-state';
import { DEFAULT_TRANSLATION, SearchMatch, SearchResponse } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { ShareService } from '../../core/services/share';
import { toAsyncState } from '../../core/utils/async-state.operators';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

export interface SearchEditionOption {
  readonly id: string;
  readonly label: string;
  readonly script: 'bn' | 'en' | 'ar';
}

export const SEARCH_EDITIONS: readonly SearchEditionOption[] = [
  { id: 'bn.bengali', label: 'বাংলা (মুহিউদ্দীন খান)', script: 'bn' },
  { id: 'en.sahih', label: 'English (Sahih Intl)', script: 'en' },
  { id: 'quran-uthmani', label: 'العربية (Uthmani)', script: 'ar' },
];

export const SEARCH_SUGGESTIONS = [
  { label: 'Ayat al-Kursi (2:255)', query: '2:255' },
  { label: 'Surah Al-Kahf', query: 'kahf' },
  { label: 'দয়া (Mercy)', query: 'দয়া' },
  { label: 'জান্নাত (Paradise)', query: 'জান্নাত' },
  { label: 'Patience', query: 'patience' },
  { label: 'Peace', query: 'peace' },
] as const;

@Component({
  selector: 'aq-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    FilterFieldComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SkeletonComponent,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage {
  private readonly quranApi = inject(QuranApiService);
  private readonly share = inject(ShareService);

  readonly query = signal('');
  readonly selectedEdition = signal<string>(DEFAULT_TRANSLATION);
  readonly editions = SEARCH_EDITIONS;
  readonly suggestions = SEARCH_SUGGESTIONS;

  /** Transient copy/share toast for a match. */
  readonly feedback = signal<{ id: number; msg: string } | null>(null);

  private readonly retryTrigger$ = new Subject<void>();

  private readonly searchParams$ = combineLatest([
    toObservable(this.query).pipe(
      debounceTime(environment.searchDebounceMs),
      distinctUntilChanged(),
    ),
    toObservable(this.selectedEdition).pipe(distinctUntilChanged()),
    this.retryTrigger$.pipe(startWith(undefined)),
  ]).pipe(
    map(([q, edition]) => ({
      query: (q ?? '').trim(),
      edition,
    })),
  );

  readonly searchResource = toSignal(
    this.searchParams$.pipe(
      switchMap(({ query, edition }) => {
        if (query.length < 2) {
          return of(idle<SearchResponse | null>());
        }

        return this.quranApi.search(query, { edition, limit: 40 }).pipe(
          map((res) => res as SearchResponse | null),
          toAsyncState(),
        );
      }),
    ),
    { initialValue: idle<SearchResponse | null>() },
  );

  readonly isIdle = computed(() => {
    const s = this.searchResource();
    return s.status === 'idle' || this.query().trim().length < 2;
  });

  readonly isLoading = computed(() => this.searchResource().status === 'loading');

  readonly hasError = computed(() => this.searchResource().status === 'error');

  readonly error = computed(() => {
    const s = this.searchResource();
    return s.status === 'error' ? s.error : null;
  });

  readonly response = computed(() => {
    const s = this.searchResource();
    return s.status === 'success' ? s.data : null;
  });

  readonly matches = computed(() => this.response()?.matches ?? []);
  readonly totalMatches = computed(() => this.response()?.totalMatches ?? 0);
  readonly directReference = computed(() => this.response()?.directReference ?? null);
  readonly surahMatches = computed(() => this.response()?.surahMatches ?? []);

  readonly hasNoResults = computed(() => {
    if (this.isIdle() || this.isLoading() || this.hasError()) {
      return false;
    }
    const res = this.response();
    if (!res) return false;
    return res.matches.length === 0 && !res.directReference && res.surahMatches.length === 0;
  });

  retry(): void {
    this.retryTrigger$.next();
  }

  setEdition(id: string): void {
    this.selectedEdition.set(id);
  }

  applySuggestion(suggestionQuery: string): void {
    this.query.set(suggestionQuery);
  }

  async copyMatch(m: SearchMatch): Promise<void> {
    const ok = await this.share.copyAyah({
      surahEnglishName: m.surahEnglishName,
      surahNumber: m.surahNumber,
      ayahNumber: m.numberInSurah,
      arabic: m.language === 'ar' ? m.text : '',
      translations: m.language !== 'ar' ? [m.text] : [],
    });

    this.flash(m.globalNumber, ok ? 'Copied' : 'Failed to copy');
  }

  async shareMatch(m: SearchMatch): Promise<void> {
    const outcome = await this.share.shareAyah({
      surahEnglishName: m.surahEnglishName,
      surahNumber: m.surahNumber,
      ayahNumber: m.numberInSurah,
      arabic: m.language === 'ar' ? m.text : '',
      translations: m.language !== 'ar' ? [m.text] : [],
    });

    if (outcome !== 'failed') {
      this.flash(m.globalNumber, 'Shared');
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

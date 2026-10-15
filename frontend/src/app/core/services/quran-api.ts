import { Injectable, inject } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import {
  Ayah,
  DEFAULT_TRANSLATION,
  Edition,
  Juz,
  JuzDetail,
  Reciter,
  SearchResponse,
  Surah,
  SurahDetail,
} from '../models/quran';
import { ApiService } from './api';

/**
 * The Quran half of the backend API.
 *
 * The surah list and the juz list are cached in memory for the life of the tab:
 * they are the same 30 kB every time and are needed on almost every screen, so
 * refetching them when the user navigates back would be waste. Everything else
 * relies on the HTTP cache headers the backend already sends.
 *
 * A failed request is NOT cached - the stored observable is dropped so the next
 * call, typically from a Retry button, actually retries.
 */
@Injectable({ providedIn: 'root' })
export class QuranApiService {
  private readonly api = inject(ApiService);

  private surahs$?: Observable<readonly Surah[]>;
  private juz$?: Observable<readonly Juz[]>;

  /** All 114 surahs. Cached after the first successful load. */
  getSurahs(): Observable<readonly Surah[]> {
    this.surahs$ ??= this.api.get<readonly Surah[]>('quran/surahs').pipe(
      catchError((error: unknown) => {
        // Drop the cache so Retry issues a fresh request.
        this.surahs$ = undefined;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.surahs$;
  }

  /** All 30 juz with the range each covers. Cached after the first load. */
  getJuzList(): Observable<readonly Juz[]> {
    this.juz$ ??= this.api.get<readonly Juz[]>('quran/juz').pipe(
      catchError((error: unknown) => {
        this.juz$ = undefined;
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.juz$;
  }

  /**
   * One surah with every ayah.
   * @param surahNumber Surah number, 1-114.
   * @param translations Edition identifiers, at most three.
   * @param reciter Reciter edition used to build the audio URLs.
   */
  getSurah(
    surahNumber: number,
    translations: readonly string[] = [DEFAULT_TRANSLATION],
    reciter?: string,
  ): Observable<SurahDetail> {
    return this.api.get<SurahDetail>(`quran/surahs/${surahNumber}`, {
      translations: translations.join(','),
      reciter,
    });
  }

  /** One ayah, addressed as surah and ayah number. */
  getAyah(
    surahNumber: number,
    ayahNumber: number,
    translations: readonly string[] = [DEFAULT_TRANSLATION],
    reciter?: string,
  ): Observable<Ayah> {
    return this.api.get<Ayah>(`quran/surahs/${surahNumber}/ayahs/${ayahNumber}`, {
      translations: translations.join(','),
      reciter,
    });
  }

  /** One ayah by its position in the whole Quran, 1-6236. */
  getAyahByGlobalNumber(
    globalNumber: number,
    translations: readonly string[] = [DEFAULT_TRANSLATION],
    reciter?: string,
  ): Observable<Ayah> {
    return this.api.get<Ayah>(`quran/ayahs/${globalNumber}`, {
      translations: translations.join(','),
      reciter,
    });
  }

  /** One juz with every ayah it contains. */
  getJuz(
    juzNumber: number,
    translations: readonly string[] = [DEFAULT_TRANSLATION],
    reciter?: string,
  ): Observable<JuzDetail> {
    return this.api.get<JuzDetail>(`quran/juz/${juzNumber}`, {
      translations: translations.join(','),
      reciter,
    });
  }

  /** Searches the Quran text, surah names and "2:255" style references. */
  search(
    query: string,
    options: { edition?: string; limit?: number; surah?: number } = {},
  ): Observable<SearchResponse> {
    return this.api.get<SearchResponse>('quran/search', {
      q: query,
      edition: options.edition,
      limit: options.limit,
      surah: options.surah,
    });
  }

  /** Translation editions, optionally filtered to one language. */
  getEditions(language?: string): Observable<readonly Edition[]> {
    return this.api.get<readonly Edition[]>('quran/editions', { language });
  }

  /** Reciters available from the audio CDN. */
  getReciters(): Observable<readonly Reciter[]> {
    return this.api.get<readonly Reciter[]>('quran/reciters');
  }
}

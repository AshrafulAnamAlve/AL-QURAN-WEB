import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS, StorageService } from './storage';
import { ReadingPositionService } from './reading-position';

export interface SurahHistoryItem {
  readonly surahNumber: number;
  readonly surahEnglishName: string;
  readonly surahBanglaName: string;
  readonly lastAyahNumber: number;
  readonly totalAyahs: number;
  readonly lastMode: 'read' | 'listen';
  readonly updatedAt: string;
}

/**
 * Tracks reading and audio listening history per Surah.
 *
 * Persisted in localStorage (`alquran.surahHistory`) so returning users can resume
 * directly from their last read or listened ayah, and prompts with a modal when
 * re-entering a partially completed Surah.
 */
@Injectable({ providedIn: 'root' })
export class SurahHistoryService {
  private readonly storage = inject(StorageService);
  private readonly readingPosition = inject(ReadingPositionService);

  private readonly state = signal<Record<number, SurahHistoryItem>>(this.load());

  /** All recorded surahs sorted by most recently visited first. */
  readonly historyList = computed<SurahHistoryItem[]>(() => {
    return Object.values(this.state()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  });

  readonly count = computed(() => Object.keys(this.state()).length);
  readonly hasHistory = computed(() => this.count() > 0);

  constructor() {
    effect(() => {
      const data = this.state();
      this.storage.write(STORAGE_KEYS.surahHistory, data);
    });
  }

  /**
   * Records or updates progress for a specific surah.
   */
  record(
    surahNumber: number,
    surahEnglishName: string,
    surahBanglaName: string,
    ayahNumber: number,
    totalAyahs: number,
    mode: 'read' | 'listen' = 'read',
    updatedAt?: string,
  ): void {
    if (surahNumber < 1 || ayahNumber < 1) {
      return;
    }

    const item: SurahHistoryItem = {
      surahNumber,
      surahEnglishName,
      surahBanglaName: surahBanglaName || '',
      lastAyahNumber: ayahNumber,
      totalAyahs: Math.max(totalAyahs, ayahNumber),
      lastMode: mode,
      updatedAt: updatedAt || new Date().toISOString(),
    };

    this.state.update((current) => ({
      ...current,
      [surahNumber]: item,
    }));

    // Keep global reading position in sync as well
    this.readingPosition.save({
      surahNumber,
      surahEnglishName,
      surahBanglaName,
      ayahNumber,
    });
  }

  /**
   * Retrieves saved history for a surah, or null if never recorded.
   */
  getHistory(surahNumber: number): SurahHistoryItem | null {
    return this.state()[surahNumber] ?? null;
  }

  /**
   * Clears progress for a specific surah (e.g. when user chooses to restart).
   */
  clearSurah(surahNumber: number): void {
    this.state.update((current) => {
      const updated = { ...current };
      delete updated[surahNumber];
      return updated;
    });
  }

  /**
   * Clears all history.
   */
  clearAll(): void {
    this.state.set({});
  }

  private load(): Record<number, SurahHistoryItem> {
    const raw = this.storage.read<Record<string, unknown> | null>(STORAGE_KEYS.surahHistory, null);
    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const validated: Record<number, SurahHistoryItem> = {};
    for (const [key, value] of Object.entries(raw)) {
      const num = parseInt(key, 10);
      if (isNaN(num) || !value || typeof value !== 'object') continue;

      const v = value as Record<string, any>;
      if (typeof v['surahNumber'] === 'number' && typeof v['lastAyahNumber'] === 'number') {
        validated[num] = {
          surahNumber: v['surahNumber'],
          surahEnglishName: typeof v['surahEnglishName'] === 'string' ? v['surahEnglishName'] : '',
          surahBanglaName: typeof v['surahBanglaName'] === 'string' ? v['surahBanglaName'] : '',
          lastAyahNumber: v['lastAyahNumber'],
          totalAyahs: typeof v['totalAyahs'] === 'number' ? v['totalAyahs'] : v['lastAyahNumber'],
          lastMode: v['lastMode'] === 'listen' ? 'listen' : 'read',
          updatedAt: typeof v['updatedAt'] === 'string' ? v['updatedAt'] : new Date().toISOString(),
        };
      }
    }

    return validated;
  }
}

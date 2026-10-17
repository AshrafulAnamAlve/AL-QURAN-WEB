import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { STORAGE_KEYS, StorageService } from './storage';
import { ReadingPositionService } from './reading-position';

export interface SurahHistoryItem {
  readonly surahNumber: number;
  readonly surahEnglishName: string;
  readonly surahBanglaName: string;
  readonly lastAyahNumber: number;
  readonly totalAyahs: number;
  readonly lastMode: 'read' | 'listen';
  readonly maxReadAyah?: number;
  readonly maxListenedAyah?: number;
  readonly updatedAt: string;
}

export interface SurahProgress {
  readonly surahNumber: number;
  readonly percentage: number; // 0 to 100
  readonly highestAyah: number;
  readonly totalAyahs: number;
  readonly mode: 'read' | 'listen';
  readonly isCompleted: boolean;
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

    untracked(() => {
      const prev = this.state()[surahNumber];
      const prevMaxRead = prev?.maxReadAyah ?? (prev?.lastMode === 'read' ? prev.lastAyahNumber : 0);
      const prevMaxListen = prev?.maxListenedAyah ?? (prev?.lastMode === 'listen' ? prev.lastAyahNumber : 0);

      const maxReadAyah = mode === 'read'
        ? Math.max(prevMaxRead, ayahNumber)
        : prevMaxRead;

      const maxListenedAyah = mode === 'listen'
        ? Math.max(prevMaxListen, ayahNumber)
        : prevMaxListen;

      const resolvedTotal = Math.max(totalAyahs || 0, prev?.totalAyahs || 0, ayahNumber);

      // Do nothing if state has not changed (prevents microtask loops and redundant disk writes)
      if (
        prev &&
        prev.lastAyahNumber === ayahNumber &&
        prev.lastMode === mode &&
        prev.maxReadAyah === maxReadAyah &&
        prev.maxListenedAyah === maxListenedAyah &&
        prev.totalAyahs === resolvedTotal
      ) {
        return;
      }

      const item: SurahHistoryItem = {
        surahNumber,
        surahEnglishName: surahEnglishName || prev?.surahEnglishName || '',
        surahBanglaName: surahBanglaName || prev?.surahBanglaName || '',
        lastAyahNumber: ayahNumber,
        totalAyahs: resolvedTotal,
        lastMode: mode,
        maxReadAyah,
        maxListenedAyah,
        updatedAt: updatedAt || new Date().toISOString(),
      };

      this.state.update((current) => ({
        ...current,
        [surahNumber]: item,
      }));

      // Keep global reading position in sync as well
      this.readingPosition.save({
        surahNumber,
        surahEnglishName: item.surahEnglishName,
        surahBanglaName: item.surahBanglaName,
        ayahNumber,
      });
    });
  }

  /**
   * Retrieves saved history for a surah, or null if never recorded.
   */
  getHistory(surahNumber: number): SurahHistoryItem | null {
    return this.state()[surahNumber] ?? null;
  }

  /**
   * Computes unified progress (percentage, highest reached ayah, mode) for a surah.
   */
  getProgress(surahNumber: number, fallbackTotalAyahs?: number): SurahProgress | null {
    const item = this.state()[surahNumber];
    if (!item) return null;

    const total = item.totalAyahs || fallbackTotalAyahs || 1;
    const maxRead = Math.max(item.maxReadAyah ?? (item.lastMode === 'read' ? item.lastAyahNumber : 0), 0);
    const maxListen = Math.max(item.maxListenedAyah ?? (item.lastMode === 'listen' ? item.lastAyahNumber : 0), 0);

    const highest = Math.min(total, Math.max(maxRead, maxListen, item.lastAyahNumber));
    if (highest <= 0) return null;

    const mode: 'read' | 'listen' = maxListen > maxRead ? 'listen' : (item.lastMode || 'read');
    const rawPercent = Math.min(100, Math.round((highest / total) * 100));

    return {
      surahNumber,
      percentage: rawPercent,
      highestAyah: highest,
      totalAyahs: total,
      mode,
      isCompleted: rawPercent >= 100,
    };
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
        const lastMode = v['lastMode'] === 'listen' ? 'listen' : 'read';
        validated[num] = {
          surahNumber: v['surahNumber'],
          surahEnglishName: typeof v['surahEnglishName'] === 'string' ? v['surahEnglishName'] : '',
          surahBanglaName: typeof v['surahBanglaName'] === 'string' ? v['surahBanglaName'] : '',
          lastAyahNumber: v['lastAyahNumber'],
          totalAyahs: typeof v['totalAyahs'] === 'number' ? v['totalAyahs'] : v['lastAyahNumber'],
          lastMode,
          maxReadAyah: typeof v['maxReadAyah'] === 'number' ? v['maxReadAyah'] : (lastMode === 'read' ? v['lastAyahNumber'] : 0),
          maxListenedAyah: typeof v['maxListenedAyah'] === 'number' ? v['maxListenedAyah'] : (lastMode === 'listen' ? v['lastAyahNumber'] : 0),
          updatedAt: typeof v['updatedAt'] === 'string' ? v['updatedAt'] : new Date().toISOString(),
        };
      }
    }

    return validated;
  }
}

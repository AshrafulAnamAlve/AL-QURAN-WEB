import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS, StorageService } from './storage';

export interface ReadingPosition {
  readonly surahNumber: number;
  readonly surahEnglishName: string;
  readonly surahBanglaName: string;
  readonly ayahNumber: number;
  readonly updatedAt: string;
}

/**
 * Tracks the reader's last known position in the Quran.
 *
 * Persisted in localStorage so returning users can resume reading immediately
 * via the Continue Reading card on the home page.
 */
@Injectable({ providedIn: 'root' })
export class ReadingPositionService {
  private readonly storage = inject(StorageService);

  private readonly state = signal<ReadingPosition | null>(this.load());

  readonly position = this.state.asReadonly();
  readonly hasPosition = computed(() => this.state() !== null);

  constructor() {
    effect(() => {
      const current = this.state();
      if (current) {
        this.storage.write(STORAGE_KEYS.lastRead, current);
      } else {
        this.storage.remove(STORAGE_KEYS.lastRead);
      }
    });
  }

  save(pos: {
    surahNumber: number;
    surahEnglishName: string;
    surahBanglaName?: string;
    ayahNumber: number;
  }): void {
    if (pos.surahNumber < 1 || pos.ayahNumber < 1) {
      return;
    }

    const prev = this.state();
    if (
      prev &&
      prev.surahNumber === pos.surahNumber &&
      prev.ayahNumber === pos.ayahNumber &&
      prev.surahEnglishName === pos.surahEnglishName &&
      (pos.surahBanglaName === undefined || prev.surahBanglaName === pos.surahBanglaName)
    ) {
      return;
    }

    this.state.set({
      surahNumber: pos.surahNumber,
      surahEnglishName: pos.surahEnglishName,
      surahBanglaName: pos.surahBanglaName ?? '',
      ayahNumber: pos.ayahNumber,
      updatedAt: new Date().toISOString(),
    });
  }

  clear(): void {
    this.state.set(null);
  }

  private load(): ReadingPosition | null {
    const stored = this.storage.read<Partial<ReadingPosition> | null>(STORAGE_KEYS.lastRead, null);
    if (!stored || typeof stored !== 'object') {
      return null;
    }

    if (
      typeof stored.surahNumber === 'number' &&
      typeof stored.ayahNumber === 'number' &&
      typeof stored.surahEnglishName === 'string'
    ) {
      return {
        surahNumber: stored.surahNumber,
        surahEnglishName: stored.surahEnglishName,
        surahBanglaName: stored.surahBanglaName ?? '',
        ayahNumber: stored.ayahNumber,
        updatedAt: stored.updatedAt ?? new Date().toISOString(),
      };
    }

    return null;
  }
}

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { QURAN_TOTALS } from '../models/quran';
import { STORAGE_KEYS, StorageService } from './storage';

/**
 * Tracks the reader's Quran reading progress (ayahs read out of 6,236).
 *
 * Persisted in browser localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ReadingProgressService {
  private readonly storage = inject(StorageService);

  private readonly state = signal<readonly number[]>(this.load());

  /** Set of global ayah numbers read, for O(1) checks. */
  private readonly index = computed(() => new Set(this.state()));

  /** Total count of distinct ayahs read so far. */
  readonly count = computed(() => this.state().length);

  /** Total ayahs in the entire Quran (6,236). */
  readonly total = QURAN_TOTALS.ayahs;

  /** Progress percentage, rounded to 1 decimal place (0 to 100). */
  readonly percentage = computed(() => {
    const raw = (this.count() / this.total) * 100;
    return Math.min(100, Math.round(raw * 10) / 10);
  });

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.readingProgress, this.state());
    });
  }

  isRead(globalNumber: number): boolean {
    return this.index().has(globalNumber);
  }

  markRead(globalNumber: number): void {
    if (globalNumber < 1 || globalNumber > this.total || this.isRead(globalNumber)) {
      return;
    }

    this.state.update((list) => [...list, globalNumber]);
  }

  markMany(globalNumbers: readonly number[]): void {
    const set = this.index();
    const additions: number[] = [];

    for (const num of globalNumbers) {
      if (num >= 1 && num <= this.total && !set.has(num)) {
        additions.push(num);
        set.add(num);
      }
    }

    if (additions.length > 0) {
      this.state.update((list) => [...list, ...additions]);
    }
  }

  unmark(globalNumber: number): void {
    if (!this.isRead(globalNumber)) {
      return;
    }

    this.state.update((list) => list.filter((n) => n !== globalNumber));
  }

  reset(): void {
    this.state.set([]);
  }

  private load(): readonly number[] {
    const stored = this.storage.read<unknown>(STORAGE_KEYS.readingProgress, []);
    if (!Array.isArray(stored)) {
      return [];
    }

    const valid = stored.filter(
      (n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= this.total,
    );
    return Array.from(new Set(valid));
  }
}

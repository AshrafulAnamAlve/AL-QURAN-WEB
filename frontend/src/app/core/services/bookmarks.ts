import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Bookmark } from '../models/bookmark';
import { STORAGE_KEYS, StorageService } from './storage';

/**
 * Saved ayahs, kept in this browser.
 *
 * No login: the requirement is explicitly that bookmarking works without an
 * account. Phase 6 builds the /bookmarks page on top of this service; the
 * reading view already writes to it.
 */
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly storage = inject(StorageService);

  private readonly state = signal<readonly Bookmark[]>(this.load());

  /** Every bookmark, newest first. */
  readonly bookmarks = computed(() =>
    [...this.state()].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
  );

  readonly count = computed(() => this.state().length);

  /**
   * Global ayah numbers that are bookmarked.
   * A Set so an ayah can ask "am I bookmarked?" in constant time - with 286
   * ayahs on screen, scanning an array for each one would be wasteful.
   */
  private readonly index = computed(
    () => new Set(this.state().map((bookmark) => bookmark.globalNumber)),
  );

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.bookmarks, this.state());
    });
  }

  /** True when this ayah is already saved. */
  has(globalNumber: number): boolean {
    return this.index().has(globalNumber);
  }

  /** Saves the ayah, or removes it if it was already saved. Returns the new state. */
  toggle(bookmark: Bookmark): boolean {
    if (this.has(bookmark.globalNumber)) {
      this.remove(bookmark.globalNumber);
      return false;
    }

    this.add(bookmark);
    return true;
  }

  add(bookmark: Bookmark): void {
    if (this.has(bookmark.globalNumber)) {
      return;
    }

    this.state.update((current) => [...current, bookmark]);
  }

  remove(globalNumber: number): void {
    this.state.update((current) =>
      current.filter((bookmark) => bookmark.globalNumber !== globalNumber),
    );
  }

  /** Used by the Settings page in Phase 10. */
  clear(): void {
    this.state.set([]);
  }

  /** Reads stored bookmarks, dropping any entry that is not a usable record. */
  private load(): readonly Bookmark[] {
    const stored = this.storage.read<unknown>(STORAGE_KEYS.bookmarks, []);

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter(isBookmark);
  }
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Bookmark>;

  return (
    typeof candidate.globalNumber === 'number'
    && typeof candidate.surahNumber === 'number'
    && typeof candidate.ayahNumber === 'number'
    && typeof candidate.arabic === 'string'
    && typeof candidate.savedAt === 'string'
  );
}

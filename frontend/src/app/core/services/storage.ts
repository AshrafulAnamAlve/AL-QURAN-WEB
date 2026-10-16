import { Injectable } from '@angular/core';

/**
 * Every localStorage access in the app goes through here.
 *
 * Why bother: localStorage throws outright in some situations (Safari private
 * browsing, "block site data" settings, storage quota exceeded), and a single
 * unguarded read is enough to break the whole page. This wrapper degrades to an
 * in-memory map instead, so bookmarks and settings still work for the session.
 *
 * Keys are namespaced (`alquran.*`) so clearing our data never touches anything
 * else stored on the same origin.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private static readonly PREFIX = 'alquran.';

  /** Fallback used when the real localStorage is unavailable. */
  private readonly memory = new Map<string, string>();

  private readonly available = StorageService.probe();

  /** False when we are running on the in-memory fallback. */
  get isPersistent(): boolean {
    return this.available;
  }

  /** Reads and parses a value, returning `fallback` if it is missing or corrupt. */
  read<T>(key: string, fallback: T): T {
    const raw = this.readRaw(key);
    if (raw === null) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      // A half-written or hand-edited value should not brick the feature.
      this.remove(key);
      return fallback;
    }
  }

  /** Serialises and stores a value. Returns false if it could not be persisted. */
  write<T>(key: string, value: T): boolean {
    let serialised: string;
    try {
      serialised = JSON.stringify(value);
    } catch {
      return false;
    }

    const full = StorageService.PREFIX + key;
    this.memory.set(full, serialised);

    if (!this.available) {
      return false;
    }

    try {
      localStorage.setItem(full, serialised);
      return true;
    } catch {
      // Most likely the quota is full - keep the in-memory copy and move on.
      return false;
    }
  }

  remove(key: string): void {
    const full = StorageService.PREFIX + key;
    this.memory.delete(full);

    if (this.available) {
      try {
        localStorage.removeItem(full);
      } catch {
        /* nothing useful to do */
      }
    }
  }

  /** Removes only this app's keys, never anything else on the origin. */
  clearAll(): void {
    for (const key of this.memory.keys()) {
      this.memory.delete(key);
    }

    if (!this.available) {
      return;
    }

    try {
      const ours = Object.keys(localStorage).filter((k) => k.startsWith(StorageService.PREFIX));
      ours.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* nothing useful to do */
    }
  }

  /** Raw string read; also used by the pre-boot theme script contract. */
  readRaw(key: string): string | null {
    const full = StorageService.PREFIX + key;

    if (this.available) {
      try {
        const value = localStorage.getItem(full);
        if (value !== null) {
          return value;
        }
      } catch {
        /* fall through to memory */
      }
    }

    return this.memory.get(full) ?? null;
  }

  /** Writes a raw string without JSON encoding. */
  writeRaw(key: string, value: string): void {
    const full = StorageService.PREFIX + key;
    this.memory.set(full, value);

    if (this.available) {
      try {
        localStorage.setItem(full, value);
      } catch {
        /* keep the in-memory copy */
      }
    }
  }

  /** Returns storage statistics for alquran.* entries. */
  getUsage(): StorageUsage {
    let totalBytes = 0;
    let itemCount = 0;
    const breakdown: Record<string, number> = {};

    const processEntry = (fullKey: string, val: string | null) => {
      if (!fullKey.startsWith(StorageService.PREFIX) || val === null) return;
      const strippedKey = fullKey.slice(StorageService.PREFIX.length);
      const bytes = (fullKey.length + val.length) * 2;
      breakdown[strippedKey] = bytes;
      totalBytes += bytes;
      itemCount++;
    };

    if (this.available) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(StorageService.PREFIX)) {
            processEntry(k, localStorage.getItem(k));
          }
        }
      } catch {
        /* fall through to memory */
      }
    }

    if (itemCount === 0) {
      for (const [k, v] of this.memory.entries()) {
        processEntry(k, v);
      }
    }

    return { totalBytes, itemCount, breakdown };
  }

  /** Serialises all alquran.* entries into a standardized backup structure. */
  exportBackup(): AppBackupData {
    const data: Record<string, unknown> = {};

    const harvest = (k: string, rawVal: string | null) => {
      if (!k.startsWith(StorageService.PREFIX) || rawVal === null) return;
      const stripped = k.slice(StorageService.PREFIX.length);
      try {
        data[stripped] = JSON.parse(rawVal);
      } catch {
        data[stripped] = rawVal;
      }
    };

    if (this.available) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) harvest(k, localStorage.getItem(k));
        }
      } catch {
        /* fallback */
      }
    }

    for (const [k, v] of this.memory.entries()) {
      if (!(k.slice(StorageService.PREFIX.length) in data)) {
        harvest(k, v);
      }
    }

    return {
      version: 1,
      app: 'Al-Quran',
      exportedAt: new Date().toISOString(),
      data,
    };
  }

  /**
   * Restores a backup object. Clears existing data, then writes each key.
   * Returns false if the structure is invalid.
   */
  importBackup(backup: unknown): boolean {
    if (!isBackupData(backup)) {
      return false;
    }

    this.clearAll();

    for (const [key, value] of Object.entries(backup.data)) {
      if (typeof value === 'string' && key === STORAGE_KEYS.theme) {
        this.writeRaw(key, value);
      } else {
        this.write(key, value);
      }
    }

    return true;
  }

  /** Feature-detects localStorage by actually writing to it. */
  private static probe(): boolean {
    try {
      const probeKey = `${StorageService.PREFIX}__probe__`;
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
      return true;
    } catch {
      return false;
    }
  }
}

/** Storage keys used across the app. Keeping them in one place avoids typos. */
export const STORAGE_KEYS = {
  theme: 'theme',
  settings: 'settings',
  bookmarks: 'bookmarks',
  lastRead: 'lastRead',
  readingProgress: 'readingProgress',
  location: 'location',
  prayerCalculation: 'prayerCalculation',
  language: 'language',
  reciter: 'reciter',
  audio: 'audio',
  surahHistory: 'surahHistory',
  dailyTasks: 'dailyTasks',
  habitHistory: 'habitHistory',
} as const;

export interface StorageUsage {
  readonly totalBytes: number;
  readonly itemCount: number;
  readonly breakdown: Record<string, number>;
}

export interface AppBackupData {
  readonly version: 1;
  readonly app: 'Al-Quran';
  readonly exportedAt: string;
  readonly data: Record<string, unknown>;
}

function isBackupData(value: unknown): value is AppBackupData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<AppBackupData>;
  return (
    candidate.app === 'Al-Quran' &&
    candidate.version === 1 &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
}

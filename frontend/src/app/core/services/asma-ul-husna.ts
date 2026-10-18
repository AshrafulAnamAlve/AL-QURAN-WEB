import { Injectable, computed, inject, signal } from '@angular/core';
import { ASMA_UL_HUSNA_DATA, AllahName, SUPREME_NAME } from '../models/asma-ul-husna';
import { looseIncludes } from '../utils/text';
import { LoggerService } from './logger';
import { STORAGE_KEYS, StorageService } from './storage';

export type NamesFilterTab = 'all' | 'bookmarked';

@Injectable({ providedIn: 'root' })
export class AsmaUlHusnaService {
  private readonly storage = inject(StorageService);
  private readonly logger = inject(LoggerService);

  readonly supremeName = SUPREME_NAME;
  readonly allNames = ASMA_UL_HUSNA_DATA;

  // Search & Filter state
  readonly searchQuery = signal<string>('');
  readonly filterTab = signal<NamesFilterTab>('all');

  // Bookmarks state (persisted)
  private readonly _bookmarkedIds = signal<number[]>(
    this.storage.read<number[]>(STORAGE_KEYS.bookmarkedNames, []),
  );
  readonly bookmarkedIds = this._bookmarkedIds.asReadonly();
  readonly bookmarkedCount = computed(() => this._bookmarkedIds().length);

  // Filtered names computation
  readonly filteredNames = computed(() => {
    let list = this.allNames;
    const tab = this.filterTab();
    if (tab === 'bookmarked') {
      const set = new Set(this._bookmarkedIds());
      list = list.filter((n) => set.has(n.number));
    }

    const raw = this.searchQuery().trim();
    if (!raw) {
      return list;
    }

    return list.filter(
      (n) =>
        looseIncludes(n.transliteration, raw) ||
        looseIncludes(n.nameBn, raw) ||
        looseIncludes(n.meaningEn, raw) ||
        looseIncludes(n.meaningBn, raw) ||
        n.arabic.includes(raw) ||
        String(n.number) === raw,
    );
  });

  // Modal inspection state
  readonly selectedName = signal<AllahName | null>(null);

  // Audio Playback state
  private audio: HTMLAudioElement | null = null;
  readonly activePlayingNumber = signal<number | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly isPlayingAll = signal<boolean>(false);
  readonly playbackProgress = signal<number>(0);

  // Active playing name details
  readonly activePlayingName = computed<AllahName | null>(() => {
    const num = this.activePlayingNumber();
    if (num === null) return null;
    if (num === 0) return this.supremeName;
    return this.allNames.find((n) => n.number === num) ?? null;
  });

  constructor() {
    this.initAudio();
  }

  private initAudio(): void {
    if (typeof Audio === 'undefined') return;

    this.audio = new Audio();
    this.audio.preload = 'none';

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && this.audio.duration) {
        this.playbackProgress.set((this.audio.currentTime / this.audio.duration) * 100);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.playbackProgress.set(0);
      if (this.isPlayingAll()) {
        this.playNextSequential();
      } else {
        this.isPlaying.set(false);
        this.activePlayingNumber.set(null);
      }
    });

    this.audio.addEventListener('error', (err) => {
      this.logger.warn('Asma-ul-Husna audio playback error', err);
      if (this.isPlayingAll()) {
        // Skip ahead after a brief moment if one track fails to load
        setTimeout(() => this.playNextSequential(), 800);
      } else {
        this.isPlaying.set(false);
        this.activePlayingNumber.set(null);
      }
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setFilterTab(tab: NamesFilterTab): void {
    this.filterTab.set(tab);
  }

  isBookmarked(number: number): boolean {
    return this._bookmarkedIds().includes(number);
  }

  toggleBookmark(number: number): void {
    this._bookmarkedIds.update((current) => {
      const next = current.includes(number)
        ? current.filter((id) => id !== number)
        : [...current, number];
      this.storage.write(STORAGE_KEYS.bookmarkedNames, next);
      return next;
    });
  }

  openDetail(name: AllahName): void {
    this.selectedName.set(name);
  }

  closeDetail(): void {
    this.selectedName.set(null);
  }

  playName(name: AllahName): void {
    if (!this.audio) return;

    if (this.activePlayingNumber() === name.number) {
      if (this.isPlaying()) {
        this.audio.pause();
      } else {
        void this.audio.play();
      }
      return;
    }

    this.isPlayingAll.set(false);
    this.activePlayingNumber.set(name.number);
    this.playbackProgress.set(0);

    this.audio.src = name.audioUrl;
    this.audio.load();
    const p = this.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((e) => {
        this.logger.warn('Audio play request failed', e);
      });
    }
  }

  playAll(startNumber: number = 1): void {
    if (!this.audio) return;

    this.isPlayingAll.set(true);
    const target = this.allNames.find((n) => n.number === startNumber) ?? this.allNames[0];
    this.playTrack(target);
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio) {
      void this.audio.play();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlayingAll.set(false);
    this.activePlayingNumber.set(null);
    this.playbackProgress.set(0);
  }

  next(): void {
    const current = this.activePlayingNumber() ?? 0;
    if (current < 99) {
      const nextName = this.allNames.find((n) => n.number === current + 1);
      if (nextName) {
        this.playTrack(nextName);
      }
    } else {
      this.stop();
    }
  }

  previous(): void {
    const current = this.activePlayingNumber() ?? 2;
    if (current > 1) {
      const prevName = this.allNames.find((n) => n.number === current - 1);
      if (prevName) {
        this.playTrack(prevName);
      }
    } else if (current === 1) {
      this.playTrack(this.supremeName);
    }
  }

  private playNextSequential(): void {
    const current = this.activePlayingNumber();
    if (current === null) {
      this.stop();
      return;
    }

    if (current < 99) {
      const nextTrack = this.allNames.find((n) => n.number === current + 1);
      if (nextTrack) {
        this.playTrack(nextTrack);
        return;
      }
    }

    // Finished playing all 99 names
    this.stop();
  }

  private playTrack(name: AllahName): void {
    if (!this.audio) return;

    this.activePlayingNumber.set(name.number);
    this.playbackProgress.set(0);
    this.audio.src = name.audioUrl;
    this.audio.load();
    const p = this.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        this.logger.warn('Failed playing track', err);
        if (this.isPlayingAll()) {
          setTimeout(() => this.playNextSequential(), 800);
        }
      });
    }
  }
}

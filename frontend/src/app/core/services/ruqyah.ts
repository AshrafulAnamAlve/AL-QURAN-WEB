import { Injectable, computed, inject, signal } from '@angular/core';
import {
  RUQYAH_AUDIO_TRACKS,
  RUQYAH_CATEGORIES,
  RUQYAH_GUIDES,
  RUQYAH_ITEMS,
  RuqyahAudioTrack,
  RuqyahCategory,
  RuqyahItem,
} from '../models/ruqyah';
import { StorageService } from './storage';

const STORAGE_KEY_BOOKMARKS = 'ruqyah.bookmarks';
const STORAGE_KEY_COUNTS = 'ruqyah.counts';

@Injectable({ providedIn: 'root' })
export class RuqyahService {
  private readonly storage = inject(StorageService);

  readonly allItems = RUQYAH_ITEMS;
  readonly categories = RUQYAH_CATEGORIES;
  readonly audioTracks = RUQYAH_AUDIO_TRACKS;
  readonly guides = RUQYAH_GUIDES;

  // --- Filtering & Reading State ---
  readonly selectedCategory = signal<RuqyahCategory>('all');
  readonly searchQuery = signal<string>('');
  readonly showBookmarksOnly = signal<boolean>(false);

  private readonly bookmarkedIds = signal<Set<string>>(
    new Set(this.storage.read<string[]>(STORAGE_KEY_BOOKMARKS, []))
  );

  private readonly itemCounts = signal<Record<string, number>>(
    this.storage.read<Record<string, number>>(STORAGE_KEY_COUNTS, {})
  );

  // --- Audio State ---
  readonly activeTrack = signal<RuqyahAudioTrack | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly isLooping = signal<boolean>(false);
  readonly playbackRate = signal<number>(1.0);
  readonly sleepTimerMinutes = signal<number | null>(null);
  readonly sleepTimerRemainingSeconds = signal<number | null>(null);
  readonly audioError = signal<string | null>(null);

  private audio: HTMLAudioElement | null = null;
  private sleepIntervalId: ReturnType<typeof setInterval> | null = null;

  // --- Computed Signals ---
  readonly bookmarksCount = computed(() => this.bookmarkedIds().size);

  readonly filteredItems = computed<readonly RuqyahItem[]>(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();
    const bookmarksOnly = this.showBookmarksOnly();
    const bookmarks = this.bookmarkedIds();

    return this.allItems.filter((item) => {
      if (bookmarksOnly && !bookmarks.has(item.id)) {
        return false;
      }
      if (cat !== 'all' && item.category !== cat) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.titleBn.toLowerCase().includes(query) ||
        item.titleEn.toLowerCase().includes(query) ||
        item.pronunciationBn.toLowerCase().includes(query) ||
        item.translationBn.toLowerCase().includes(query) ||
        item.translationEn.toLowerCase().includes(query) ||
        item.reference.toLowerCase().includes(query)
      );
    });
  });

  readonly totalCompletedCount = computed(() => {
    const counts = this.itemCounts();
    return this.allItems.filter((item) => (counts[item.id] || 0) >= item.targetCount).length;
  });

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement(): void {
    if (typeof Audio === 'undefined') {
      return;
    }
    try {
      this.audio = new Audio();
      this.audio.preload = 'metadata';

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          this.currentTime.set(this.audio.currentTime || 0);
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          this.duration.set(this.audio.duration || 0);
          this.audioError.set(null);
        }
      });

      this.audio.addEventListener('ended', () => {
        if (this.isLooping()) {
          this.seek(0);
          this.playAudioInternal();
        } else {
          this.isPlaying.set(false);
        }
      });

      this.audio.addEventListener('error', () => {
        this.isPlaying.set(false);
        this.audioError.set('অডিও লোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।');
      });
    } catch {
      // Audio element unsupported (e.g. headless environment)
    }
  }

  // --- Filter Actions ---
  setCategory(cat: RuqyahCategory): void {
    this.selectedCategory.set(cat);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  toggleBookmarksOnly(): void {
    this.showBookmarksOnly.update((v) => !v);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
    this.showBookmarksOnly.set(false);
  }

  // --- Reading & Counter Actions ---
  isBookmarked(id: string): boolean {
    return this.bookmarkedIds().has(id);
  }

  toggleBookmark(id: string): void {
    const next = new Set(this.bookmarkedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.bookmarkedIds.set(next);
    this.storage.write(STORAGE_KEY_BOOKMARKS, Array.from(next));
  }

  getItemCount(id: string): number {
    return this.itemCounts()[id] || 0;
  }

  incrementCounter(id: string, targetCount: number): void {
    const current = this.getItemCount(id);
    const updated = current >= targetCount ? targetCount : current + 1;
    const nextCounts = { ...this.itemCounts(), [id]: updated };
    this.itemCounts.set(nextCounts);
    this.storage.write(STORAGE_KEY_COUNTS, nextCounts);

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(updated >= targetCount ? [50, 50, 100] : 30);
      } catch {
        // Ignored
      }
    }
  }

  resetCounter(id: string): void {
    const nextCounts = { ...this.itemCounts(), [id]: 0 };
    this.itemCounts.set(nextCounts);
    this.storage.write(STORAGE_KEY_COUNTS, nextCounts);
  }

  resetAllCounters(): void {
    this.itemCounts.set({});
    this.storage.write(STORAGE_KEY_COUNTS, {});
  }

  // --- Audio Actions ---
  playTrack(track: RuqyahAudioTrack): void {
    if (this.activeTrack()?.id === track.id) {
      this.togglePlayPause();
      return;
    }

    this.activeTrack.set(track);
    this.currentTime.set(0);
    this.duration.set(0);
    this.audioError.set(null);

    if (this.audio) {
      this.audio.src = track.audioUrl;
      this.audio.playbackRate = this.playbackRate();
      this.audio.loop = this.isLooping();
      this.playAudioInternal();
    }
  }

  togglePlayPause(): void {
    if (!this.activeTrack()) {
      // Default to first track if none active
      if (this.audioTracks.length > 0) {
        this.playTrack(this.audioTracks[0]);
      }
      return;
    }

    if (this.isPlaying()) {
      this.pauseAudioInternal();
    } else {
      this.playAudioInternal();
    }
  }

  seek(seconds: number): void {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.currentTime.set(seconds);
    }
  }

  skipBy(deltaSeconds: number): void {
    if (this.audio) {
      const newTime = Math.max(0, Math.min(this.duration(), this.audio.currentTime + deltaSeconds));
      this.seek(newTime);
    }
  }

  toggleLoop(): void {
    const next = !this.isLooping();
    this.isLooping.set(next);
    if (this.audio) {
      this.audio.loop = next;
    }
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate.set(rate);
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
  }

  setSleepTimer(minutes: number | null): void {
    if (this.sleepIntervalId) {
      clearInterval(this.sleepIntervalId);
      this.sleepIntervalId = null;
    }

    this.sleepTimerMinutes.set(minutes);

    if (!minutes) {
      this.sleepTimerRemainingSeconds.set(null);
      return;
    }

    let remaining = minutes * 60;
    this.sleepTimerRemainingSeconds.set(remaining);

    this.sleepIntervalId = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this.stopAudio();
        this.setSleepTimer(null);
      } else {
        this.sleepTimerRemainingSeconds.set(remaining);
      }
    }, 1000);
  }

  stopAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying.set(false);
    this.currentTime.set(0);
  }

  private playAudioInternal(): void {
    if (!this.audio) return;
    try {
      const playPromise = this.audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            this.isPlaying.set(true);
            this.audioError.set(null);
          })
          .catch(() => {
            this.isPlaying.set(false);
          });
      } else {
        this.isPlaying.set(true);
      }
    } catch {
      this.isPlaying.set(false);
    }
  }

  private pauseAudioInternal(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying.set(false);
  }
}

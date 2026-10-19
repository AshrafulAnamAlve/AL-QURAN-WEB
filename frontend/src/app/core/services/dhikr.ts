import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DEFAULT_DHIKR_SETTINGS,
  DHIKR_ITEMS,
  DhikrCategory,
  DhikrDayHistory,
  DhikrItem,
  DhikrSettings,
} from '../models/dhikr';
import { STORAGE_KEYS, StorageService } from './storage';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class DhikrService {
  private readonly storage = inject(StorageService);
  private readonly language = inject(LanguageService);

  readonly allItems = DHIKR_ITEMS;
  readonly advicePrompts = DHIKR_ITEMS.filter((item) => item.isAdvicePrompt);

  // Settings
  readonly settings = signal<DhikrSettings>(
    this.storage.read<DhikrSettings>(STORAGE_KEYS.dhikrSettings, DEFAULT_DHIKR_SETTINGS),
  );

  // Daily History
  readonly history = signal<Record<string, DhikrDayHistory>>(
    this.storage.read<Record<string, DhikrDayHistory>>(STORAGE_KEYS.dhikrHistory, {}),
  );

  // Active Tasbih State
  readonly activeDhikr = signal<DhikrItem>(DHIKR_ITEMS[7] || DHIKR_ITEMS[0]); // Default to SubhanAllah
  readonly count = signal<number>(0);
  readonly laps = signal<number>(0);
  readonly target = signal<number>(this.settings().targetPreset);

  // Filter & Search
  readonly categoryFilter = signal<DhikrCategory>('all');
  readonly searchQuery = signal<string>('');

  // Home Rotational Advice Modal State
  readonly activePrompt = signal<DhikrItem | null>(null);
  readonly promptCount = signal<number>(0);
  readonly isPromptVisible = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Audio Context for synthetic haptic click sound
  private audioCtx: AudioContext | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initTodayRecord();
    this.initHomePrompt();
  }

  // --- Computeds ---

  readonly isBn = computed<boolean>(() => this.language.isBn());

  readonly todayDate = computed<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  readonly todayRecord = computed<DhikrDayHistory>(() => {
    const key = this.todayDate();
    const existing = this.history()[key];
    if (existing) {
      return existing;
    }
    return {
      date: key,
      completedDhikrIds: [],
      totalCountToday: 0,
      adviceCompleted: false,
    };
  });

  readonly dailyStreak = computed<number>(() => {
    const hist = this.history();
    const today = this.todayDate();
    let streak = 0;
    let checkDate = new Date();

    const isTodayDone = (hist[today]?.totalCountToday ?? 0) > 0 || hist[today]?.adviceCompleted;
    if (isTodayDone) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yKey = this.formatDate(checkDate);
      if ((hist[yKey]?.totalCountToday ?? 0) > 0 || hist[yKey]?.adviceCompleted) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (streak > 0) {
      while (true) {
        const key = this.formatDate(checkDate);
        if ((hist[key]?.totalCountToday ?? 0) > 0 || hist[key]?.adviceCompleted) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return streak;
  });

  readonly filteredItems = computed<readonly DhikrItem[]>(() => {
    const cat = this.categoryFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.allItems.filter((item) => {
      const matchCat = cat === 'all' || item.category === cat;
      if (!matchCat) return false;
      if (!query) return true;

      return (
        item.nameBn.toLowerCase().includes(query) ||
        item.nameEn.toLowerCase().includes(query) ||
        item.transliteration.toLowerCase().includes(query) ||
        item.meaningBn.toLowerCase().includes(query) ||
        item.meaningEn.toLowerCase().includes(query) ||
        item.arabic.includes(query)
      );
    });
  });

  readonly progressPercentage = computed<number>(() => {
    const t = this.target();
    if (t <= 0) return 0;
    return Math.min(100, Math.round((this.count() / t) * 100));
  });

  readonly isLapCompleted = computed<boolean>(() => {
    const t = this.target();
    return t > 0 && this.count() >= t;
  });

  // --- Tasbih Actions ---

  incrementCount(): void {
    const current = this.count();
    const t = this.target();
    const newCount = current + 1;

    this.playClickSound();

    if (t > 0 && newCount >= t) {
      // Completed target for this lap
      this.triggerHaptic([60, 40, 100, 40, 150]);
      this.count.set(0);
      this.laps.update((l) => l + 1);
      this.recordDhikrProgress(this.activeDhikr().id, 1);
    } else {
      this.triggerHaptic([35]);
      this.count.set(newCount);
      this.recordDhikrProgress(this.activeDhikr().id, 1);
    }
  }

  decrementCount(): void {
    const current = this.count();
    if (current > 0) {
      this.count.set(current - 1);
      this.playClickSound();
    }
  }

  resetCount(): void {
    this.count.set(0);
    this.laps.set(0);
  }

  setTarget(preset: number): void {
    this.target.set(preset);
    this.count.set(0);
    this.updateSettings({ targetPreset: preset });
  }

  setActiveDhikr(dhikr: DhikrItem): void {
    this.activeDhikr.set(dhikr);
    this.count.set(0);
    this.laps.set(0);
    this.target.set(dhikr.targetCount > 0 ? dhikr.targetCount : 33);
  }

  setCategoryFilter(cat: DhikrCategory): void {
    this.categoryFilter.set(cat);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
  }

  toggleSound(): void {
    this.updateSettings({ soundEnabled: !this.settings().soundEnabled });
  }

  toggleVibration(): void {
    this.updateSettings({ vibrationEnabled: !this.settings().vibrationEnabled });
  }

  toggleHomePrompt(): void {
    this.updateSettings({ showHomePrompt: !this.settings().showHomePrompt });
  }

  updateSettings(partial: Partial<DhikrSettings>): void {
    const next: DhikrSettings = {
      ...this.settings(),
      ...partial,
    };
    this.settings.set(next);
    this.storage.write(STORAGE_KEYS.dhikrSettings, next);
  }

  // --- Home Advice Prompt Rotational Logic ---

  initHomePrompt(): void {
    if (!this.settings().showHomePrompt) {
      this.isPromptVisible.set(false);
      return;
    }

    const today = this.todayDate();
    const todayRec = this.todayRecord();

    // If already completed advice today, don't show
    if (todayRec.adviceCompleted) {
      this.isPromptVisible.set(false);
      return;
    }

    // Check if dismissed in this session
    const sessionDismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('alquran.prompt_dismissed') === today;
    if (sessionDismissed) {
      this.isPromptVisible.set(false);
      return;
    }

    // Rotational selector based on day-of-year + day-of-month to rotate through prompts
    const d = new Date();
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    const index = (dayOfYear + d.getDate()) % this.advicePrompts.length;
    const selected = this.advicePrompts[index] || this.advicePrompts[0];

    this.activePrompt.set(selected);
    this.promptCount.set(0);
    this.isPromptVisible.set(true);
  }

  incrementPromptCount(): void {
    const prompt = this.activePrompt();
    if (!prompt) return;

    const next = this.promptCount() + 1;
    this.playClickSound();
    this.triggerHaptic([35]);
    this.promptCount.set(next);

    // If target reached on this tap, celebrate with celebratory haptic vibration
    // but DO NOT abruptly close the modal so user can read and enjoy the completion.
    if (next === prompt.targetCount) {
      this.triggerHaptic([80, 50, 120]);
    }
  }

  completePrompt(): void {
    const prompt = this.activePrompt();
    if (!prompt) return;

    this.triggerHaptic([80, 50, 120]);
    this.isPromptVisible.set(false);

    const today = this.todayDate();
    const current = this.todayRecord();
    const completedSet = new Set(current.completedDhikrIds);
    completedSet.add(prompt.id);

    const updated: DhikrDayHistory = {
      ...current,
      completedDhikrIds: Array.from(completedSet),
      totalCountToday: current.totalCountToday + prompt.targetCount,
      adviceCompleted: true,
    };

    this.saveDayRecord(today, updated);
    this.showToast(
      this.isBn()
        ? 'মাশাআল্লাহ! আজকের বিশেষ আমল সম্পন্ন হয়েছে।'
        : 'MashaAllah! Today\'s recommended Dhikr completed.',
    );
  }

  skipPrompt(): void {
    this.isPromptVisible.set(false);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('alquran.prompt_dismissed', this.todayDate());
    }
  }

  dismissPromptForToday(): void {
    this.isPromptVisible.set(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('alquran.prompt_suppressed_date', this.todayDate());
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('alquran.prompt_dismissed', this.todayDate());
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  // --- Internal Helpers ---

  private recordDhikrProgress(dhikrId: string, countAdded: number): void {
    const today = this.todayDate();
    const current = this.todayRecord();
    const completedSet = new Set(current.completedDhikrIds);
    completedSet.add(dhikrId);

    const updated: DhikrDayHistory = {
      ...current,
      completedDhikrIds: Array.from(completedSet),
      totalCountToday: current.totalCountToday + countAdded,
    };

    this.saveDayRecord(today, updated);
  }

  private saveDayRecord(dateKey: string, rec: DhikrDayHistory): void {
    this.history.update((prev) => {
      const next = {
        ...prev,
        [dateKey]: rec,
      };
      this.storage.write(STORAGE_KEYS.dhikrHistory, next);
      return next;
    });
  }

  private initTodayRecord(): void {
    const today = this.todayDate();
    const existing = this.history()[today];
    if (!existing) {
      this.saveDayRecord(today, {
        date: today,
        completedDhikrIds: [],
        totalCountToday: 0,
        adviceCompleted: false,
      });
    }
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private triggerHaptic(pattern: number[]): void {
    if (!this.settings().vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        /* Ignore if unsupported or restricted */
      }
    }
  }

  private playClickSound(): void {
    if (!this.settings().soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {
      /* AudioContext autoplay policy or disabled */
    }
  }
}

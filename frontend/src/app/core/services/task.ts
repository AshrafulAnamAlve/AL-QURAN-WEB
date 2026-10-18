import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  DEFAULT_DAILY_TASK_SETTINGS,
  DailyTaskSettings,
  HabitDayRecord,
  HabitMetrics,
} from '../models/daily-task';
import { STORAGE_KEYS, StorageService } from './storage';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly lang = inject(LanguageService);
  private readonly http = inject(HttpClient, { optional: true });

  readonly isBn = this.lang.isBn;

  // --- Core State Signals ---
  readonly settings = signal<DailyTaskSettings>(this.loadSettings());
  readonly history = signal<Record<string, HabitDayRecord>>(this.loadHistory());
  readonly todayDate = signal<string>(this.getTodayDateString());
  readonly notificationPermission = signal<NotificationPermission>(
    this.getInitialNotificationPermission(),
  );

  // In-app fallback reminder banner & completion celebration
  readonly inAppReminderActive = signal<boolean>(false);
  readonly celebrationActive = signal<boolean>(false);

  // Keep track of the last reminder date sent so we don't repeat notifications on the same day
  private lastReminderDateSent: string | null = null;
  private reminderCheckInterval: ReturnType<typeof setInterval> | null = null;

  // --- Computeds ---
  readonly todayRecord = computed<HabitDayRecord>(() => {
    const today = this.todayDate();
    const existing = this.history()[today];
    if (existing) {
      return existing;
    }
    return {
      date: today,
      ayahsRead: 0,
      minutesListened: 0,
      manualReadingCompleted: false,
      manualListeningCompleted: false,
      goalMet: false,
    };
  });

  readonly isReadingGoalMet = computed<boolean>(() => {
    const rec = this.todayRecord();
    const target = this.settings().readingGoalAyahs;
    return rec.manualReadingCompleted || rec.ayahsRead >= target;
  });

  readonly isListeningGoalMet = computed<boolean>(() => {
    const rec = this.todayRecord();
    const target = this.settings().listeningGoalMinutes;
    return rec.manualListeningCompleted || rec.minutesListened >= target;
  });

  readonly isTodayGoalCompleted = computed<boolean>(() => {
    return this.isReadingGoalMet();
  });

  readonly readingProgressPercent = computed<number>(() => {
    const rec = this.todayRecord();
    if (rec.manualReadingCompleted) return 100;
    const target = this.settings().readingGoalAyahs;
    if (target <= 0) return 100;
    return Math.min(100, Math.round((rec.ayahsRead / target) * 100));
  });

  readonly listeningProgressPercent = computed<number>(() => {
    const rec = this.todayRecord();
    if (rec.manualListeningCompleted) return 100;
    const target = this.settings().listeningGoalMinutes;
    if (target <= 0) return 100;
    return Math.min(100, Math.round((rec.minutesListened / target) * 100));
  });

  readonly overallProgressPercent = computed<number>(() => {
    return this.readingProgressPercent();
  });

  readonly metrics = computed<HabitMetrics>(() => {
    const hist = this.history();
    const today = this.todayDate();
    const todayRec = this.todayRecord();

    // 1. Current streak calculation
    let streak = 0;
    const isTodayMet = this.isReadingGoalMet();
    let checkDate = new Date();

    if (isTodayMet) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday was met
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = this.formatDateKey(checkDate);
      if (hist[yesterdayKey]?.goalMet) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (streak > 0) {
      while (true) {
        const key = this.formatDateKey(checkDate);
        if (hist[key]?.goalMet) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 2. Longest streak calculation across all history
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(hist).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      const dKey = sortedDates[i];
      if (hist[dKey]?.goalMet) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    // 3. This month's statistics
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let totalAyahsThisMonth = 0;
    let totalMinutesThisMonth = 0;
    let daysCompletedThisMonth = 0;

    for (const [key, rec] of Object.entries(hist)) {
      const d = new Date(key);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totalAyahsThisMonth += rec.ayahsRead;
        totalMinutesThisMonth += rec.minutesListened;
        if (rec.goalMet) {
          daysCompletedThisMonth++;
        }
      }
    }

    return {
      currentStreak: streak,
      longestStreak,
      totalAyahsThisMonth,
      totalMinutesThisMonth,
      daysCompletedThisMonth,
      daysInMonth,
    };
  });

  constructor() {
    // Persist settings
    effect(() => {
      this.storage.write(STORAGE_KEYS.dailyTasks, this.settings());
    });

    // Persist history
    effect(() => {
      this.storage.write(STORAGE_KEYS.habitHistory, this.history());
    });

    this.startReminderWatcher();
  }

  // In-memory set of distinct global ayahs read today to prevent duplicate counts during scroll stops
  private readonly readAyahsToday = new Set<number>();

  // --- Public Action Methods ---

  updateSettings(partial: Partial<DailyTaskSettings>): void {
    this.settings.update((curr) => {
      const next = { ...curr, ...partial };
      this.storage.write(STORAGE_KEYS.dailyTasks, next);
      return next;
    });
  }

  recordAyahRead(surahNumber?: number, count = 1, ayahGlobalNumber?: number): void {
    const targetSurah = this.settings().targetSurahNumber;
    if (targetSurah !== null && surahNumber !== undefined && surahNumber !== targetSurah) {
      // User set a specific surah goal and this ayah is from a different surah
      return;
    }

    if (ayahGlobalNumber !== undefined) {
      if (this.readAyahsToday.has(ayahGlobalNumber)) {
        return;
      }
      this.readAyahsToday.add(ayahGlobalNumber);
    }

    const today = this.todayDate();
    const current = this.todayRecord();
    const wasMet = this.isReadingGoalMet();

    const newAyahsRead = current.ayahsRead + count;
    const isNowMet = current.manualReadingCompleted || newAyahsRead >= this.settings().readingGoalAyahs;

    const updated: HabitDayRecord = {
      ...current,
      ayahsRead: newAyahsRead,
      goalMet: isNowMet,
      completedAt: isNowMet && !wasMet ? new Date().toISOString() : current.completedAt,
    };

    this.saveTodayRecord(updated);

    if (!wasMet && isNowMet) {
      this.celebrationActive.set(true);
      this.syncWithBackend(updated);
    }
  }

  recordAudioListening(seconds: number): void {
    if (seconds <= 0) return;
    const minutes = Math.round((seconds / 60) * 10) / 10;
    const current = this.todayRecord();
    const newMinutes = Math.round((current.minutesListened + minutes) * 10) / 10;

    const updated: HabitDayRecord = {
      ...current,
      minutesListened: newMinutes,
    };

    this.saveTodayRecord(updated);
  }

  toggleManualReading(forcedValue?: boolean): void {
    const current = this.todayRecord();
    const wasMet = this.isReadingGoalMet();
    const nextVal = forcedValue !== undefined ? forcedValue : !current.manualReadingCompleted;

    const isNowMet = nextVal || current.ayahsRead >= this.settings().readingGoalAyahs;

    const updated: HabitDayRecord = {
      ...current,
      manualReadingCompleted: nextVal,
      goalMet: isNowMet,
      completedAt: isNowMet && !wasMet ? new Date().toISOString() : isNowMet ? current.completedAt : undefined,
    };

    this.saveTodayRecord(updated);

    if (!wasMet && isNowMet) {
      this.celebrationActive.set(true);
      this.syncWithBackend(updated);
    } else if (!isNowMet) {
      this.celebrationActive.set(false);
    }
  }

  toggleManualListening(forcedValue?: boolean): void {
    const current = this.todayRecord();
    const nextVal = forcedValue !== undefined ? forcedValue : !current.manualListeningCompleted;

    const updated: HabitDayRecord = {
      ...current,
      manualListeningCompleted: nextVal,
    };

    this.saveTodayRecord(updated);
  }

  resetTodayProgress(): void {
    const today = this.todayDate();
    const resetRec: HabitDayRecord = {
      date: today,
      ayahsRead: 0,
      minutesListened: 0,
      manualReadingCompleted: false,
      manualListeningCompleted: false,
      goalMet: false,
    };
    this.saveTodayRecord(resetRec);
    this.celebrationActive.set(false);
  }

  dismissCelebration(): void {
    this.celebrationActive.set(false);
  }

  dismissReminder(): void {
    this.inAppReminderActive.set(false);
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      this.notificationPermission.set(perm);
      return perm;
    } catch {
      return 'denied';
    }
  }

  triggerTestNotification(): void {
    this.sendNotification(
      this.isBn()
        ? 'আল-কুরআন — দৈনিক লক্ষ্য অনুস্মারক (টেস্ট)'
        : 'Al-Quran — Daily Goal Reminder (Test)',
      this.isBn()
        ? `আজকের লক্ষ্য: ${this.settings().readingGoalAyahs}টি আয়াত তিলাওয়াত করুন।`
        : `Today's goal: Read ${this.settings().readingGoalAyahs} Ayahs.`,
    );
  }

  // --- Internal Helpers ---

  private saveTodayRecord(record: HabitDayRecord): void {
    this.history.update((prev) => {
      const next = {
        ...prev,
        [record.date]: record,
      };
      this.storage.write(STORAGE_KEYS.habitHistory, next);
      return next;
    });
  }

  private loadSettings(): DailyTaskSettings {
    const stored = this.storage.read<Partial<DailyTaskSettings>>(
      STORAGE_KEYS.dailyTasks,
      {},
    );
    return {
      readingGoalAyahs:
        typeof stored.readingGoalAyahs === 'number' && stored.readingGoalAyahs > 0
          ? stored.readingGoalAyahs
          : DEFAULT_DAILY_TASK_SETTINGS.readingGoalAyahs,
      listeningGoalMinutes:
        typeof stored.listeningGoalMinutes === 'number' && stored.listeningGoalMinutes > 0
          ? stored.listeningGoalMinutes
          : DEFAULT_DAILY_TASK_SETTINGS.listeningGoalMinutes,
      targetSurahNumber:
        typeof stored.targetSurahNumber === 'number'
          ? stored.targetSurahNumber
          : DEFAULT_DAILY_TASK_SETTINGS.targetSurahNumber,
      targetSurahName:
        typeof stored.targetSurahName === 'string'
          ? stored.targetSurahName
          : DEFAULT_DAILY_TASK_SETTINGS.targetSurahName,
      reminderEnabled:
        typeof stored.reminderEnabled === 'boolean'
          ? stored.reminderEnabled
          : DEFAULT_DAILY_TASK_SETTINGS.reminderEnabled,
      reminderTime:
        typeof stored.reminderTime === 'string' && /^\d{2}:\d{2}$/.test(stored.reminderTime)
          ? stored.reminderTime
          : DEFAULT_DAILY_TASK_SETTINGS.reminderTime,
      reminderSound:
        typeof stored.reminderSound === 'boolean'
          ? stored.reminderSound
          : DEFAULT_DAILY_TASK_SETTINGS.reminderSound,
    };
  }

  private loadHistory(): Record<string, HabitDayRecord> {
    const stored = this.storage.read<Record<string, HabitDayRecord>>(
      STORAGE_KEYS.habitHistory,
      {},
    );
    if (!stored || typeof stored !== 'object') {
      return {};
    }
    return stored;
  }

  private getTodayDateString(): string {
    return this.formatDateKey(new Date());
  }

  private formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getInitialNotificationPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  private startReminderWatcher(): void {
    if (typeof window === 'undefined') return;

    // Check every 30 seconds
    this.reminderCheckInterval = setInterval(() => {
      this.checkReminder();
    }, 30000);

    // Initial check
    setTimeout(() => this.checkReminder(), 1500);
  }

  private checkReminder(): void {
    const s = this.settings();
    if (!s.reminderEnabled) return;

    const today = this.getTodayDateString();
    if (this.todayDate() !== today) {
      this.todayDate.set(today);
    }

    // If goal already met today, no reminder needed
    if (this.isTodayGoalCompleted()) return;

    const now = new Date();
    const currentHhMm = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;

    if (currentHhMm === s.reminderTime && this.lastReminderDateSent !== today) {
      this.lastReminderDateSent = today;

      const title = this.isBn()
        ? 'আল-কুরআন — দৈনিক কুরআন তিলাওয়াতের সময় হয়েছে'
        : 'Al-Quran — Daily Goal Reminder';

      const body = this.isBn()
        ? `আজকের লক্ষ্য: ${s.readingGoalAyahs}টি আয়াত তিলাওয়াত করুন। শুরু করতে এখানে ক্লিক করুন।`
        : `Time to complete your daily goal: Read ${s.readingGoalAyahs} Ayahs. Click to begin.`;

      this.sendNotification(title, body);
      this.inAppReminderActive.set(true);
    }
  }

  private sendNotification(title: string, body: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.inAppReminderActive.set(true);
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'icons/icon-192x192.png',
          badge: 'icons/icon-72x72.png',
          tag: 'alquran-daily-task',
        });

        notif.onclick = () => {
          window.focus();
          const targetSurah = this.settings().targetSurahNumber || 1;
          window.location.hash = `#/quran/${targetSurah}`;
          notif.close();
        };
      } catch {
        this.inAppReminderActive.set(true);
      }
    } else {
      this.inAppReminderActive.set(true);
    }
  }

  private syncWithBackend(record: HabitDayRecord): void {
    if (!this.http || typeof window === 'undefined' || !navigator.onLine) return;

    const targetSurah = this.settings().targetSurahNumber || 1;
    const payload = {
      dateUtc: new Date().toISOString(),
      surahNumber: targetSurah,
      ayahNumber: 1,
      ayahsRead: record.ayahsRead,
      minutesListened: Math.round(record.minutesListened),
      goalMet: record.goalMet,
    };

    this.http.post(`${environment.apiBaseUrl}/tasks/daily-log`, payload).subscribe({
      next: () => {},
      error: () => {
        // Silently preserve local record
      },
    });
  }
}

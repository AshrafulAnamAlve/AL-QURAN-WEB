/**
 * Types and default models for Phase 13 Daily Quran Task Tracker & Habit Calendar.
 */

export interface DailyTaskSettings {
  readonly readingGoalAyahs: number;
  readonly listeningGoalMinutes: number;
  readonly targetSurahNumber: number | null;
  readonly targetSurahName: string | null;
  readonly reminderEnabled: boolean;
  readonly reminderTime: string; // HH:mm format, e.g. "06:30"
  readonly reminderSound: boolean;
}

export const DEFAULT_DAILY_TASK_SETTINGS: DailyTaskSettings = {
  readingGoalAyahs: 10,
  listeningGoalMinutes: 15,
  targetSurahNumber: null,
  targetSurahName: null,
  reminderEnabled: true,
  reminderTime: '06:30',
  reminderSound: true,
};

export type HabitDayStatus = 'completed' | 'partial' | 'missed' | 'today';

export interface HabitDayRecord {
  readonly date: string; // YYYY-MM-DD
  readonly ayahsRead: number;
  readonly minutesListened: number;
  readonly manualReadingCompleted: boolean;
  readonly manualListeningCompleted: boolean;
  readonly goalMet: boolean;
  readonly completedAt?: string;
}

export interface HabitMetrics {
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly totalAyahsThisMonth: number;
  readonly totalMinutesThisMonth: number;
  readonly daysCompletedThisMonth: number;
  readonly daysInMonth: number;
}

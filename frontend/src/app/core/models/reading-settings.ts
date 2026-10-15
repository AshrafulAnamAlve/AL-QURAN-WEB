/** Which translations the reading view shows beneath the Arabic. */
export type TranslationMode = 'bangla' | 'english' | 'both' | 'arabic';

export const TRANSLATION_MODES: readonly { value: TranslationMode; label: string }[] = [
  { value: 'bangla', label: 'Bangla' },
  { value: 'english', label: 'English' },
  { value: 'both', label: 'Both' },
  { value: 'arabic', label: 'Arabic only' },
];

/** Everything the reader can adjust about how the Quran is displayed. */
export interface ReadingSettings {
  /** Arabic text size, in rem. */
  arabicSize: number;
  /** Translation text size, in rem. */
  translationSize: number;
  /** Line spacing multiplier applied to the Arabic. */
  lineHeight: number;
  /** Maximum width of the reading column, in pixels. */
  readingWidth: number;
  /** Which translations to show. */
  translationMode: TranslationMode;
}

/**
 * Bounds for each setting.
 *
 * The Arabic minimum is deliberately generous: vowelled Quranic script becomes
 * genuinely hard to read below about 1.5rem, so the slider does not allow it.
 */
export const READING_LIMITS = {
  arabicSize: { min: 1.5, max: 3.5, step: 0.125, default: 2 },
  translationSize: { min: 0.875, max: 1.5, step: 0.0625, default: 1.0625 },
  lineHeight: { min: 1.7, max: 3, step: 0.05, default: 2.15 },
  readingWidth: { min: 600, max: 1100, step: 20, default: 760 },
} as const;

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  arabicSize: READING_LIMITS.arabicSize.default,
  translationSize: READING_LIMITS.translationSize.default,
  lineHeight: READING_LIMITS.lineHeight.default,
  readingWidth: READING_LIMITS.readingWidth.default,
  translationMode: 'bangla',
};

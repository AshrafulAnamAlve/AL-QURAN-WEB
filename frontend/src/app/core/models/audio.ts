/**
 * Types for recitation playback.
 *
 * The player works on a *queue* rather than a single ayah, because everything
 * Phase 5 asks for - auto-advance, repeat, previous/next, lock-screen controls -
 * is meaningless without knowing what comes after the ayah being recited.
 */

/** Where a queue came from, so the UI can say "Repeat surah" or "Repeat juz". */
export type QueueKind = 'surah' | 'juz';

/** The minimum a player needs about an ayah: what to fetch and what to announce. */
export interface PlayableAyah {
  /** Position in the whole Quran, 1-6236. This is the audio file number. */
  readonly globalNumber: number;
  readonly surahNumber: number;
  readonly numberInSurah: number;
  readonly surahEnglishName: string;
  readonly surahArabicName: string;
}

/** An ordered run of ayahs the player moves through. */
export interface PlaybackQueue {
  /** Identifies the source, e.g. "surah:2". Used to tell one queue from another. */
  readonly id: string;
  readonly kind: QueueKind;
  /** Shown in the player and on the lock screen, e.g. "Surah Al-Baqarah". */
  readonly title: string;
  readonly ayahs: readonly PlayableAyah[];
}

/**
 * off   - play the ayah, move on, stop at the end
 * ayah  - play the same ayah `repeatCount` times before moving on
 * queue - play to the end, then start the surah or juz again
 */
export type RepeatMode = 'off' | 'ayah' | 'queue';

export const REPEAT_MODES: readonly { value: RepeatMode; label: string }[] = [
  { value: 'off', label: 'No repeat' },
  { value: 'ayah', label: 'Repeat ayah' },
  { value: 'queue', label: 'Repeat all' },
];

/** How many times an ayah may be repeated. Memorisation is the reason for this. */
export const REPEAT_COUNT = { min: 2, max: 20, default: 3 } as const;

/** Speeds offered by the player. 1 must be in the list and is the default. */
export const PLAYBACK_RATES: readonly number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** Playback preferences kept on the device. */
export interface AudioSettings {
  /** 0 to 1. */
  volume: number;
  muted: boolean;
  rate: number;
  repeatMode: RepeatMode;
  repeatCount: number;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 1,
  muted: false,
  rate: 1,
  repeatMode: 'off',
  repeatCount: REPEAT_COUNT.default,
};

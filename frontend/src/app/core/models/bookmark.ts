/**
 * A saved ayah. Stored in this browser only - there is no account and nothing
 * is sent to a server.
 */
export interface Bookmark {
  /** Position in the whole Quran, 1-6236. Unique, so it doubles as the id. */
  readonly globalNumber: number;
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly surahEnglishName: string;
  readonly surahBanglaName: string;
  /** Arabic text, saved so the bookmarks page works offline. */
  readonly arabic: string;
  /** Translation text at the time of saving, or empty if none was shown. */
  readonly translation: string;
  /** ISO timestamp of when it was saved. */
  readonly savedAt: string;
}

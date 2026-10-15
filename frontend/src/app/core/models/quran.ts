/**
 * Mirrors the backend DTOs in backend/AlQuran.Api/DTOs/Quran/.
 *
 * The API serialises nulls rather than omitting them (JsonIgnoreCondition.Never),
 * so `X | null` here means exactly what `X?` means in the C# record - the key is
 * always present. Keep these in step with the C# records.
 */

/** "Meccan" or "Medinan", as the provider spells it. */
export type RevelationType = 'Meccan' | 'Medinan';

/** One surah in the browse list. */
export interface Surah {
  readonly number: number;
  /** Arabic name, e.g. سُورَةُ ٱلْفَاتِحَةِ. */
  readonly arabicName: string;
  /** Latin transliteration, e.g. "Al-Fatihah". */
  readonly englishName: string;
  /** Meaning of the name in English, e.g. "The Opening". */
  readonly englishMeaning: string;
  /** Name transliterated into Bengali script, e.g. আল-ফাতিহা. */
  readonly banglaName: string;
  /** Meaning of the name in Bangla, e.g. সূচনা. */
  readonly banglaMeaning: string;
  readonly ayahCount: number;
  readonly revelationType: RevelationType | string;
  /**
   * Whether the reading view should print the Bismillah above ayah 1.
   * False for At-Tawbah, which has none, and for Al-Fatihah, where it is ayah 1.
   */
  readonly hasBismillah: boolean;
}

/** Short reference to a surah, used for previous/next links and headings. */
export interface SurahLink {
  readonly number: number;
  readonly englishName: string;
  readonly banglaName: string;
}

/** One translation of an ayah. */
export interface Translation {
  readonly edition: string;
  readonly language: string;
  readonly translator: string;
  readonly translatorEnglish: string;
  readonly text: string;
  readonly direction: 'ltr' | 'rtl' | string;
}

/** A single ayah with its Arabic text and any requested translations. */
export interface Ayah {
  /** Position in the whole Quran, 1-6236. Also the audio file number. */
  readonly globalNumber: number;
  readonly numberInSurah: number;
  readonly surahNumber: number;
  readonly arabic: string;
  readonly translations: readonly Translation[];
  readonly juz: number;
  readonly page: number;
  readonly ruku: number;
  readonly hizbQuarter: number;
  readonly isSajda: boolean;
  readonly audioUrl: string;
}

/** A surah with all of its ayahs, for the reading view. */
export interface SurahDetail {
  readonly surah: Surah;
  readonly ayahs: readonly Ayah[];
  readonly previous: SurahLink | null;
  readonly next: SurahLink | null;
  /** The Bismillah to print above ayah 1, or null when it does not belong. */
  readonly bismillahArabic: string | null;
}

/** One juz (para) in the browse list. */
export interface Juz {
  readonly number: number;
  readonly startSurahNumber: number;
  readonly startSurahName: string;
  readonly startSurahBanglaName: string;
  readonly startAyah: number;
  readonly endSurahNumber: number;
  readonly endSurahName: string;
  readonly endAyah: number;
  readonly ayahCount: number;
}

/** A juz with all of its ayahs. */
export interface JuzDetail {
  readonly number: number;
  readonly ayahs: readonly Ayah[];
  readonly surahs: readonly SurahLink[];
}

/** A parsed "surah:ayah" reference such as 2:255. */
export interface AyahReference {
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly surahEnglishName: string;
}

/** One search hit. */
export interface SearchMatch {
  readonly surahNumber: number;
  readonly surahEnglishName: string;
  readonly surahBanglaName: string;
  readonly numberInSurah: number;
  readonly globalNumber: number;
  readonly text: string;
  readonly edition: string;
  readonly language: string;
}

/** Results of a Quran search. */
export interface SearchResponse {
  readonly query: string;
  readonly edition: string;
  readonly totalMatches: number;
  readonly matches: readonly SearchMatch[];
  readonly directReference: AyahReference | null;
  readonly surahMatches: readonly SurahLink[];
}

/** A translation edition that can be requested. */
export interface Edition {
  readonly identifier: string;
  readonly language: string;
  readonly name: string;
  readonly englishName: string;
  readonly type: string;
  readonly direction: string;
}

/**
 * A reciter whose per-ayah recitation the audio CDN serves.
 *
 * The list is short and curated on purpose: of the 190 audio editions the
 * provider lists, only these were verified to have one MP3 per ayah at a known
 * bitrate. See backend Services/Quran/Reciters.cs.
 */
export interface Reciter {
  readonly identifier: string;
  /** Arabic name. */
  readonly name: string;
  readonly englishName: string;
  /** "Murattal" or "Mujawwad", or empty when the source marks no style. */
  readonly style: string;
  /**
   * CDN bitrate folder for this reciter, in kbps. It differs per reciter, and
   * the browser builds its own audio URLs, so it needs this value.
   */
  readonly bitrate: number;
}

/** Totals used for progress and validation. Fixed values, not fetched. */
export const QURAN_TOTALS = {
  surahs: 114,
  ayahs: 6236,
  juz: 30,
} as const;

/** Default translation edition, matching the backend default. */
export const DEFAULT_TRANSLATION = 'bn.bengali';

/**
 * The reciter used until the reader picks another, matching
 * ExternalApis:QuranAudio:DefaultReciter in the backend appsettings.json.
 *
 * Held here in full rather than as an identifier so the player can build a URL
 * and name what is playing without waiting for - or depending on - the reciter
 * list request.
 */
export const DEFAULT_RECITER: Reciter = {
  identifier: 'ar.alafasy',
  name: 'مشاري العفاسي',
  englishName: 'Mishary Rashid Alafasy',
  style: '',
  bitrate: 128,
};

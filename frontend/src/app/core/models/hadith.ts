/**
 * Core models for the Hadith section and Daily Hadith modal.
 */

export type HadithCategory =
  | 'all'
  | 'iman'
  | 'salah'
  | 'character'
  | 'charity'
  | 'fasting'
  | 'dua'
  | 'knowledge'
  | 'nawawi40';

export interface HadithCategoryInfo {
  readonly id: HadithCategory;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly icon: string;
}

export const HADITH_CATEGORIES: readonly HadithCategoryInfo[] = [
  { id: 'all', nameEn: 'All Hadiths', nameBn: 'সকল হাদিস', icon: 'bookOpen' },
  { id: 'iman', nameEn: 'Faith & Belief', nameBn: 'ঈমান ও আকীদা', icon: 'sparkles' },
  { id: 'salah', nameEn: 'Prayer & Purification', nameBn: 'নামাজ ও পবিত্রতা', icon: 'clock' },
  { id: 'character', nameEn: 'Good Character & Akhlaq', nameBn: 'সদাচরণ ও আখলাক', icon: 'heart' },
  { id: 'charity', nameEn: 'Charity & Kindness', nameBn: 'দান-সদকা ও পরোপকার', icon: 'gift' },
  { id: 'fasting', nameEn: 'Fasting & Ramadan', nameBn: 'সিয়াম ও রোজা', icon: 'moon' },
  { id: 'dua', nameEn: 'Repentance & Du\'a', nameBn: 'তওবা ও দোয়া', icon: 'message' },
  { id: 'knowledge', nameEn: 'Knowledge & Wisdom', nameBn: 'জ্ঞান ও প্রজ্ঞা', icon: 'search' },
  { id: 'nawawi40', nameEn: 'Imam Nawawi\'s 40 Hadiths', nameBn: 'ইমাম নববীর ৪০ হাদিস', icon: 'check' },
];

export interface Hadith {
  readonly id: number;
  readonly book: string;
  readonly bookBn: string;
  readonly hadithNumber: number | string;
  readonly chapterEn: string;
  readonly chapterBn: string;
  readonly narratorEn: string;
  readonly narratorBn: string;
  readonly arabic: string;
  readonly bangla: string;
  readonly english: string;
  readonly gradeEn: 'Sahih' | 'Hasan';
  readonly gradeBn: 'সহিহ' | 'হাসান';
  readonly category: HadithCategory;
}

export interface HadithBookmark {
  readonly id: number;
  readonly savedAt: string;
}

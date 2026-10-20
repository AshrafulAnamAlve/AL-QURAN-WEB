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
  { id: 'all', nameEn: 'All Hadiths', nameBn: 'সকল বিষয়', icon: 'bookOpen' },
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
  readonly id: number | string;
  readonly savedAt: string;
}

/**
 * 8 Canonical Hadith Collections with 36,000+ authentic Hadiths
 */
export interface CanonicalBook {
  readonly id: string;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly totalHadiths: number;
  readonly totalSections: number;
  readonly descriptionBn: string;
}

export const CANONICAL_BOOKS: readonly CanonicalBook[] = [
  {
    id: 'bukhari',
    nameEn: 'Sahih al-Bukhari',
    nameBn: 'সহিহ বুখারী',
    totalHadiths: 7563,
    totalSections: 97,
    descriptionBn: 'ইমাম বুখারী (রহ.) সংকলিত সর্বাধিক বিশুদ্ধ হাদিস গ্রন্থ',
  },
  {
    id: 'muslim',
    nameEn: 'Sahih Muslim',
    nameBn: 'সহিহ মুসলিম',
    totalHadiths: 7500,
    totalSections: 56,
    descriptionBn: 'ইমাম মুসলিম (রহ.) সংকলিত অন্যতম নির্ভরযোগ্য সহিহ হাদিস গ্রন্থ',
  },
  {
    id: 'tirmidhi',
    nameEn: 'Jami` at-Tirmidhi',
    nameBn: 'জামে আত-তিরমিজী',
    totalHadiths: 3956,
    totalSections: 49,
    descriptionBn: 'ইমাম তিরমিজী (রহ.) সংকলিত ফিকহি ধারার প্রামাণ্য গ্রন্থ',
  },
  {
    id: 'abudawud',
    nameEn: 'Sunan Abu Dawud',
    nameBn: 'সুনান আবু দাউদ',
    totalHadiths: 5274,
    totalSections: 43,
    descriptionBn: 'ইমাম আবু দাউদ (রহ.) সংকলিত আহকাম বিষয়ক বিখ্যাত গ্রন্থ',
  },
  {
    id: 'nasai',
    nameEn: 'Sunan an-Nasa\'i',
    nameBn: 'সুনান আন-নাসায়ী',
    totalHadiths: 5758,
    totalSections: 50,
    descriptionBn: 'ইমাম নাসায়ী (রহ.) সংকলিত সূক্ষ্ম যাচাইকৃত হাদিস সংকলন',
  },
  {
    id: 'ibnmajah',
    nameEn: 'Sunan Ibn Majah',
    nameBn: 'সুনান ইবনে মাজাহ',
    totalHadiths: 4341,
    totalSections: 37,
    descriptionBn: 'সিহাহ সিত্তার অন্যতম জনপ্রিয় সংকলন',
  },
  {
    id: 'malik',
    nameEn: 'Muwatta Malik',
    nameBn: 'মুয়াত্তা মালিক',
    totalHadiths: 1858,
    totalSections: 61,
    descriptionBn: 'ইমাম মালিক (রহ.) সংকলিত ইসলামের প্রাচীনতম প্রামাণ্য হাদিস সংকলন',
  },
  {
    id: 'nawawi',
    nameEn: '40 Hadith of an-Nawawi',
    nameBn: 'ইমাম নববীর ৪০ হাদিস',
    totalHadiths: 42,
    totalSections: 1,
    descriptionBn: 'ইমাম নববী (রহ.) সংকলিত দ্বীনের মৌলিক স্তম্ভবিষয়ক ৪২টি হাদিস',
  },
];

export interface CanonicalHadithItem {
  readonly id: string; // `${bookId}-${hadithnumber}`
  readonly bookId: string;
  readonly bookNameBn: string;
  readonly bookNameEn: string;
  readonly hadithNumber: number;
  readonly chapterNumber: number;
  readonly chapterNameBn: string;
  readonly chapterNameEn: string;
  readonly arabic: string;
  readonly bangla: string;
  readonly narratorBn?: string;
  readonly narratorEn?: string;
  readonly grade?: string;
}

export interface HadithChapter {
  readonly number: number;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly hadithCount?: number;
}

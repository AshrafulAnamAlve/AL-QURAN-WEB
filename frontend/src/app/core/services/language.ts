import { Injectable, computed, inject, signal } from '@angular/core';
import { STORAGE_KEYS, StorageService } from './storage';

export type AppLanguage = 'en' | 'bn';

/**
 * Authentic, culturally natural Islamic Bangla vocabulary.
 * Uses respectful terms established in Islamic literature in Bangladesh,
 * not literal machine translations.
 */
export const TRANSLATIONS = {
  // Navigation
  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.quran': { en: 'Quran', bn: 'কুরআন' },
  'nav.juz': { en: 'Juz', bn: 'পারা' },
  'nav.calendar': { en: 'Calendar', bn: 'ক্যালেন্ডার' },
  'nav.prayer': { en: 'Prayer Times', bn: 'নামাজের সময়সূচি' },
  'nav.mosques': { en: 'Mosques', bn: 'মসজিদ' },
  'nav.bookmarks': { en: 'Bookmarks', bn: 'বুকমার্ক' },
  'nav.settings': { en: 'Settings', bn: 'সেটিংস' },
  'nav.search': { en: 'Search', bn: 'অনুসন্ধান' },
  'brand.tag': { en: 'Read · Listen · Reflect', bn: 'পড়ুন · শুনুন · অনুধাবন করুন' },

  // Home Page
  'home.hero.title': {
    en: 'Read, listen to and reflect on the Quran',
    bn: 'কুরআন তিলাওয়াত করুন, শুনুন এবং অনুধাবন করুন',
  },
  'home.hero.readQuran': { en: 'Read Quran', bn: 'কুরআন তিলাওয়াত' },
  'home.hero.prayerTimes': { en: 'Prayer Times', bn: 'নামাজের সময়সূচি' },
  'home.hero.findMosque': { en: 'Find a Mosque', bn: 'নিকটস্থ মসজিদ' },
  'home.continue.title': { en: 'Continue Reading', bn: 'পড়া চালিয়ে যান' },
  'home.continue.resume': { en: 'Resume', bn: 'পড়ুন' },
  'home.continue.progress': { en: 'Quran Reading Progress', bn: 'কুরআন পড়ার অগ্রগতি' },
  'home.continue.ayahsRead': { en: 'ayahs read', bn: 'আয়াত সম্পন্ন' },
  'home.prayer.next': { en: 'Next', bn: 'পরবর্তী' },
  'home.prayer.timetable': { en: 'Timetable', bn: 'পূর্ণ সময়সূচি' },

  // Prayer Page
  'prayer.title': { en: 'Prayer Times', bn: 'নামাজের সময়সূচি' },
  'prayer.changeLocation': { en: 'Change', bn: 'পরিবর্তন' },
  'prayer.useGps': { en: 'Use GPS', bn: 'জিপিএস' },
  'prayer.locating': { en: 'Locating…', bn: 'খোঁজা হচ্ছে…' },
  'prayer.upcoming': { en: 'Upcoming Prayer', bn: 'পরবর্তী ওয়াক্ত' },
  'prayer.tomorrowFajr': { en: "Tomorrow's Fajr", bn: 'আগামীকালের ফজর' },
  'prayer.time': { en: 'Time', bn: 'ওয়াক্তের সময়' },
  'prayer.remaining': { en: 'Remaining', bn: 'বাকি সময়' },
  'prayer.currentPrayer': { en: 'Current Prayer', bn: 'বর্তমান ওয়াক্ত' },
  'prayer.nextPrayer': { en: 'Next', bn: 'পরবর্তী' },
  'prayer.sunrise': { en: 'Sunrise', bn: 'সূর্যোদয়' },
  'prayer.suhoorEnds': { en: 'Imsak (Suhoor ends)', bn: 'সাহরির শেষ সময় (ইমসাক)' },
  'prayer.midnight': { en: 'Islamic Midnight', bn: 'মধ্যরাত' },
  'prayer.calculationTitle': { en: 'Calculation & Jurisprudence', bn: 'হিসাব পদ্ধতি ও মাজহাব' },
  'prayer.method': { en: 'Method', bn: 'পদ্ধতি' },
  'prayer.asrSchool': { en: 'Asr School', bn: 'আসরের মাজহাব' },
  'prayer.shafi': { en: 'Shafi / Standard', bn: 'শাফেঈ (প্রমিত)' },
  'prayer.hanafi': { en: 'Hanafi', bn: 'হানাফী' },
  'prayer.changeMethod': { en: 'Change Method', bn: 'পদ্ধতি পরিবর্তন' },
  'prayer.selectCity': { en: 'Select Your City', bn: 'আপনার শহর নির্বাচন করুন' },
  'prayer.useCurrentLocation': { en: 'Use My Current Location', bn: 'আমার বর্তমান অবস্থান শনাক্ত করুন' },
  'prayer.searchPlaceholder': { en: 'Search city (e.g. Dhaka, London, Makkah)…', bn: 'শহরের নাম লিখুন (যেমন: ঢাকা, মক্কা, লন্ডন)…' },
  'prayer.popularCities': { en: 'Popular Cities', bn: 'জনপ্রিয় শহরসমূহ' },
  'prayer.permissionDeniedTitle': { en: 'Location access is disabled or denied', bn: 'লোকেশন ব্যবহারের অনুমতি পাওয়া যায়নি' },
  'prayer.permissionDeniedText': {
    en: 'We respect your privacy. You can pick your city manually below to get accurate prayer times.',
    bn: 'আপনার গোপনীয়তা সুরক্ষিত। সঠিক নামাজের সময়সূচি পেতে নিচের তালিকা থেকে আপনার শহর নির্বাচন করুন।',
  },
  'prayer.chooseMethodTitle': { en: 'Choose Calculation Method', bn: 'নামাজের হিসাব পদ্ধতি নির্বাচন' },
  'prayer.chooseMethodIntro': {
    en: 'Different Islamic authorities calculate Fajr and Isha using slightly different twilight angles.',
    bn: 'ভৌগোলিক অবস্থান ও বিভিন্ন ইসলামিক গবেষণা সংস্থার নিয়মানুযায়ী ফজর ও এশার কোণ নির্ধারণ করা হয়।',
  },

  // Surah / Reader
  'reader.allSurahs': { en: 'All surahs', bn: 'সকল সূরা' },
  'reader.surah': { en: 'Surah', bn: 'সূরা' },
  'reader.ayahs': { en: 'ayahs', bn: 'আয়াত' },
  'reader.meccan': { en: 'Meccan', bn: 'মাক্কী' },
  'reader.medinan': { en: 'Medinan', bn: 'মাদানী' },
  'reader.previous': { en: 'Previous', bn: 'পূর্ববর্তী' },
  'reader.next': { en: 'Next', bn: 'পরবর্তী' },
  'reader.mode.bangla': { en: 'Bangla', bn: 'বাংলা' },
  'reader.mode.english': { en: 'English', bn: 'ইংরেজি' },
  'reader.mode.both': { en: 'Both', bn: 'উভয়' },
  'reader.mode.arabicOnly': { en: 'Arabic only', bn: 'শুধু আরবি' },
  'reader.reading': { en: 'Reading', bn: 'পঠন শৈলী' },

  // Settings
  'settings.title': { en: 'Settings & Preferences', bn: 'সেটিংস ও পছন্দসমূহ' },
  'settings.subtitle': {
    en: 'Customize reading appearance, audio, timings and manage your stored data',
    bn: 'কুরআন তিলাওয়াত, প্রদর্শন, অডিও এবং আপনার সংরক্ষিত তথ্য নিয়ন্ত্রণ করুন',
  },
  'settings.reading': { en: 'Reading Preferences', bn: 'পঠন ও প্রদর্শন শৈলী' },
  'settings.appearance': { en: 'Appearance & Theme', bn: 'থিম ও প্রদর্শন মোড' },
  'settings.language': { en: 'Interface Language', bn: 'ইন্টারফেসের ভাষা' },
  'settings.audio': { en: 'Recitation & Audio', bn: 'কুরআন তিলাওয়াত ও অডিও' },
  'settings.location': { en: 'Location & Prayer Calculation', bn: 'অবস্থান ও নামাজের হিসাব' },
  'settings.data': { en: 'Data & Storage Management', bn: 'সংরক্ষিত তথ্য ও মেমরি' },

  // Settings - Reading controls
  'settings.reading.arabicSize': { en: 'Arabic Font Size', bn: 'আরবি ফন্ট সাইজ' },
  'settings.reading.translationSize': { en: 'Translation Font Size', bn: 'অনুবাদ ফন্ট সাইজ' },
  'settings.reading.lineHeight': { en: 'Line Spacing', bn: 'লাইনের উচ্চতা ও ব্যবধান' },
  'settings.reading.readingWidth': { en: 'Reading Column Width', bn: 'পড়ার পৃষ্ঠার প্রস্থ' },
  'settings.reading.translationMode': { en: 'Show Translations', bn: 'অনুবাদ প্রদর্শন' },
  'settings.reading.resetLayout': { en: 'Reset to Defaults', bn: 'ডিফল্টে ফিরিয়ে নিন' },
  'settings.reading.previewTitle': { en: 'Live Reading Preview', bn: 'লাইভ প্রিভিউ' },
  'settings.reading.previewRef': { en: 'Surah Al-Baqarah 2:255 (Ayat al-Kursi)', bn: 'সূরা আল-বাকারাহ ২:২৫৫ (আয়াতুল কুরসী)' },

  // Settings - Appearance
  'settings.theme.light': { en: 'Light', bn: 'লাইট (উজ্জ্বল)' },
  'settings.theme.dark': { en: 'Dark', bn: 'ডার্ক (গাঢ়)' },
  'settings.theme.system': { en: 'System Default', bn: 'সিস্টেম (ডিভাইস অনুযায়ী)' },
  'settings.theme.desc': {
    en: 'Matches your system display mode automatically, or lock to light/dark.',
    bn: 'আপনার ডিভাইসের ডিসপ্লে মোডের সাথে মিলিয়ে নিন অথবা পছন্দমতো বেছে নিন।',
  },

  // Settings - Language
  'settings.lang.english': { en: 'English', bn: 'English (ইংরেজি)' },
  'settings.lang.bangla': { en: 'Bangla (বাংলা)', bn: 'বাংলা (Bangla)' },
  'settings.lang.desc': {
    en: 'Switch between English and authentic Islamic Bangla vocabulary across the application.',
    bn: 'সম্পূর্ণ অ্যাপের ইন্টারফেস খাঁটি ও মার্জিত বাংলা অথবা ইংরেজিতে প্রদর্শন করুন।',
  },

  // Settings - Audio
  'settings.audio.reciter': { en: 'Default Reciter (Qari)', bn: 'প্রধান ক্বারী (তেলাওয়াতকারী)' },
  'settings.audio.speed': { en: 'Playback Speed', bn: 'তিলাওয়াতের গতি' },
  'settings.audio.desc': {
    en: 'Choose your preferred reciter and playback tempo for continuous recitation.',
    bn: 'পছন্দের ক্বারীর তিলাওয়াত ও গতি নির্বাচন করুন।',
  },

  // Settings - Location & Prayer
  'settings.location.current': { en: 'Current City', bn: 'বর্তমান শহর' },
  'settings.location.change': { en: 'Change City', bn: 'শহর পরিবর্তন' },
  'settings.location.gps': { en: 'Use GPS', bn: 'জিপিএস অবস্থান' },
  'settings.location.school': { en: 'Asr Jurisprudence School', bn: 'আসরের মাজহাব' },
  'settings.location.method': { en: 'Calculation Method', bn: 'নামাজের হিসাব পদ্ধতি' },

  // Settings - Data & Storage
  'settings.data.storageUsed': { en: 'Local Storage Used', bn: 'ব্যবহৃত লোকাল মেমরি' },
  'settings.data.bookmarksCount': { en: 'Saved Bookmarks', bn: 'সংরক্ষিত আয়াত' },
  'settings.data.progressCount': { en: 'Ayahs Read', bn: 'পঠিত আয়াত' },
  'settings.data.lastRead': { en: 'Last Reading Position', bn: 'সর্বশেষ পঠিত স্থান' },
  'settings.data.noLastRead': { en: 'None yet', bn: 'এখনও পড়া হয়নি' },
  'settings.data.backupTitle': { en: 'Backup & Restore', bn: 'ব্যাকআপ ও তথ্য পুনরুদ্ধার' },
  'settings.data.backupDesc': {
    en: 'Export your bookmarks, reading progress and custom settings to a JSON file, or restore a previously saved backup.',
    bn: 'আপনার বুকমার্ক, পড়ার অগ্রগতি ও সকল সেটিংস একটি ফাইলে সংরক্ষণ করুন অথবা ব্যাকআপ ফাইল থেকে তথ্য ফিরিয়ে আনুন।',
  },
  'settings.data.export': { en: 'Export Backup JSON', bn: 'ব্যাকআপ ফাইল ডাউনলোড' },
  'settings.data.import': { en: 'Restore Backup JSON', bn: 'ব্যাকআপ থেকে রিস্টোর' },
  'settings.data.clearBookmarks': { en: 'Clear Bookmarks', bn: 'বুকমার্ক মুছে ফেলুন' },
  'settings.data.clearProgress': { en: 'Reset Reading Progress', bn: 'পড়ার অগ্রগতি মুছুন' },
  'settings.data.resetSettings': { en: 'Reset All Settings', bn: 'সেটিংস রিসেট করুন' },
  'settings.data.resetAll': { en: 'Clear All App Data', bn: 'সকল তথ্য সম্পূর্ণ মুছুন' },
  'settings.data.clearBookmarksConfirm': {
    en: 'Are you sure you want to delete all saved bookmarks? This action cannot be undone.',
    bn: 'আপনি কি নিশ্চিত যে সকল সংরক্ষিত বুকমার্ক মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।',
  },
  'settings.data.clearProgressConfirm': {
    en: 'Are you sure you want to reset your Quran reading progress? This will reset your ayahs read counter to zero.',
    bn: 'আপনি কি নিশ্চিত যে আপনার কুরআন পড়ার অগ্রগতি রিসেট করতে চান? আপনার পড়া আয়াতের সংখ্যা শূন্য হয়ে যাবে।',
  },
  'settings.data.resetSettingsConfirm': {
    en: 'Are you sure you want to reset all reading, audio and appearance settings back to their factory defaults?',
    bn: 'আপনি কি সকল পঠন শৈলী, অডিও ও থিম সেটিংস প্রাথমিক অবস্থায় ফিরিয়ে নিতে চান?',
  },
  'settings.data.resetAllConfirm': {
    en: 'Are you sure you want to wipe all local data including bookmarks, reading history and preferences? This will return the application to a completely fresh state.',
    bn: 'আপনি কি নিশ্চিত যে বুকমার্ক, পড়ার ইতিহাস ও সেটিংসসহ সকল তথ্য সম্পূর্ণ মুছে ফেলতে চান? অ্যাপটি প্রাথমিক অবস্থায় ফিরে যাবে।',
  },
  'settings.data.cancel': { en: 'Cancel', bn: 'বাতিল' },
  'settings.data.confirm': { en: 'Confirm & Delete', bn: 'নিশ্চিত করুন' },
  'settings.data.importSuccess': {
    en: 'Backup restored successfully! All preferences and data have been updated.',
    bn: 'ব্যাকআপ সফলভাবে ফিরিয়ে আনা হয়েছে! আপনার সকল তথ্য হালনাগাদ করা হয়েছে।',
  },
  'settings.data.importError': {
    en: 'Invalid backup file. Please select a valid Al-Quran backup JSON file.',
    bn: 'অকার্যকর ব্যাকআপ ফাইল। দয়া করে সঠিক আল-কুরআন ব্যাকআপ ফাইল নির্বাচন করুন।',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storage = inject(StorageService);

  private readonly _language = signal<AppLanguage>(this.loadInitialLanguage());
  readonly language = this._language.asReadonly();
  readonly isBn = computed(() => this._language() === 'bn');

  setLanguage(lang: AppLanguage): void {
    this._language.set(lang);
    this.storage.write(STORAGE_KEYS.language, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  toggleLanguage(): void {
    const next = this._language() === 'en' ? 'bn' : 'en';
    this.setLanguage(next);
  }

  translate(key: TranslationKey, fallback?: string): string {
    const item = TRANSLATIONS[key];
    if (!item) return fallback ?? key;
    return this.isBn() ? item.bn : item.en;
  }

  private loadInitialLanguage(): AppLanguage {
    const saved = this.storage.read<AppLanguage | null>(STORAGE_KEYS.language, null);
    if (saved === 'en' || saved === 'bn') {
      return saved;
    }
    return 'en';
  }
}

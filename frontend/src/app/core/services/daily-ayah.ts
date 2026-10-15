import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Ayah, Surah } from '../models/quran';
import { AudioPlayerService } from './audio-player';
import { BookmarkService } from './bookmarks';
import { QuranApiService } from './quran-api';
import { ShareService } from './share';

/** A curated set of foundational, uplifting, and spiritually rich ayahs for the daily reflection. */
export const CURATED_DAILY_AYAHS: readonly { readonly surah: number; readonly ayah: number }[] = [
  { surah: 1, ayah: 1 },   // Al-Fatiha 1:1
  { surah: 1, ayah: 2 },   // Al-Fatiha 1:2
  { surah: 1, ayah: 5 },   // Al-Fatiha 1:5 - You alone we worship, and You alone we ask for help
  { surah: 2, ayah: 152 }, // Al-Baqarah 2:152 - Remember Me, I will remember you
  { surah: 2, ayah: 186 }, // Al-Baqarah 2:186 - When My servants ask about Me, I am near
  { surah: 2, ayah: 255 }, // Al-Baqarah 2:255 - Ayat al-Kursi
  { surah: 2, ayah: 286 }, // Al-Baqarah 2:286 - Allah does not burden a soul beyond its capacity
  { surah: 3, ayah: 139 }, // Ali 'Imran 3:139 - Do not weaken and do not grieve
  { surah: 3, ayah: 159 }, // Ali 'Imran 3:159 - When you have decided, rely upon Allah
  { surah: 3, ayah: 191 }, // Ali 'Imran 3:191 - Those who remember Allah standing, sitting and on their sides
  { surah: 6, ayah: 162 }, // Al-An'am 6:162 - My prayer, sacrifice, living and dying are for Allah
  { surah: 7, ayah: 156 }, // Al-A'raf 7:156 - My mercy embraces all things
  { surah: 9, ayah: 129 }, // At-Tawbah 9:129 - Sufficient for me is Allah
  { surah: 11, ayah: 115 }, // Hud 11:115 - Be patient, for Allah does not waste the reward of the good
  { surah: 13, ayah: 28 }, // Ar-Ra'd 13:28 - In the remembrance of Allah hearts find rest
  { surah: 14, ayah: 7 },  // Ibrahim 14:7 - If you are grateful, I will surely give you more
  { surah: 16, ayah: 128 }, // An-Nahl 16:128 - Allah is with those who are God-conscious
  { surah: 20, ayah: 114 }, // Taha 20:114 - My Lord, increase me in knowledge
  { surah: 21, ayah: 87 }, // Al-Anbiya 21:87 - There is no deity except You; exalted are You
  { surah: 24, ayah: 35 }, // An-Nur 24:35 - Allah is the Light of the heavens and the earth
  { surah: 25, ayah: 63 }, // Al-Furqan 25:63 - The servants of the Most Merciful walk humbly
  { surah: 29, ayah: 69 }, // Al-'Ankabut 29:69 - Those who strive for Us, We guide to Our paths
  { surah: 39, ayah: 53 }, // Az-Zumar 39:53 - Do not despair of the mercy of Allah
  { surah: 40, ayah: 60 }, // Ghafir 40:60 - Call upon Me; I will respond to you
  { surah: 41, ayah: 34 }, // Fussilat 41:34 - Repel evil with that which is better
  { surah: 49, ayah: 13 }, // Al-Hujurat 49:13 - The most noble of you is the most righteous
  { surah: 55, ayah: 13 }, // Ar-Rahman 55:13 - Which of the favors of your Lord will you deny?
  { surah: 57, ayah: 4 },  // Al-Hadid 57:4 - He is with you wherever you are
  { surah: 65, ayah: 3 },  // At-Talaq 65:3 - Whoever relies upon Allah, He is sufficient for him
  { surah: 67, ayah: 2 },  // Al-Mulk 67:2 - Who created death and life to test which of you is best in deed
  { surah: 94, ayah: 5 },  // Ash-Sharh 94:5 - For indeed, with hardship comes ease
  { surah: 94, ayah: 6 },  // Ash-Sharh 94:6 - Indeed, with hardship comes ease
  { surah: 103, ayah: 1 }, // Al-'Asr 103:1-3 - By time, humankind is in loss except those who believe
  { surah: 112, ayah: 1 }, // Al-Ikhlas 112:1 - Say, He is Allah, [who is] One
  { surah: 113, ayah: 1 }, // Al-Falaq 113:1 - Say, I seek refuge in the Lord of daybreak
  { surah: 114, ayah: 1 }, // An-Nas 114:1 - Say, I seek refuge in the Lord of mankind
] as const;

/**
 * Computes a stable deterministic index for any given date string (YYYY-MM-DD).
 * Guaranteed to produce the exact same index for the entire day across all reloads,
 * and increments predictably at midnight.
 */
export function getDailyAyahIndex(dateStr: string, totalCount: number): number {
  if (totalCount <= 0) return 0;
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || 2026;
  const month = parts[1] || 1;
  const day = parts[2] || 1;

  // Day of year calculation for smooth daily progression
  const seed = year * 366 + month * 31 + day;
  return Math.abs(seed) % totalCount;
}

/**
 * Service that manages the deterministic "Ayah of the Day".
 */
@Injectable({ providedIn: 'root' })
export class DailyAyahService {
  private readonly quranApi = inject(QuranApiService);
  private readonly audioPlayer = inject(AudioPlayerService);
  private readonly bookmarkService = inject(BookmarkService);
  private readonly shareService = inject(ShareService);

  private readonly _ayah = signal<Ayah | null>(null);
  readonly ayah = this._ayah.asReadonly();

  private readonly _surah = signal<Surah | null>(null);
  readonly surah = this._surah.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  readonly isBookmarked = computed(() => {
    const a = this._ayah();
    return a ? this.bookmarkService.has(a.globalNumber) : false;
  });

  readonly isPlaying = computed(() => {
    const a = this._ayah();
    return a ? this.audioPlayer.isPlayingAyah(a.globalNumber) : false;
  });

  constructor() {
    this.loadTodayAyah();
  }

  /** Loads the deterministic Ayah of the Day for today's date. */
  async loadTodayAyah(overrideDate?: string): Promise<void> {
    const today = overrideDate || new Date().toISOString().slice(0, 10);
    const index = getDailyAyahIndex(today, CURATED_DAILY_AYAHS.length);
    const target = CURATED_DAILY_AYAHS[index];

    this._loading.set(true);
    this._error.set(null);

    try {
      const [surahs, ayah] = await Promise.all([
        firstValueFrom(this.quranApi.getSurahs()),
        firstValueFrom(this.quranApi.getAyah(target.surah, target.ayah, ['bn.bengali', 'en.sahih'])),
      ]);

      const surahInfo = surahs.find((s) => s.number === target.surah) ?? null;
      this._surah.set(surahInfo);
      this._ayah.set(ayah);
      this._loading.set(false);
    } catch {
      this._error.set('Could not load the Ayah of the Day.');
      this._loading.set(false);
    }
  }

  /** Toggles audio recitation for this daily ayah. */
  async toggleAudio(): Promise<void> {
    const ayah = this._ayah();
    const surah = this._surah();
    if (!ayah || !surah) return;

    this.audioPlayer.setPageQueue({
      id: `daily-ayah:${ayah.globalNumber}`,
      kind: 'surah',
      title: `${surah.englishName} : ${ayah.numberInSurah}`,
      ayahs: [
        {
          globalNumber: ayah.globalNumber,
          surahNumber: surah.number,
          numberInSurah: ayah.numberInSurah,
          surahEnglishName: surah.englishName,
          surahArabicName: surah.arabicName,
        },
      ],
    });

    await this.audioPlayer.toggleAyah(ayah.globalNumber);
  }

  /** Toggles bookmarking for this daily ayah. */
  toggleBookmark(): void {
    const ayah = this._ayah();
    const surah = this._surah();
    if (!ayah || !surah) return;

    const bnTranslation = ayah.translations.find((t) => t.language === 'bn')?.text ?? '';

    this.bookmarkService.toggle({
      globalNumber: ayah.globalNumber,
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      surahEnglishName: surah.englishName,
      surahBanglaName: surah.banglaName,
      arabic: ayah.arabic,
      translation: bnTranslation,
      savedAt: new Date().toISOString(),
    });
  }

  /** Shares or copies the daily ayah. */
  async share(): Promise<'shared' | 'copied' | 'failed'> {
    const ayah = this._ayah();
    const surah = this._surah();
    if (!ayah || !surah) return 'failed';

    return this.shareService.shareAyah({
      surahEnglishName: surah.englishName,
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      arabic: ayah.arabic,
      translations: ayah.translations.map((t) => `${t.translatorEnglish}: ${t.text}`),
    });
  }
}

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Ayah, Surah } from '../models/quran';
import { AudioPlayerService } from './audio-player';
import { BookmarkService } from './bookmarks';
import { DailyAyahService, CURATED_DAILY_AYAHS, getDailyAyahIndex } from './daily-ayah';
import { QuranApiService } from './quran-api';
import { ShareService } from './share';

describe('DailyAyah', () => {
  describe('getDailyAyahIndex', () => {
    it('returns the same index for the same date', () => {
      const idx1 = getDailyAyahIndex('2026-10-15', 30);
      const idx2 = getDailyAyahIndex('2026-10-15', 30);
      expect(idx1).toBe(idx2);
      expect(idx1).toBeGreaterThanOrEqual(0);
      expect(idx1).toBeLessThan(30);
    });

    it('changes from day to day', () => {
      const idx1 = getDailyAyahIndex('2026-10-15', 100);
      const idx2 = getDailyAyahIndex('2026-10-16', 100);
      expect(idx1).not.toBe(idx2);
    });

    it('handles non-positive total count safely', () => {
      expect(getDailyAyahIndex('2026-10-15', 0)).toBe(0);
      expect(getDailyAyahIndex('2026-10-15', -5)).toBe(0);
    });
  });

  describe('DailyAyahService', () => {
    let service: DailyAyahService;
    let quranApi: {
      getSurahs: ReturnType<typeof vi.fn>;
      getAyah: ReturnType<typeof vi.fn>;
    };
    let audioPlayer: {
      setPageQueue: ReturnType<typeof vi.fn>;
      toggleAyah: ReturnType<typeof vi.fn>;
      isPlayingAyah: ReturnType<typeof vi.fn>;
    };
    let bookmarkService: {
      has: ReturnType<typeof vi.fn>;
      toggle: ReturnType<typeof vi.fn>;
    };
    let shareService: {
      shareAyah: ReturnType<typeof vi.fn>;
    };

    const mockSurah: Surah = {
      number: 1,
      arabicName: 'الفاتحة',
      englishName: 'Al-Fatihah',
      englishMeaning: 'The Opening',
      banglaName: 'আল-ফাতিহা',
      banglaMeaning: 'সূচনা',
      ayahCount: 7,
      revelationType: 'Meccan',
      hasBismillah: false,
    };

    const mockAyah: Ayah = {
      globalNumber: 1,
      numberInSurah: 1,
      surahNumber: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translations: [
        {
          edition: 'bn.bengali',
          language: 'bn',
          translator: 'Muhiuddin Khan',
          translatorEnglish: 'Muhiuddin Khan',
          text: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
          direction: 'ltr',
        },
        {
          edition: 'en.sahih',
          language: 'en',
          translator: 'Sahih International',
          translatorEnglish: 'Sahih International',
          text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
          direction: 'ltr',
        },
      ],
      juz: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      isSajda: false,
      audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    };

    beforeEach(() => {
      quranApi = {
        getSurahs: vi.fn().mockImplementation(() =>
          of(Array.from({ length: 114 }, (_, i) => ({ ...mockSurah, number: i + 1 })))
        ),
        getAyah: vi.fn().mockReturnValue(of(mockAyah)),
      };

      audioPlayer = {
        setPageQueue: vi.fn(),
        toggleAyah: vi.fn().mockResolvedValue(true),
        isPlayingAyah: vi.fn().mockReturnValue(false),
      };

      bookmarkService = {
        has: vi.fn().mockReturnValue(false),
        toggle: vi.fn().mockReturnValue(true),
      };

      shareService = {
        shareAyah: vi.fn().mockResolvedValue('copied'),
      };

      TestBed.configureTestingModule({
        providers: [
          DailyAyahService,
          { provide: QuranApiService, useValue: quranApi },
          { provide: AudioPlayerService, useValue: audioPlayer },
          { provide: BookmarkService, useValue: bookmarkService },
          { provide: ShareService, useValue: shareService },
        ],
      });

      service = TestBed.inject(DailyAyahService);
    });

    it('loads the daily ayah on initialization', async () => {
      await service.loadTodayAyah('2026-10-15');
      expect(quranApi.getSurahs).toHaveBeenCalled();
      expect(quranApi.getAyah).toHaveBeenCalled();
      expect(service.ayah()?.globalNumber).toBe(1);
      expect(service.error()).toBeNull();
    });

    it('handles API errors gracefully', async () => {
      quranApi.getAyah.mockReturnValue(throwError(() => new Error('Network error')));
      await service.loadTodayAyah('2026-10-15');
      expect(service.error()).toContain('Could not load');
    });

    it('delegates audio playback to AudioPlayerService', async () => {
      await service.loadTodayAyah('2026-10-15');
      await service.toggleAudio();

      expect(audioPlayer.setPageQueue).toHaveBeenCalled();
      expect(audioPlayer.toggleAyah).toHaveBeenCalledWith(1);
    });

    it('toggles bookmarks through BookmarkService', async () => {
      await service.loadTodayAyah('2026-10-15');
      service.toggleBookmark();

      expect(bookmarkService.toggle).toHaveBeenCalled();
    });

    it('shares the daily ayah through ShareService', async () => {
      await service.loadTodayAyah('2026-10-15');
      const result = await service.share();

      expect(shareService.shareAyah).toHaveBeenCalled();
      expect(result).toBe('copied');
    });
  });
});

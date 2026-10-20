import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Ayah, Surah } from '../../core/models/quran';
import { PrayerDay, PrayerTime } from '../../core/models/prayer';
import { DailyAyahService } from '../../core/services/daily-ayah';
import { LocationApiService } from '../../core/services/location-api';
import { MetaApiService } from '../../core/services/meta-api';
import { PrayerApiService } from '../../core/services/prayer-api';
import { PrayerTimesService } from '../../core/services/prayer';
import { ReadingPositionService } from '../../core/services/reading-position';
import { ReadingProgressService } from '../../core/services/reading-progress';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageService } from '../../core/services/storage';
import { HomePage } from './home';
import { TaskService } from '../../core/services/task';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let component: HomePage;
  let readingPosition: ReadingPositionService;
  let readingProgress: ReadingProgressService;
  let prayerTimes: PrayerTimesService;
  let taskService: TaskService;

  const mockPrayerTimes: PrayerTime[] = [
    { key: 'fajr', name: 'Fajr', arabicName: 'الفجر', banglaName: 'ফজর', time: '04:30', at: '2026-10-14T04:30:00Z', isPrayer: true },
    { key: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', banglaName: 'সূর্যোদয়', time: '05:45', at: '2026-10-14T05:45:00Z', isPrayer: false },
    { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', banglaName: 'যোহর', time: '11:45', at: '2026-10-14T11:45:00Z', isPrayer: true },
    { key: 'asr', name: 'Asr', arabicName: 'العصر', banglaName: 'আসর', time: '15:15', at: '2026-10-14T15:15:00Z', isPrayer: true },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', banglaName: 'মাগরিব', time: '17:35', at: '2026-10-14T17:35:00Z', isPrayer: true },
    { key: 'isha', name: 'Isha', arabicName: 'العشاء', banglaName: 'এশা', time: '18:50', at: '2026-10-14T18:50:00Z', isPrayer: true },
  ];

  const mockDay: PrayerDay = {
    date: '2026-10-14',
    readableDate: '14 Oct 2026',
    hijri: null,
    location: {
      latitude: 21.42,
      longitude: 39.83,
      timezone: 'Asia/Riyadh',
      place: 'Makkah',
    },
    method: {
      id: 2,
      name: 'ISNA',
      school: 'Shafi',
    },
    times: mockPrayerTimes,
    notice: 'Calculated.',
  };

  beforeEach(async () => {
    localStorage.clear();
    const metaApi = {
      getUpstreamHealth: vi.fn().mockReturnValue(
        of({
          checkedAt: new Date().toISOString(),
          upstreams: [
            { key: 'quran', displayName: 'AlQuran.cloud', healthy: true, latencyMs: 50 },
          ],
        }),
      ),
    };

    const prayerApi = {
      getTimings: vi.fn().mockReturnValue(of(mockDay)),
      getMethods: vi.fn().mockReturnValue(of([])),
    };

    const locationApi = {
      search: vi.fn().mockReturnValue(of([])),
      reverse: vi.fn().mockReturnValue(of(null)),
    };

    const mockAyah: Ayah = {
      globalNumber: 262,
      numberInSurah: 255,
      surahNumber: 2,
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      translations: [
        {
          edition: 'bn.bengali',
          language: 'bn',
          translator: 'Muhiuddin Khan',
          translatorEnglish: 'Muhiuddin Khan',
          text: 'আল্লাহ, যিনি ছাড়া অন্য কোন উপাস্য নেই, তিনি চিরঞ্জীব।',
          direction: 'ltr',
        },
        {
          edition: 'en.sahih',
          language: 'en',
          translator: 'Sahih International',
          translatorEnglish: 'Sahih International',
          text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence.',
          direction: 'ltr',
        },
      ],
      juz: 3,
      page: 42,
      ruku: 35,
      hizbQuarter: 5,
      isSajda: false,
      audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
    };

    const mockSurah: Surah = {
      number: 2,
      arabicName: 'البقرة',
      englishName: 'Al-Baqarah',
      englishMeaning: 'The Cow',
      banglaName: 'আল-বাকারা',
      banglaMeaning: 'গাভী',
      ayahCount: 286,
      revelationType: 'Medinan',
      hasBismillah: true,
    };

    const dailyAyahMock = {
      ayah: signal<Ayah | null>(mockAyah),
      surah: signal<Surah | null>(mockSurah),
      isBookmarked: signal<boolean>(false),
      isPlaying: signal<boolean>(false),
      toggleAudio: vi.fn().mockResolvedValue(undefined),
      toggleBookmark: vi.fn(),
      share: vi.fn().mockResolvedValue('copied'),
    };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        StorageService,
        { provide: MetaApiService, useValue: metaApi },
        { provide: PrayerApiService, useValue: prayerApi },
        { provide: LocationApiService, useValue: locationApi },
        { provide: DailyAyahService, useValue: dailyAyahMock },
      ],
    }).compileComponents();

    readingPosition = TestBed.inject(ReadingPositionService);
    readingProgress = TestBed.inject(ReadingProgressService);
    prayerTimes = TestBed.inject(PrayerTimesService);
    taskService = TestBed.inject(TaskService);

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders hero greeting and navigation buttons', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Read, listen to and reflect on the Quran');
    expect(el.textContent).toContain('Read Quran');
  });

  it('renders current prayer waqt badge in hero section', () => {
    // 12:00 UTC (Dhuhr at 11:45 UTC, Asr at 15:15 UTC)
    prayerTimes.currentTime.set(new Date('2026-10-14T12:00:00Z'));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const waqtCard = el.querySelector('.hero__waqt-card');
    expect(waqtCard).not.toBeNull();
    expect(waqtCard?.textContent).toContain('Current Waqt:');
    expect(waqtCard?.textContent).toContain('Dhuhr');
    expect(waqtCard?.textContent).toContain('11:45 AM');
    expect(waqtCard?.textContent).toContain('Next: Asr');
    expect(waqtCard?.textContent).toContain('left');
  });

  it('renders prayer times card with live countdown', () => {
    // 03:00 UTC (before Fajr at 04:30)
    prayerTimes.currentTime.set(new Date('2026-10-14T03:00:00Z'));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const prayerCard = el.querySelector('.prayer-home-card');
    expect(prayerCard).not.toBeNull();
    expect(prayerCard?.textContent).toContain('Fajr');
    expect(prayerCard?.textContent).toContain('01:30:00');
    expect(prayerCard?.textContent).toContain('Timetable');
  });

  it('does not show Continue Reading card when there is no last read position', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.continue-card')).toBeNull();
  });

  it('shows Continue Reading card when last read position exists', () => {
    readingPosition.save({
      surahNumber: 2,
      surahEnglishName: 'Al-Baqarah',
      surahBanglaName: 'আল-বাকারা',
      ayahNumber: 255,
    });
    readingProgress.markRead(262);

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const card = el.querySelector('.continue-card');
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain('Al-Baqarah');
    expect(card?.textContent).toContain('255');
    expect(card?.textContent).toContain('Resume');
  });

  it('renders Ayah of the Day card', () => {
    const el: HTMLElement = fixture.nativeElement;
    const dailyCard = el.querySelector('.daily-ayah-card');
    expect(dailyCard).not.toBeNull();
    expect(dailyCard?.textContent).toContain('Al-Baqarah');
    expect(dailyCard?.textContent).toContain('255');
  });

  it('renders explore features grid with navigation cards', () => {
    const el: HTMLElement = fixture.nativeElement;
    const exploreSection = el.querySelector('.explore-section');
    expect(exploreSection).not.toBeNull();
    const cards = el.querySelectorAll('.explore-card');
    expect(cards.length).toBe(10);
  });

  it('renders Daily Quran Task Tracker card with streak and progress', () => {
    const el: HTMLElement = fixture.nativeElement;
    const taskCard = el.querySelector('.daily-task-home-card');
    expect(taskCard).not.toBeNull();
    expect(taskCard?.textContent).toContain("Today's Quran Goal");
    expect(taskCard?.textContent).toContain('Day Streak');
    expect(taskCard?.textContent).toContain('Edit Goal');
  });

  it('allows opening and closing the task goal modal', () => {
    expect(component.showGoalModal()).toBe(false);
    component.openGoalModal();
    fixture.detectChanges();
    expect(component.showGoalModal()).toBe(true);

    const modalEl = fixture.nativeElement.querySelector('aq-task-goal-modal');
    expect(modalEl).not.toBeNull();

    component.closeGoalModal();
    fixture.detectChanges();
    expect(component.showGoalModal()).toBe(false);
  });

  it('renders in-app reminder banner when reminder is active and goal is pending', () => {
    taskService.inAppReminderActive.set(true);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const banner = el.querySelector('.task-reminder-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Time for your daily Quran reading!');
    expect(banner?.textContent).toContain('Read Now');
  });

  it('renders prominent Hadith action button in hero and Hadith of the Day card', () => {
    const el: HTMLElement = fixture.nativeElement;

    // Hero button
    const hadithHeroBtn = el.querySelector('.hero__hadith-btn');
    expect(hadithHeroBtn).not.toBeNull();
    expect(hadithHeroBtn?.getAttribute('href')).toBe('/hadith');

    // Hadith of the day card
    const hadithCard = el.querySelector('.daily-hadith-home-card');
    expect(hadithCard).not.toBeNull();
    expect(hadithCard?.textContent).toContain('Hadith of the Day');

    // Bookmark and copy action buttons
    const buttons = hadithCard?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThanOrEqual(2);
  });
});


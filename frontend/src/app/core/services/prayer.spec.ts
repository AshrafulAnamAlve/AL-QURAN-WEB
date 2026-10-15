import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { CalculationMethod, PrayerDay, PrayerTime } from '../models/prayer';
import { DEFAULT_LOCATION, LocationService } from './location';
import { PrayerApiService } from './prayer-api';
import { PrayerTimesService } from './prayer';
import { STORAGE_KEYS, StorageService } from './storage';

describe('PrayerTimesService', () => {
  let service: PrayerTimesService;
  let prayerApi: { getTimings: ReturnType<typeof vi.fn>; getMethods: ReturnType<typeof vi.fn> };
  let locationService: LocationService;
  let storage: StorageService;

  const mockPrayerTimes: PrayerTime[] = [
    { key: 'imsak', name: 'Imsak', arabicName: 'الإمساك', banglaName: 'সাহরির শেষ', time: '04:15', at: '2026-10-14T04:15:00Z', isPrayer: false },
    { key: 'fajr', name: 'Fajr', arabicName: 'الفجر', banglaName: 'ফজর', time: '04:30', at: '2026-10-14T04:30:00Z', isPrayer: true },
    { key: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', banglaName: 'সূর্যোদয়', time: '05:45', at: '2026-10-14T05:45:00Z', isPrayer: false },
    { key: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', banglaName: 'যোহর', time: '11:45', at: '2026-10-14T11:45:00Z', isPrayer: true },
    { key: 'asr', name: 'Asr', arabicName: 'العصر', banglaName: 'আসর', time: '15:15', at: '2026-10-14T15:15:00Z', isPrayer: true },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', banglaName: 'মাগরিব', time: '17:35', at: '2026-10-14T17:35:00Z', isPrayer: true },
    { key: 'isha', name: 'Isha', arabicName: 'العشاء', banglaName: 'এশা', time: '18:50', at: '2026-10-14T18:50:00Z', isPrayer: true },
    { key: 'midnight', name: 'Midnight', arabicName: 'منتصف الليل', banglaName: 'মধ্যরাত', time: '23:40', at: '2026-10-14T23:40:00Z', isPrayer: false },
  ];

  const mockDay: PrayerDay = {
    date: '2026-10-14',
    readableDate: '14 Oct 2026',
    hijri: {
      day: 2,
      month: 4,
      year: 1448,
      monthNameEn: 'Rabi al-Thani',
      monthNameAr: 'ربيع الثاني',
      weekdayEn: 'Wednesday',
      weekdayAr: 'الأربعاء',
      monthLength: 30,
      formatted: '2 Rabi al-Thani 1448 AH',
      holidays: [],
    },
    location: {
      latitude: 21.42,
      longitude: 39.83,
      timezone: 'Asia/Riyadh',
      place: 'Makkah',
    },
    method: {
      id: 2,
      name: 'Islamic Society of North America (ISNA)',
      school: 'Shafi',
    },
    times: mockPrayerTimes,
    notice: 'Calculated times.',
  };

  const mockMethods: CalculationMethod[] = [
    { id: 1, code: 'MWL', name: 'Muslim World League', parameters: 'Fajr 18, Isha 17', isDefault: false },
    { id: 2, code: 'ISNA', name: 'Islamic Society of North America', parameters: 'Fajr 15, Isha 15', isDefault: true },
  ];

  beforeEach(() => {
    prayerApi = {
      getTimings: vi.fn().mockReturnValue(of(mockDay)),
      getMethods: vi.fn().mockReturnValue(of(mockMethods)),
    };

    TestBed.configureTestingModule({
      providers: [
        PrayerTimesService,
        LocationService,
        StorageService,
        { provide: PrayerApiService, useValue: prayerApi },
      ],
    });

    storage = TestBed.inject(StorageService);
    storage.clearAll();
    locationService = TestBed.inject(LocationService);
  });

  afterEach(() => {
    if (service) {
      service.ngOnDestroy();
    }
    storage.clearAll();
    vi.restoreAllMocks();
  });

  it('loads today timings on initialization with current location', () => {
    service = TestBed.inject(PrayerTimesService);
    expect(prayerApi.getTimings).toHaveBeenCalled();
    expect(service.timetable()).toEqual(mockDay);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('provides the 6 core timings in chronological order', () => {
    service = TestBed.inject(PrayerTimesService);
    const core = service.coreTimings();
    expect(core.length).toBe(6);
    expect(core.map((c) => c.key)).toEqual(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);
  });

  it('derives next prayer before Fajr as Fajr', () => {
    service = TestBed.inject(PrayerTimesService);
    // 03:00 UTC (before Fajr at 04:30 UTC)
    service.currentTime.set(new Date('2026-10-14T03:00:00Z'));

    const next = service.nextPrayer();
    expect(next).not.toBeNull();
    expect(next?.prayer.key).toBe('fajr');
    expect(next?.isTomorrow).toBe(false);
    expect(next?.formattedCountdown).toBe('01:30:00');
  });

  it('derives next prayer between Fajr and Dhuhr as Dhuhr (skipping Sunrise as not a salah)', () => {
    service = TestBed.inject(PrayerTimesService);
    // 06:00 UTC (after Sunrise 05:45 UTC, before Dhuhr 11:45 UTC)
    service.currentTime.set(new Date('2026-10-14T06:00:00Z'));

    const next = service.nextPrayer();
    expect(next).not.toBeNull();
    expect(next?.prayer.key).toBe('dhuhr');
    expect(next?.isTomorrow).toBe(false);
    expect(next?.hours).toBe(5);
    expect(next?.minutes).toBe(45);
  });

  it('derives next prayer between Dhuhr and Asr as Asr', () => {
    service = TestBed.inject(PrayerTimesService);
    // 13:00 UTC
    service.currentTime.set(new Date('2026-10-14T13:00:00Z'));

    const next = service.nextPrayer();
    expect(next?.prayer.key).toBe('asr');
    expect(next?.isTomorrow).toBe(false);
  });

  it('derives next prayer between Asr and Maghrib as Maghrib', () => {
    service = TestBed.inject(PrayerTimesService);
    // 16:00 UTC
    service.currentTime.set(new Date('2026-10-14T16:00:00Z'));

    const next = service.nextPrayer();
    expect(next?.prayer.key).toBe('maghrib');
    expect(next?.isTomorrow).toBe(false);
  });

  it('derives next prayer between Maghrib and Isha as Isha', () => {
    service = TestBed.inject(PrayerTimesService);
    // 18:00 UTC
    service.currentTime.set(new Date('2026-10-14T18:00:00Z'));

    const next = service.nextPrayer();
    expect(next?.prayer.key).toBe('isha');
    expect(next?.isTomorrow).toBe(false);
  });

  it('correctly handles the last prayer of the day rolling into tomorrow Fajr', () => {
    service = TestBed.inject(PrayerTimesService);
    // 20:00 UTC (after Isha at 18:50 UTC)
    service.currentTime.set(new Date('2026-10-14T20:00:00Z'));

    const next = service.nextPrayer();
    expect(next).not.toBeNull();
    expect(next?.prayer.key).toBe('fajr');
    expect(next?.isTomorrow).toBe(true);

    // Tomorrow Fajr is at 2026-10-15T04:30:00Z (8.5 hours from 20:00 UTC)
    expect(next?.hours).toBe(8);
    expect(next?.minutes).toBe(30);
  });

  it('rolls over to next prayer automatically when time advances past zero without reload', () => {
    service = TestBed.inject(PrayerTimesService);
    // 1 second before Dhuhr (11:44:59 UTC)
    service.currentTime.set(new Date('2026-10-14T11:44:59Z'));
    let next = service.nextPrayer();
    expect(next?.prayer.key).toBe('dhuhr');
    expect(next?.formattedCountdown).toBe('00:00:01');

    // Tick to 11:45:00 UTC (Dhuhr starts)
    service.currentTime.set(new Date('2026-10-14T11:45:00Z'));
    next = service.nextPrayer();
    expect(next?.prayer.key).toBe('asr');
  });

  it('identifies the currently active prayer during each period', () => {
    service = TestBed.inject(PrayerTimesService);

    // Fajr period: 05:00 UTC (between Fajr 04:30 and Sunrise 05:45)
    service.currentTime.set(new Date('2026-10-14T05:00:00Z'));
    expect(service.currentPrayer()?.key).toBe('fajr');

    // Duha period: 08:00 UTC (between Sunrise 05:45 and Dhuhr 11:45)
    service.currentTime.set(new Date('2026-10-14T08:00:00Z'));
    expect(service.currentPrayer()).toBeNull();

    // Dhuhr period: 12:00 UTC (between Dhuhr 11:45 and Asr 15:15)
    service.currentTime.set(new Date('2026-10-14T12:00:00Z'));
    expect(service.currentPrayer()?.key).toBe('dhuhr');

    // Asr period: 16:00 UTC (between Asr 15:15 and Maghrib 17:35)
    service.currentTime.set(new Date('2026-10-14T16:00:00Z'));
    expect(service.currentPrayer()?.key).toBe('asr');

    // Maghrib period: 17:45 UTC (between Maghrib 17:35 and Isha 18:50)
    service.currentTime.set(new Date('2026-10-14T17:45:00Z'));
    expect(service.currentPrayer()?.key).toBe('maghrib');

    // Isha period: 21:00 UTC (after Isha 18:50)
    service.currentTime.set(new Date('2026-10-14T21:00:00Z'));
    expect(service.currentPrayer()?.key).toBe('isha');
  });

  it('updates calculation method and reloads timetable', () => {
    service = TestBed.inject(PrayerTimesService);
    prayerApi.getTimings.mockClear();

    service.setCalculationMethod(1);

    expect(service.calculationSettings().methodId).toBe(1);
    expect(prayerApi.getTimings).toHaveBeenCalledWith(
      expect.objectContaining({ method: 1 }),
    );
  });

  it('updates school and reloads timetable', () => {
    service = TestBed.inject(PrayerTimesService);
    prayerApi.getTimings.mockClear();

    service.setSchool(1); // Hanafi

    expect(service.calculationSettings().school).toBe(1);
    expect(prayerApi.getTimings).toHaveBeenCalledWith(
      expect.objectContaining({ school: 1 }),
    );
  });
});

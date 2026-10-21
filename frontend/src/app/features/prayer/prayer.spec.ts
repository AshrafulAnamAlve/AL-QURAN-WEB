import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Place, UserLocation } from '../../core/models/location';
import { CalculationMethod, PrayerDay, PrayerTime } from '../../core/models/prayer';
import { LocationApiService } from '../../core/services/location-api';
import { DEFAULT_LOCATION, LocationService } from '../../core/services/location';
import { PrayerApiService } from '../../core/services/prayer-api';
import { PrayerTimesService } from '../../core/services/prayer';
import { LanguageService } from '../../core/services/language';
import { SeoService } from '../../core/services/seo';
import { StorageService } from '../../core/services/storage';
import { PrayerPage } from './prayer';

describe('PrayerPage', () => {
  let component: PrayerPage;
  let fixture: ComponentFixture<PrayerPage>;
  let prayerApi: { getTimings: ReturnType<typeof vi.fn>; getMethods: ReturnType<typeof vi.fn> };
  let locationApi: { search: ReturnType<typeof vi.fn>; reverse: ReturnType<typeof vi.fn> };

  const mockPrayerTimes: PrayerTime[] = [
    { key: 'imsak', name: 'Imsak', arabicName: 'الإমসাক', banglaName: 'সাহরির শেষ', time: '04:15', at: '2026-10-14T04:15:00Z', isPrayer: false },
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
    { id: 2, code: 'ISNA', name: 'Islamic Society of North America (ISNA)', parameters: 'Fajr 15, Isha 15', isDefault: true },
  ];

  beforeEach(async () => {
    prayerApi = {
      getTimings: vi.fn().mockReturnValue(of(mockDay)),
      getMethods: vi.fn().mockReturnValue(of(mockMethods)),
    };
    locationApi = {
      search: vi.fn().mockReturnValue(of([])),
      reverse: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [PrayerPage],
      providers: [
        provideRouter([]),
        StorageService,
        LocationService,
        PrayerTimesService,
        SeoService,
        { provide: PrayerApiService, useValue: prayerApi },
        { provide: LocationApiService, useValue: locationApi },
      ],
    }).compileComponents();

    const storage = TestBed.inject(StorageService);
    storage.clearAll();

    fixture = TestBed.createComponent(PrayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the prayer page and renders title and location', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prayer-header__title')?.textContent).toContain('নামাজের সময়সূচি');
    expect(compiled.querySelector('.location-btn__name')?.textContent).toContain(DEFAULT_LOCATION.displayName);
  });

  it('renders all 6 core prayer times', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.timing-card:not(.timing-card--skeleton)');
    expect(cards.length).toBe(6);

    const names = Array.from(cards).map(
      (c) => c.querySelector('.timing-card__title')?.textContent?.trim(),
    );
    expect(names).toEqual(['ফজর', 'সূর্যোদয়', 'যোহর', 'আসর', 'মাগরিব', 'এশা']);
  });

  it('renders live next-prayer countdown card', () => {
    const prayerTimesService = TestBed.inject(PrayerTimesService);
    // Set time to 03:00 UTC (before Fajr at 04:30)
    prayerTimesService.currentTime.set(new Date('2026-10-14T03:00:00Z'));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const countdownHero = compiled.querySelector('.countdown-hero');
    expect(countdownHero).toBeTruthy();
    expect(countdownHero?.textContent).toContain('ফজর');
    expect(compiled.querySelector('.countdown-hero__digits')?.textContent).toContain('০১:৩০:০০');
  });

  it('states the calculation method and school in use', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const calcSummary = compiled.querySelector('.calculation-bar__active');
    expect(calcSummary?.textContent).toContain('Islamic Society of North America (ISNA)');
    expect(calcSummary?.textContent).toContain('শাফেঈ');
  });

  it('shows permission denied banner when location access is denied', () => {
    const locationService = TestBed.inject(LocationService);
    (locationService as unknown as { _permissionDenied: { set: (v: boolean) => void } })._permissionDenied.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const banner = compiled.querySelector('.permission-banner');
    expect(banner).toBeTruthy();
    expect(banner?.textContent).toContain('লোকেশন ব্যবহারের অনুমতি পাওয়া যায়নি');
  });

  it('allows opening location picker and selecting a city', () => {
    expect(component.isLocationPickerOpen()).toBe(false);
    component.openLocationPicker();
    expect(component.isLocationPickerOpen()).toBe(true);

    const targetCity: Place = {
      name: 'London',
      displayName: 'London, United Kingdom',
      latitude: 51.51,
      longitude: -0.13,
      city: 'London',
      country: 'United Kingdom',
    };

    component.selectCity(targetCity);
    expect(component.isLocationPickerOpen()).toBe(false);
    expect(component.location().city).toBe('London');
    expect(prayerApi.getTimings).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 51.51, longitude: -0.13 }),
    );
  });

  it('allows changing school from Shafi to Hanafi and highlights correctly', () => {
    prayerApi.getTimings.mockClear();
    component.setSchool(1); // Hanafi
    expect(prayerApi.getTimings).toHaveBeenCalledWith(
      expect.objectContaining({ school: 1 }),
    );
  });

  it('renders authentic English terminology when language is English', () => {
    const lang = TestBed.inject(LanguageService);
    lang.setLanguage('en');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prayer-header__title')?.textContent).toContain('Prayer Times');
    expect(compiled.querySelector('.location-btn__change')?.textContent).toBe('Change');

    const cards = compiled.querySelectorAll('.timing-card:not(.timing-card--skeleton)');
    const titles = Array.from(cards).map(
      (c) => c.querySelector('.timing-card__title')?.textContent?.trim(),
    );
    expect(titles).toEqual(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
  });
});

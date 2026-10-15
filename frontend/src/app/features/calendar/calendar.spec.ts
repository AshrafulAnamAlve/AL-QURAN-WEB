import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { DateConversion, HijriMonth, HijriMonthName, IslamicEvents } from '../../core/models/calendar';
import { PrayerDay, PrayerTime } from '../../core/models/prayer';
import { CalendarApiService } from '../../core/services/calendar-api';
import { CalendarService } from '../../core/services/calendar';
import { LanguageService } from '../../core/services/language';
import { LocationApiService } from '../../core/services/location-api';
import { PrayerApiService } from '../../core/services/prayer-api';
import { CalendarPage } from './calendar';

describe('CalendarPage', () => {
  let fixture: ComponentFixture<CalendarPage>;
  let component: CalendarPage;
  let calendarService: CalendarService;
  let languageService: LanguageService;

  const mockConversion: DateConversion = {
    gregorian: {
      date: '2026-10-15',
      weekdayEn: 'Thursday',
      monthNameEn: 'October',
      formatted: '15 October 2026',
    },
    hijri: {
      day: 4,
      month: 5,
      year: 1448,
      monthNameEn: 'Jumada al-ula',
      monthNameAr: 'جمادى الأولى',
      weekdayEn: 'Al-Khamis',
      weekdayAr: 'الخميس',
      monthLength: 30,
      formatted: '4 Jumada al-ula 1448 AH',
      holidays: [],
    },
    notice: 'Astronomical calculation.',
  };

  const mockMonths: HijriMonthName[] = [
    { number: 1, nameAr: 'المحرم', nameEn: 'Muharram', banglaName: 'মুহররম' },
    { number: 5, nameAr: 'جمادى الأولى', nameEn: 'Jumada al-ula', banglaName: 'জুমাদাল উলা' },
    { number: 9, nameAr: 'রমضان', nameEn: 'Ramadan', banglaName: 'রমজান' },
  ];

  const mockMonth: HijriMonth = {
    year: 1448,
    month: 5,
    nameAr: 'جمادى الأولى',
    nameEn: 'Jumada al-ula',
    length: 29,
    days: [
      {
        hijriDay: 1,
        gregorianDate: '2026-10-12',
        weekdayEn: 'Monday',
        isToday: false,
        events: [],
      },
      {
        hijriDay: 4,
        gregorianDate: '2026-10-15',
        weekdayEn: 'Thursday',
        isToday: true,
        events: [],
      },
      {
        hijriDay: 5,
        gregorianDate: '2026-10-16',
        weekdayEn: 'Friday',
        isToday: false,
        events: [],
      },
    ],
    notice: 'Calculated',
  };

  const mockEvents: IslamicEvents = {
    hijriYear: 1448,
    events: [
      {
        key: 'ramadan-start',
        name: 'First Day of Ramadan',
        banglaName: 'রমজানের প্রথম দিন',
        hijriDay: 1,
        hijriMonth: 9,
        hijriMonthName: 'Ramadan',
        gregorianDate: '2027-02-08',
        isRange: false,
        description: 'First day of Ramadan fasting.',
      },
    ],
    notice: 'Estimated dates.',
  };

  const mockPrayerTimes: PrayerTime[] = [
    { key: 'imsak', name: 'Imsak', arabicName: 'الإمساك', banglaName: 'সাহরির শেষ', time: '04:15', at: '2026-10-15T04:15:00Z', isPrayer: false },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', banglaName: 'মাগরিব / ইফতার', time: '17:35', at: '2026-10-15T17:35:00Z', isPrayer: true },
  ];

  const mockPrayerDay: PrayerDay = {
    date: '2026-10-15',
    readableDate: '15 Oct 2026',
    hijri: null,
    location: {
      latitude: 23.81,
      longitude: 90.41,
      timezone: 'Asia/Dhaka',
      place: 'Dhaka',
    },
    method: {
      id: 1,
      name: 'University of Islamic Sciences, Karachi',
      school: 'Hanafi',
    },
    times: mockPrayerTimes,
    notice: 'Calculated.',
  };

  beforeEach(async () => {
    const calendarApi = {
      getToday: vi.fn().mockReturnValue(of(mockConversion)),
      toHijri: vi.fn().mockReturnValue(of(mockConversion)),
      toGregorian: vi.fn().mockReturnValue(of(mockConversion)),
      getHijriMonth: vi.fn().mockReturnValue(of(mockMonth)),
      getMonths: vi.fn().mockReturnValue(of(mockMonths)),
      getEvents: vi.fn().mockReturnValue(of(mockEvents)),
    };

    const prayerApi = {
      getTimings: vi.fn().mockReturnValue(of(mockPrayerDay)),
      getMethods: vi.fn().mockReturnValue(of([])),
    };

    const locationApi = {
      search: vi.fn().mockReturnValue(of([])),
      reverse: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [
        provideRouter([]),
        { provide: CalendarApiService, useValue: calendarApi },
        { provide: PrayerApiService, useValue: prayerApi },
        { provide: LocationApiService, useValue: locationApi },
      ],
    }).compileComponents();

    localStorage.clear();
    calendarService = TestBed.inject(CalendarService);
    languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('en');

    fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders moon sighting advisory note prominently', () => {
    const el: HTMLElement = fixture.nativeElement;
    const advisory = el.querySelector('.advisory-banner');
    expect(advisory).not.toBeNull();
    expect(advisory?.textContent).toContain('Moon Sighting');
  });

  it('renders today hero card with Hijri and Gregorian dates', () => {
    const el: HTMLElement = fixture.nativeElement;
    const hero = el.querySelector('.today-hero');
    expect(hero).not.toBeNull();
    expect(hero?.textContent).toContain('1448');
    expect(hero?.textContent).toContain('Jumada al-ula');
    expect(hero?.textContent).toContain('October');
  });

  it('renders weekday headers (Sun through Sat)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const weekdayHeaders = el.querySelectorAll('.weekday-cell');
    expect(weekdayHeaders.length).toBe(7);
  });

  it('renders calendar days grid', () => {
    const el: HTMLElement = fixture.nativeElement;
    const dayCells = el.querySelectorAll('.day-cell:not(.day-cell--empty)');
    expect(dayCells.length).toBe(3);
  });

  it('triggers navigation on previous and next month buttons', () => {
    const nextSpy = vi.spyOn(calendarService, 'nextMonth');
    const prevSpy = vi.spyOn(calendarService, 'prevMonth');

    component.nextMonth();
    expect(nextSpy).toHaveBeenCalled();

    component.prevMonth();
    expect(prevSpy).toHaveBeenCalled();
  });

  it('renders important Islamic events section', () => {
    const el: HTMLElement = fixture.nativeElement;
    const eventsSec = el.querySelector('.events-section');
    expect(eventsSec).not.toBeNull();
    expect(eventsSec?.textContent).toContain('First Day of Ramadan');
  });
});

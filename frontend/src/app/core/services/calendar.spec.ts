import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { DateConversion, HijriMonth, HijriMonthName, IslamicEvents } from '../models/calendar';
import { CalendarApiService } from './calendar-api';
import { CalendarService } from './calendar';

describe('CalendarService', () => {
  let service: CalendarService;
  let calendarApi: {
    getToday: ReturnType<typeof vi.fn>;
    toHijri: ReturnType<typeof vi.fn>;
    toGregorian: ReturnType<typeof vi.fn>;
    getHijriMonth: ReturnType<typeof vi.fn>;
    getMonths: ReturnType<typeof vi.fn>;
    getEvents: ReturnType<typeof vi.fn>;
  };

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
    { number: 9, nameAr: 'رمضان', nameEn: 'Ramadan', banglaName: 'রমজান' },
    { number: 12, nameAr: 'ذو الحجة', nameEn: 'Dhu al-Hijjah', banglaName: 'জিলহজ্জ' },
  ];

  const mockMonth = (year: number, month: number): HijriMonth => ({
    year,
    month,
    nameAr: 'شهر',
    nameEn: 'Month',
    length: 30,
    days: [],
    notice: 'Calculated',
  });

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
        description: 'First day of Ramadan.',
      },
    ],
    notice: 'Estimated dates.',
  };

  beforeEach(() => {
    calendarApi = {
      getToday: vi.fn().mockReturnValue(of(mockConversion)),
      toHijri: vi.fn().mockReturnValue(of(mockConversion)),
      toGregorian: vi.fn().mockReturnValue(of(mockConversion)),
      getHijriMonth: vi.fn().mockImplementation((y, m) => of(mockMonth(y, m))),
      getMonths: vi.fn().mockReturnValue(of(mockMonths)),
      getEvents: vi.fn().mockReturnValue(of(mockEvents)),
    };

    TestBed.configureTestingModule({
      providers: [
        CalendarService,
        { provide: CalendarApiService, useValue: calendarApi },
      ],
    });

    service = TestBed.inject(CalendarService);
  });

  it('initializes with today conversion and loads current month and events', () => {
    expect(calendarApi.getToday).toHaveBeenCalled();
    expect(calendarApi.getMonths).toHaveBeenCalled();
    expect(service.todayConversion()?.hijri.year).toBe(1448);
    expect(service.selectedYear()).toBe(1448);
    expect(service.selectedMonth()).toBe(5);
    expect(service.currentHijriDay()).toBe(4);
    expect(service.isCurrentMonthSelected()).toBe(true);
    expect(service.months().length).toBe(4);
  });

  it('handles API failure during init gracefully with fallback', () => {
    TestBed.resetTestingModule();
    const failingApi = {
      ...calendarApi,
      getToday: vi.fn().mockReturnValue(throwError(() => new Error('Offline'))),
    };

    TestBed.configureTestingModule({
      providers: [
        CalendarService,
        { provide: CalendarApiService, useValue: failingApi },
      ],
    });

    const failingService = TestBed.inject(CalendarService);
    expect(failingService.todayConversion()).toBeNull();
    expect(failingService.selectedYear()).toBe(1448);
  });

  it('navigates next and previous months within the same year', () => {
    expect(service.selectedMonth()).toBe(5);

    service.nextMonth();
    expect(service.selectedMonth()).toBe(6);
    expect(service.selectedYear()).toBe(1448);

    service.prevMonth();
    expect(service.selectedMonth()).toBe(5);
  });

  it('handles year rollover on nextMonth (12 -> 1) and prevMonth (1 -> 12)', () => {
    service.setMonth(12);
    expect(service.selectedMonth()).toBe(12);

    service.nextMonth();
    expect(service.selectedMonth()).toBe(1);
    expect(service.selectedYear()).toBe(1449);
    expect(calendarApi.getEvents).toHaveBeenCalledWith(1449);

    service.prevMonth();
    expect(service.selectedMonth()).toBe(12);
    expect(service.selectedYear()).toBe(1448);
  });

  it('returns to today on goToToday()', () => {
    service.setMonth(10);
    expect(service.isCurrentMonthSelected()).toBe(false);

    service.goToToday();
    expect(service.selectedMonth()).toBe(5);
    expect(service.selectedYear()).toBe(1448);
    expect(service.isCurrentMonthSelected()).toBe(true);
  });

  it('sets month and year within bounds', () => {
    service.setMonth(9);
    expect(service.selectedMonth()).toBe(9);

    service.setMonth(15); // Out of bounds
    expect(service.selectedMonth()).toBe(9);

    service.setYear(1450);
    expect(service.selectedYear()).toBe(1450);
  });

  it('computes Ramadan properties correctly', () => {
    expect(service.isRamadan()).toBe(false);
    expect(service.ramadanDay()).toBeNull();
    expect(service.ramadanProgress()).toBe(0);

    // Navigate to Ramadan
    service.setMonth(9);
    expect(service.isRamadanSelected()).toBe(true);
  });
});

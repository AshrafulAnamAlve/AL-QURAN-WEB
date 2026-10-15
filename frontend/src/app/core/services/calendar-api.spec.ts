import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { DateConversion, HijriMonth, HijriMonthName, IslamicEvents } from '../models/calendar';
import { CalendarApiService } from './calendar-api';

describe('CalendarApiService', () => {
  let service: CalendarApiService;
  let http: HttpTestingController;

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
    { number: 9, nameAr: 'রমضان', nameEn: 'Ramadan', banglaName: 'রমজান' },
  ];

  const mockMonth: HijriMonth = {
    year: 1448,
    month: 9,
    nameAr: 'রমضان',
    nameEn: 'Ramadan',
    length: 30,
    days: [],
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
        description: 'First day of the holy month of fasting.',
      },
    ],
    notice: 'Estimated dates.',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CalendarApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calls /api/calendar/today', () => {
    let result: DateConversion | undefined;
    service.getToday().subscribe((res) => (result = res));

    const req = http.expectOne('/api/calendar/today');
    expect(req.request.method).toBe('GET');
    req.flush(mockConversion);

    expect(result?.hijri.year).toBe(1448);
    expect(result?.gregorian.date).toBe('2026-10-15');
  });

  it('calls /api/calendar/to-hijri with date parameter', () => {
    let result: DateConversion | undefined;
    service.toHijri('2026-10-15').subscribe((res) => (result = res));

    const req = http.expectOne('/api/calendar/to-hijri?date=2026-10-15');
    expect(req.request.method).toBe('GET');
    req.flush(mockConversion);

    expect(result?.hijri.monthNameEn).toBe('Jumada al-ula');
  });

  it('calls /api/calendar/to-gregorian with parameters', () => {
    let result: DateConversion | undefined;
    service.toGregorian(4, 5, 1448).subscribe((res) => (result = res));

    const req = http.expectOne('/api/calendar/to-gregorian?day=4&month=5&year=1448');
    expect(req.request.method).toBe('GET');
    req.flush(mockConversion);

    expect(result?.gregorian.date).toBe('2026-10-15');
  });

  it('calls /api/calendar/hijri/{year}/{month}', () => {
    let result: HijriMonth | undefined;
    service.getHijriMonth(1448, 9).subscribe((res) => (result = res));

    const req = http.expectOne('/api/calendar/hijri/1448/9');
    expect(req.request.method).toBe('GET');
    req.flush(mockMonth);

    expect(result?.nameEn).toBe('Ramadan');
    expect(result?.length).toBe(30);
  });

  it('calls /api/calendar/months', () => {
    let result: HijriMonthName[] | undefined;
    service.getMonths().subscribe((res) => (result = res));

    const req = http.expectOne('/api/calendar/months');
    expect(req.request.method).toBe('GET');
    req.flush(mockMonths);

    expect(result?.length).toBe(2);
    expect(result?.[1].banglaName).toBe('রমজান');
  });

  it('calls /api/calendar/events with and without year', () => {
    let result: IslamicEvents | undefined;
    service.getEvents().subscribe((res) => (result = res));

    const req1 = http.expectOne('/api/calendar/events');
    expect(req1.request.method).toBe('GET');
    req1.flush(mockEvents);

    expect(result?.events.length).toBe(1);

    service.getEvents(1448).subscribe();
    const req2 = http.expectOne('/api/calendar/events?year=1448');
    expect(req2.request.method).toBe('GET');
    req2.flush(mockEvents);
  });
});

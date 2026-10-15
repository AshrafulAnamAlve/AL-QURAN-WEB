import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DateConversion,
  HijriMonth,
  HijriMonthName,
  IslamicEvents,
} from '../models/calendar';
import { ApiService } from './api';

/**
 * Communicates with the backend /api/calendar endpoints.
 */
@Injectable({ providedIn: 'root' })
export class CalendarApiService {
  private readonly api = inject(ApiService);

  /** Today's date in both Hijri and Gregorian calendars. */
  getToday(): Observable<DateConversion> {
    return this.api.get<DateConversion>('calendar/today');
  }

  /** Converts a Gregorian date (YYYY-MM-DD) to Hijri. */
  toHijri(date: string): Observable<DateConversion> {
    return this.api.get<DateConversion>('calendar/to-hijri', { date });
  }

  /** Converts a Hijri date (day, month, year) to Gregorian. */
  toGregorian(day: number, month: number, year: number): Observable<DateConversion> {
    return this.api.get<DateConversion>('calendar/to-gregorian', { day, month, year });
  }

  /** Retrieves a complete Hijri month grid with Gregorian counterparts and events. */
  getHijriMonth(year: number, month: number): Observable<HijriMonth> {
    return this.api.get<HijriMonth>(`calendar/hijri/${year}/${month}`);
  }

  /** The twelve Hijri month names in Arabic, English, and Bangla. */
  getMonths(): Observable<HijriMonthName[]> {
    return this.api.get<HijriMonthName[]>('calendar/months');
  }

  /** Islamic observances and significant dates for a Hijri year. */
  getEvents(year?: number): Observable<IslamicEvents> {
    const params = year ? { year } : undefined;
    return this.api.get<IslamicEvents>('calendar/events', params);
  }
}

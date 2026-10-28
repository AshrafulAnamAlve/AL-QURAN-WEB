import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CalculationMethod, PrayerDay, PrayerMonth } from '../models/prayer';
import { ApiService } from './api';

export interface PrayerTimingsParams {
  latitude: number;
  longitude: number;
  date?: string; // YYYY-MM-DD
  method?: number;
  school?: number;
}

export interface PrayerCityTimingsParams {
  city: string;
  country: string;
  date?: string;
  method?: number;
  school?: number;
}

/**
 * Communicates with the backend /api/prayer endpoints.
 */
@Injectable({ providedIn: 'root' })
export class PrayerApiService {
  private readonly api = inject(ApiService);

  /** A day's prayer times for a coordinate. */
  getTimings(params: PrayerTimingsParams): Observable<PrayerDay> {
    return this.api.get<PrayerDay>('prayer/timings', {
      latitude: params.latitude,
      longitude: params.longitude,
      date: params.date,
      method: params.method,
      school: params.school,
    });
  }

  /** A day's prayer times for a named city. */
  getTimingsByCity(params: PrayerCityTimingsParams): Observable<PrayerDay> {
    return this.api.get<PrayerDay>('prayer/timings/by-city', {
      city: params.city,
      country: params.country,
      date: params.date,
      method: params.method,
      school: params.school,
    });
  }

  /** Calculation methods supported by the API. */
  getMethods(): Observable<CalculationMethod[]> {
    return this.api.get<CalculationMethod[]>('prayer/methods');
  }

  /** A full Gregorian month of timetables. */
  getMonth(params: {
    latitude: number;
    longitude: number;
    year: number;
    month: number;
    method?: number;
    school?: number;
  }): Observable<PrayerMonth> {
    return this.api.get<PrayerMonth>('prayer/calendar', {
      latitude: params.latitude,
      longitude: params.longitude,
      year: params.year,
      month: params.month,
      method: params.method,
      school: params.school,
    });
  }
}

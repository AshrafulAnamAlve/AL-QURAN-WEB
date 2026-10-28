/** Hijri date matching the Gregorian date. */
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthNameEn: string;
  monthNameAr: string;
  weekdayEn: string;
  weekdayAr: string;
  monthLength: number;
  formatted: string;
  holidays: string[];
}

/** One entry in the daily prayer timetable. */
export interface PrayerTime {
  key: string;
  name: string;
  arabicName: string;
  banglaName: string;
  time: string;
  at: string | null;
  isPrayer: boolean;
}

/** Where the timetable was calculated for. */
export interface PrayerLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  place?: string | null;
}

/** Calculation method and jurisprudence school summary. */
export interface CalculationSummary {
  id: number;
  name: string;
  school: string;
}

/** Full timetable for one day. */
export interface PrayerDay {
  date: string;
  readableDate: string;
  hijri: HijriDate | null;
  location: PrayerLocation;
  method: CalculationSummary;
  times: PrayerTime[];
  notice: string;
}

/** Full month timetable. */
export interface PrayerMonth {
  year: number;
  month: number;
  location: PrayerLocation;
  method: CalculationSummary;
  days: PrayerDay[];
  notice: string;
}

/** Calculation method option. */
export interface CalculationMethod {
  id: number;
  code: string;
  name: string;
  parameters: string;
  isDefault: boolean;
}

/** Saved calculation preferences. */
export interface PrayerCalculationSettings {
  methodId?: number;
  school?: 0 | 1; // 0 for Shafi, 1 for Hanafi
}

/** Derived next prayer info with live countdown. */
export interface NextPrayer {
  prayer: PrayerTime;
  timeRemainingMs: number;
  formattedCountdown: string;
  hours: number;
  minutes: number;
  seconds: number;
  isTomorrow: boolean;
}

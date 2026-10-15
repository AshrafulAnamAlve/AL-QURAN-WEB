/**
 * Models for the Hijri calendar, Islamic events, and date conversion.
 */

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

export interface GregorianDate {
  date: string; // YYYY-MM-DD
  weekdayEn: string;
  monthNameEn: string;
  formatted: string;
}

export interface DateConversion {
  hijri: HijriDate;
  gregorian: GregorianDate;
  notice: string;
}

export interface HijriDay {
  hijriDay: number;
  gregorianDate: string;
  weekdayEn: string;
  isToday: boolean;
  events: string[];
}

export interface HijriMonth {
  year: number;
  month: number;
  nameEn: string;
  nameAr: string;
  length: number;
  days: HijriDay[];
  notice: string;
}

export interface IslamicEvent {
  key: string;
  name: string;
  banglaName: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  gregorianDate: string | null;
  description: string;
  isRange: boolean;
}

export interface IslamicEvents {
  hijriYear: number;
  events: IslamicEvent[];
  notice: string;
}

export interface HijriMonthName {
  number: number;
  nameEn: string;
  nameAr: string;
  banglaName: string;
}

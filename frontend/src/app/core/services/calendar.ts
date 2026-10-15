import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DateConversion,
  HijriMonth,
  HijriMonthName,
  IslamicEvent,
} from '../models/calendar';
import { CalendarApiService } from './calendar-api';

/**
 * Manages Islamic calendar state, Hijri month navigation, observances,
 * and Ramadan status.
 */
@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly calendarApi = inject(CalendarApiService);

  // State signals
  private readonly _todayConversion = signal<DateConversion | null>(null);
  readonly todayConversion = this._todayConversion.asReadonly();

  private readonly _selectedYear = signal<number>(1448);
  readonly selectedYear = this._selectedYear.asReadonly();

  private readonly _selectedMonth = signal<number>(1);
  readonly selectedMonth = this._selectedMonth.asReadonly();

  private readonly _monthData = signal<HijriMonth | null>(null);
  readonly monthData = this._monthData.asReadonly();

  private readonly _months = signal<HijriMonthName[]>([]);
  readonly months = this._months.asReadonly();

  private readonly _events = signal<IslamicEvent[]>([]);
  readonly events = this._events.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // Derived signals
  readonly currentHijriYear = computed(() => this._todayConversion()?.hijri.year ?? 1448);
  readonly currentHijriMonth = computed(() => this._todayConversion()?.hijri.month ?? 1);
  readonly currentHijriDay = computed(() => this._todayConversion()?.hijri.day ?? 1);

  readonly isCurrentMonthSelected = computed(
    () =>
      this._selectedYear() === this.currentHijriYear() &&
      this._selectedMonth() === this.currentHijriMonth(),
  );

  readonly selectedMonthName = computed(() => {
    const num = this._selectedMonth();
    return this._months().find((m) => m.number === num) ?? null;
  });

  /** True if the current Islamic month is Ramadan (month 9). */
  readonly isRamadan = computed(() => this.currentHijriMonth() === 9);

  /** True if the user has navigated to Ramadan in the calendar. */
  readonly isRamadanSelected = computed(() => this._selectedMonth() === 9);

  /** Day number of Ramadan (1-30) if currently in Ramadan, or null. */
  readonly ramadanDay = computed(() => (this.isRamadan() ? this.currentHijriDay() : null));

  /** Percentage progress through Ramadan (0-100%). */
  readonly ramadanProgress = computed(() => {
    if (!this.isRamadan()) return 0;
    const day = this.currentHijriDay();
    return Math.min(100, Math.max(1, Math.round((day / 30) * 100)));
  });

  /** Days remaining until the next Ramadan, or 0 if in Ramadan. */
  readonly daysUntilRamadan = computed(() => {
    if (this.isRamadan()) return 0;
    const ramadanEvent = this._events().find((e) => e.key === 'ramadan-start');
    if (!ramadanEvent?.gregorianDate) return null;

    const target = new Date(ramadanEvent.gregorianDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  });

  constructor() {
    this.init();
  }

  /** Initializes today's date, month list, and current month grid. */
  init(): void {
    this.loadMonths();
    this.calendarApi.getToday().subscribe({
      next: (conversion) => {
        this._todayConversion.set(conversion);
        this._selectedYear.set(conversion.hijri.year);
        this._selectedMonth.set(conversion.hijri.month);
        this.loadMonth(conversion.hijri.year, conversion.hijri.month);
        this.loadEvents(conversion.hijri.year);
      },
      error: () => {
        // Fallback default
        this.loadMonth(this._selectedYear(), this._selectedMonth());
        this.loadEvents(this._selectedYear());
      },
    });
  }

  /** Loads month names list. */
  loadMonths(): void {
    this.calendarApi.getMonths().subscribe({
      next: (list) => this._months.set(list),
      error: () => {
        /* Non-critical */
      },
    });
  }

  /** Loads the month grid for a specific Hijri year and month. */
  loadMonth(year: number, month: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.calendarApi.getHijriMonth(year, month).subscribe({
      next: (monthData) => {
        this._monthData.set(monthData);
        this._selectedYear.set(year);
        this._selectedMonth.set(month);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Could not load the calendar month. Please try again.');
        this._loading.set(false);
      },
    });
  }

  /** Loads Islamic observances for a given Hijri year. */
  loadEvents(year?: number): void {
    this.calendarApi.getEvents(year).subscribe({
      next: (res) => this._events.set(res.events),
      error: () => {
        /* Non-critical */
      },
    });
  }

  /** Navigates to the next Hijri month. */
  nextMonth(): void {
    let m = this._selectedMonth() + 1;
    let y = this._selectedYear();
    if (m > 12) {
      m = 1;
      y += 1;
      this.loadEvents(y);
    }
    this.loadMonth(y, m);
  }

  /** Navigates to the previous Hijri month. */
  prevMonth(): void {
    let m = this._selectedMonth() - 1;
    let y = this._selectedYear();
    if (m < 1) {
      m = 12;
      y -= 1;
      this.loadEvents(y);
    }
    this.loadMonth(y, m);
  }

  /** Navigates directly back to today's current Hijri month. */
  goToToday(): void {
    const today = this._todayConversion();
    if (today) {
      this.loadMonth(today.hijri.year, today.hijri.month);
    } else {
      this.init();
    }
  }

  /** Selects a specific month (1-12) within the current selected year. */
  setMonth(month: number): void {
    if (month >= 1 && month <= 12) {
      this.loadMonth(this._selectedYear(), month);
    }
  }

  /** Sets the year and reloads. */
  setYear(year: number): void {
    if (year >= 1300 && year <= 1600) {
      this.loadMonth(year, this._selectedMonth());
      this.loadEvents(year);
    }
  }
}

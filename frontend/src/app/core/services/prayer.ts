import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { AppError } from '../models/api-error';
import { CalculationMethod, NextPrayer, PrayerCalculationSettings, PrayerDay, PrayerTime } from '../models/prayer';
import { LocationService } from './location';
import { MobileHardwareService } from './mobile-hardware.service';
import { PrayerApiService } from './prayer-api';
import { STORAGE_KEYS, StorageService } from './storage';

export const CORE_PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

/**
 * Manages prayer timetables, calculation methods, school selection,
 * and second-by-second countdown with automatic rollover.
 */
@Injectable({ providedIn: 'root' })
export class PrayerTimesService implements OnDestroy {
  private readonly prayerApi = inject(PrayerApiService);
  private readonly locationService = inject(LocationService);
  private readonly mobileHardware = inject(MobileHardwareService);
  private readonly storage = inject(StorageService);

  private timerId: ReturnType<typeof setInterval> | null = null;

  // State signals
  private readonly _timetable = signal<PrayerDay | null>(null);
  readonly timetable = this._timetable.asReadonly();

  /** Upcoming days of the current month (for multi-day scheduling & offline protection) */
  readonly upcomingDays = signal<PrayerDay[]>([]);

  private readonly _methods = signal<CalculationMethod[]>([]);
  readonly methods = this._methods.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<AppError | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _calculationSettings = signal<PrayerCalculationSettings>(
    this.storage.read<PrayerCalculationSettings>(STORAGE_KEYS.prayerCalculation, {}),
  );
  readonly calculationSettings = this._calculationSettings.asReadonly();

  // Clock ticker signal
  readonly currentTime = signal<Date>(new Date());

  // Date of currently loaded timetable
  private loadedDateKey = '';

  constructor() {
    this.startClock();
    this.loadMethods();

    // Load initial timings
    this.loadTodayTimings();
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /** Starts the 1-second interval ticker. */
  startClock(): void {
    if (this.timerId !== null) return;
    this.timerId = setInterval(() => {
      const now = new Date();
      this.currentTime.set(now);

      // Check for midnight rollover: if Gregorian date changes, refresh timings
      const todayKey = now.toISOString().slice(0, 10);
      if (this.loadedDateKey && this.loadedDateKey !== todayKey && !this._loading()) {
        this.loadTodayTimings();
      }
    }, 1000);
  }

  /** Fetches available calculation methods from the backend. */
  loadMethods(): void {
    this.prayerApi.getMethods().subscribe({
      next: (methods) => this._methods.set(methods),
      error: () => {
        /* Non-critical; fallback to defaults */
      },
    });
  }

  /** Reloads prayer times for today using current location and calculation settings. */
  loadTodayTimings(): void {
    const loc = this.locationService.location();
    const settings = this._calculationSettings();
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    this._loading.set(true);
    this._error.set(null);

    this.prayerApi
      .getTimings({
        latitude: loc.latitude,
        longitude: loc.longitude,
        date: dateStr,
        method: settings.methodId,
        school: settings.school,
      })
      .subscribe({
        next: (day) => {
          this._timetable.set(day);
          this.loadedDateKey = dateStr;
          this._loading.set(false);

          // Fetch upcoming days of current month for background alarm scheduling
          if (typeof this.prayerApi.getMonth === 'function') {
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            this.prayerApi
              .getMonth({
                latitude: loc.latitude,
                longitude: loc.longitude,
                year,
                month,
                method: settings.methodId,
                school: settings.school,
              })
              .subscribe({
                next: (cal) => {
                  if (cal?.days) {
                    const futureDays = cal.days.filter((d) => d.date >= dateStr);
                    this.upcomingDays.set(futureDays);
                  } else {
                    this.upcomingDays.set([day]);
                  }
                },
                error: () => {
                  // If calendar fetch fails, at least today is available
                  this.upcomingDays.set([day]);
                },
              });
          } else {
            this.upcomingDays.set([day]);
          }
        },
        error: (err: AppError) => {
          this._error.set(err);
          this._loading.set(false);
        },
      });
  }

  /** Updates calculation method ID and refreshes timetable. */
  setCalculationMethod(methodId: number): void {
    const updated: PrayerCalculationSettings = {
      ...this._calculationSettings(),
      methodId,
    };
    this._calculationSettings.set(updated);
    this.storage.write(STORAGE_KEYS.prayerCalculation, updated);
    this.loadTodayTimings();
  }

  /** Updates Asr calculation jurisprudence school (0: Shafi, 1: Hanafi) and refreshes timetable. */
  setSchool(school: 0 | 1): void {
    const updated: PrayerCalculationSettings = {
      ...this._calculationSettings(),
      school,
    };
    this._calculationSettings.set(updated);
    this.storage.write(STORAGE_KEYS.prayerCalculation, updated);
    this.loadTodayTimings();
  }

  // --- Derived Computed Signals -------------------------------------------

  /** The 6 main timings displayed on screen: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha. */
  readonly coreTimings = computed<PrayerTime[]>(() => {
    const table = this._timetable();
    if (!table) return [];

    const map = new Map(table.times.map((t) => [t.key.toLowerCase(), t]));
    return CORE_PRAYER_KEYS.map((key) => map.get(key)).filter((t): t is PrayerTime => !!t);
  });

  /**
   * The currently active prayer period.
   * Fajr (Fajr -> Sunrise)
   * Sunrise -> Dhuhr (Duha, null)
   * Dhuhr (Dhuhr -> Asr)
   * Asr (Asr -> Maghrib)
   * Maghrib (Maghrib -> Isha)
   * Isha (Isha -> Fajr)
   */
  readonly currentPrayer = computed<PrayerTime | null>(() => {
    const table = this._timetable();
    if (!table || table.times.length === 0) return null;

    const now = this.currentTime().getTime();

    const fajr = table.times.find((t) => t.key.toLowerCase() === 'fajr');
    const sunrise = table.times.find((t) => t.key.toLowerCase() === 'sunrise');
    const dhuhr = table.times.find((t) => t.key.toLowerCase() === 'dhuhr');
    const asr = table.times.find((t) => t.key.toLowerCase() === 'asr');
    const maghrib = table.times.find((t) => t.key.toLowerCase() === 'maghrib');
    const isha = table.times.find((t) => t.key.toLowerCase() === 'isha');

    const parse = (t?: PrayerTime) => (t?.at ? new Date(t.at).getTime() : null);

    const fajrAt = parse(fajr);
    const sunriseAt = parse(sunrise);
    const dhuhrAt = parse(dhuhr);
    const asrAt = parse(asr);
    const maghribAt = parse(maghrib);
    const ishaAt = parse(isha);

    if (fajr && fajrAt && sunriseAt && now >= fajrAt && now < sunriseAt) {
      return fajr;
    }
    if (sunriseAt && dhuhrAt && now >= sunriseAt && now < dhuhrAt) {
      return null; // Duha interval
    }
    if (dhuhr && dhuhrAt && asrAt && now >= dhuhrAt && now < asrAt) {
      return dhuhr;
    }
    if (asr && asrAt && maghribAt && now >= asrAt && now < maghribAt) {
      return asr;
    }
    if (maghrib && maghribAt && ishaAt && now >= maghribAt && now < ishaAt) {
      return maghrib;
    }
    if (isha && ishaAt && now >= ishaAt) {
      return isha;
    }
    // Before Fajr in early morning
    if (fajr && fajrAt && now < fajrAt && isha) {
      return isha;
    }

    return null;
  });

  /**
   * The upcoming next prayer, ticking every second and automatically rolling over
   * at zero into the subsequent prayer or tomorrow's Fajr.
   */
  readonly nextPrayer = computed<NextPrayer | null>(() => {
    const table = this._timetable();
    if (!table || table.times.length === 0) return null;

    const now = this.currentTime().getTime();
    // Daily obligatory prayers
    const prayers = table.times.filter((t) => t.isPrayer);
    if (prayers.length === 0) return null;

    for (const prayer of prayers) {
      if (!prayer.at) continue;
      const prayerTime = new Date(prayer.at).getTime();
      if (prayerTime > now) {
        const diffMs = prayerTime - now;
        return this.buildNextPrayer(prayer, diffMs, false);
      }
    }

    // All today's prayers have passed -> Rollover into Tomorrow's Fajr!
    const fajr = prayers.find((p) => p.key.toLowerCase() === 'fajr');
    if (!fajr || !fajr.at) return null;

    const todayFajrMs = new Date(fajr.at).getTime();
    const tomorrowFajrMs = todayFajrMs + 24 * 60 * 60 * 1000;
    const diffMs = Math.max(0, tomorrowFajrMs - now);

    const tomorrowFajr: PrayerTime = {
      ...fajr,
      at: new Date(tomorrowFajrMs).toISOString(),
    };

    return this.buildNextPrayer(tomorrowFajr, diffMs, true);
  });

  private buildNextPrayer(prayer: PrayerTime, diffMs: number, isTomorrow: boolean): NextPrayer {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return {
      prayer,
      timeRemainingMs: diffMs,
      formattedCountdown: `${hh}:${mm}:${ss}`,
      hours,
      minutes,
      seconds,
      isTomorrow,
    };
  }

  /** Formats a 24-hour time string (e.g. "18:48") into 12-hour format ("06:48 PM"). */
  format12h(time24: string | undefined, isBn = false): string {
    return formatTime12h(time24, isBn);
  }

  /** Converts Western numerals in a string/number to Bangla numerals. */
  toBnDigits(val: string | number): string {
    return toBanglaDigits(val);
  }
}

/** Formats a 24-hour time string (e.g. "18:48") into standard 12-hour AM/PM format. */
export function formatTime12h(time24: string | undefined, isBn = false): string {
  if (!time24) return '';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHour = String(hours).padStart(2, '0');
  let res = `${formattedHour}:${minutes} ${period}`;
  if (isBn) {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    res = res.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
  }
  return res;
}

/** Converts Western numerals in a string or number to Bangla numerals (০-৯). */
export function toBanglaDigits(val: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
}


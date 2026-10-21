import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Place } from '../../core/models/location';
import { CalculationMethod, PrayerTime } from '../../core/models/prayer';
import { CorePrayerAlertKey } from '../../core/models/prayer-notification';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { PrayerNotificationService } from '../../core/services/prayer-notification';
import { LanguageService } from '../../core/services/language';
import { SeoService } from '../../core/services/seo';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

export const POPULAR_CITIES: Place[] = [
  {
    name: 'Dhaka',
    displayName: 'Dhaka, Bangladesh',
    latitude: 23.81,
    longitude: 90.41,
    city: 'Dhaka',
    country: 'Bangladesh',
    countryCode: 'bd',
  },
  {
    name: 'Makkah',
    displayName: 'Makkah, Saudi Arabia',
    latitude: 21.42,
    longitude: 39.83,
    city: 'Makkah',
    country: 'Saudi Arabia',
    countryCode: 'sa',
  },
  {
    name: 'Madinah',
    displayName: 'Madinah, Saudi Arabia',
    latitude: 24.47,
    longitude: 39.61,
    city: 'Madinah',
    country: 'Saudi Arabia',
    countryCode: 'sa',
  },
  {
    name: 'London',
    displayName: 'London, United Kingdom',
    latitude: 51.51,
    longitude: -0.13,
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'gb',
  },
  {
    name: 'New York',
    displayName: 'New York, United States',
    latitude: 40.71,
    longitude: -74.01,
    city: 'New York',
    country: 'United States',
    countryCode: 'us',
  },
  {
    name: 'Istanbul',
    displayName: 'Istanbul, Turkey',
    latitude: 41.01,
    longitude: 28.98,
    city: 'Istanbul',
    country: 'Turkey',
    countryCode: 'tr',
  },
];

@Component({
  selector: 'aq-prayer-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
    FilterFieldComponent,
  ],
  templateUrl: './prayer.html',
  styleUrl: './prayer.scss',
})
export class PrayerPage implements OnInit {
  private readonly seo = inject(SeoService);
  protected readonly locationService = inject(LocationService);
  protected readonly prayerTimes = inject(PrayerTimesService);
  protected readonly languageService = inject(LanguageService);
  protected readonly notificationService = inject(PrayerNotificationService);

  readonly isBn = this.languageService.isBn;

  readonly timetable = this.prayerTimes.timetable;
  readonly loading = this.prayerTimes.loading;
  readonly error = this.prayerTimes.error;
  readonly methods = this.prayerTimes.methods;
  readonly coreTimings = this.prayerTimes.coreTimings;
  readonly currentPrayer = this.prayerTimes.currentPrayer;
  readonly nextPrayer = this.prayerTimes.nextPrayer;
  readonly calculationSettings = this.prayerTimes.calculationSettings;

  readonly location = this.locationService.location;
  readonly isDetectingLocation = this.locationService.isDetecting;
  readonly permissionDenied = this.locationService.permissionDenied;

  // Dialog / Selector modals
  readonly isLocationPickerOpen = signal<boolean>(false);
  readonly isMethodPickerOpen = signal<boolean>(false);

  // Search state
  readonly searchQuery = signal<string>('');
  readonly searchResults = signal<Place[]>([]);
  readonly isSearching = signal<boolean>(false);
  readonly searchError = signal<string | null>(null);

  protected readonly popularCities = POPULAR_CITIES;

  readonly activeMethodName = computed(() => {
    const table = this.timetable();
    if (table?.method?.name) {
      return table.method.name;
    }
    const currentId = this.calculationSettings().methodId;
    const found = this.methods().find((m) => m.id === currentId);
    return found?.name || 'Default Method';
  });

  readonly activeSchoolName = computed(() => {
    const table = this.timetable();
    if (table?.method?.school) {
      return table.method.school;
    }
    return this.calculationSettings().school === 1 ? 'Hanafi' : 'Shafi';
  });

  readonly isHanafi = computed(() => {
    return this.activeSchoolName().toLowerCase().includes('hanafi');
  });

  // Secondary timings like Imsak and Midnight
  readonly imsakTime = computed(() => {
    return this.timetable()?.times.find((t) => t.key.toLowerCase() === 'imsak');
  });

  readonly midnightTime = computed(() => {
    return this.timetable()?.times.find((t) => t.key.toLowerCase() === 'midnight');
  });

  constructor() {
    // Whenever searchQuery changes, trigger search
    effect(() => {
      const q = this.searchQuery().trim();
      if (q.length < 2) {
        this.searchResults.set([]);
        this.isSearching.set(false);
        this.searchError.set(null);
        return;
      }

      this.isSearching.set(true);
      this.searchError.set(null);

      this.locationService.searchCities(q).subscribe({
        next: (places) => {
          this.searchResults.set(places);
          this.isSearching.set(false);
        },
        error: () => {
          this.searchError.set('Could not search cities. Please check your connection.');
          this.isSearching.set(false);
        },
      });
    });
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Prayer Times',
      description:
        "Daily prayer times for your location, with live countdown to the next prayer, calculation method selector, and Ramadan timings.",
      path: '/prayer',
    });
  }

  // Action handlers
  async useMyLocation(): Promise<void> {
    const success = await this.locationService.requestGeolocation();
    if (success) {
      this.isLocationPickerOpen.set(false);
      this.prayerTimes.loadTodayTimings();
    }
  }

  selectCity(place: Place): void {
    this.locationService.setManualLocation(place);
    this.isLocationPickerOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.prayerTimes.loadTodayTimings();
  }

  openLocationPicker(): void {
    this.isLocationPickerOpen.set(true);
  }

  closeLocationPicker(): void {
    this.isLocationPickerOpen.set(false);
  }

  openMethodPicker(): void {
    this.isMethodPickerOpen.set(true);
  }

  closeMethodPicker(): void {
    this.isMethodPickerOpen.set(false);
  }

  setMethod(methodId: number): void {
    this.prayerTimes.setCalculationMethod(methodId);
    this.closeMethodPicker();
  }

  setSchool(school: 0 | 1): void {
    this.prayerTimes.setSchool(school);
  }

  retry(): void {
    this.prayerTimes.loadTodayTimings();
  }

  formatTime12h(time24: string | undefined): string {
    return this.prayerTimes.format12h(time24, this.isBn());
  }

  toBnDigits(val: string | number): string {
    return this.prayerTimes.toBnDigits(val);
  }

  readonly isAutoAdhanActive = computed(() => this.notificationService.settings().autoPlayAdhan);

  readonly isNextAlertActive = computed(() => {
    const next = this.nextPrayer();
    if (!next) return this.notificationService.settings().enabled;
    return this.notificationService.isPrayerAlertActive(next.prayer.key);
  });

  readonly isNextAdhanActive = computed(() => {
    const next = this.nextPrayer();
    const settings = this.notificationService.settings();
    if (!settings.autoPlayAdhan || settings.defaultMuted) return false;
    if (!next) return true;
    return this.notificationService.isPrayerAlertActive(next.prayer.key);
  });

  isPrayerAlertActive(key: string): boolean {
    return this.notificationService.isPrayerAlertActive(key);
  }

  toggleAutoAdhan(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.toggleAutoAdhan();
  }

  async togglePrayerAlert(key: string, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    const pKey = key.toLowerCase() as CorePrayerAlertKey;
    const settings = this.notificationService.settings();
    if (!settings.enabled) {
      await this.notificationService.toggleMasterAlerts();
      this.notificationService.togglePrayer(pKey, true);
    } else {
      const active = settings[pKey] ?? false;
      this.notificationService.togglePrayer(pKey, !active);
    }
  }

  async toggleMasterAlerts(): Promise<void> {
    await this.notificationService.toggleMasterAlerts();
  }

  openAdhan(prayer?: PrayerTime, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const target = prayer ?? this.currentPrayer() ?? this.nextPrayer()?.prayer;
    if (target) {
      this.notificationService.openAdhanModal(target, false, false, true);
    } else {
      this.notificationService.triggerTestAlert('asr');
    }
  }
}

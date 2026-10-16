import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Place } from '../../core/models/location';
import { Mosque } from '../../core/models/mosque';
import { LocationService } from '../../core/services/location';
import { MosqueService, SEARCH_RADIUS_OPTIONS } from '../../core/services/mosque';
import { LanguageService } from '../../core/services/language';
import { PrayerTimesService } from '../../core/services/prayer';
import { SeoService } from '../../core/services/seo';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { POPULAR_CITIES } from '../prayer/prayer';

@Component({
  selector: 'aq-mosque-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    FilterFieldComponent,
  ],
  templateUrl: './mosque.html',
  styleUrl: './mosque.scss',
})
export class MosquePage implements OnInit, AfterViewInit, OnDestroy {
  private readonly seo = inject(SeoService);
  protected readonly mosqueService = inject(MosqueService);
  protected readonly locationService = inject(LocationService);
  protected readonly language = inject(LanguageService);
  protected readonly prayerTimes = inject(PrayerTimesService);

  readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  readonly isBn = this.language.isBn;
  readonly radiusOptions = SEARCH_RADIUS_OPTIONS;
  readonly popularCities = POPULAR_CITIES;

  // Signals from MosqueService
  readonly searchResult = this.mosqueService.searchResult;
  readonly mosques = this.mosqueService.mosques;
  readonly loading = this.mosqueService.loading;
  readonly error = this.mosqueService.error;
  readonly radius = this.mosqueService.radius;
  readonly selectedMosque = this.mosqueService.selectedMosque;
  readonly userLocation = this.locationService.location;
  readonly isDetecting = this.locationService.isDetecting;

  // City Search Modal State
  readonly isCityModalOpen = signal(false);
  readonly cityQuery = signal('');
  readonly cityResults = signal<Place[]>([]);
  readonly isSearchingCity = signal(false);

  // Leaflet map instance and markers map
  private map: any = null;
  private userMarker: any = null;
  private markersMap = new Map<string, any>();
  private leaflet: any = null;

  constructor() {
    // When mosques change, update map markers
    effect(() => {
      const list = this.mosques();
      if (this.map && this.leaflet) {
        this.updateMapMarkers(list);
      }
    });

    // When selected mosque changes, highlight marker
    effect(() => {
      const selected = this.selectedMosque();
      if (selected && this.map) {
        this.focusMosqueOnMap(selected);
      }
    });

    // When location changes, reload mosques and center map
    effect(() => {
      const loc = this.userLocation();
      if (loc) {
        this.mosqueService.loadNearby(loc.latitude, loc.longitude);
        if (this.map) {
          this.map.setView([loc.latitude, loc.longitude], 14);
          this.updateUserMarker(loc.latitude, loc.longitude);
        }
      }
    });
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Nearby Mosques — Find a Masjid Near You',
      description:
        'Locate nearby mosques and masjids on OpenStreetMap with distance, addresses, and instant directions.',
      path: '/mosques',
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      this.leaflet = await import('leaflet');
      this.initMap();
    } catch {
      /* Graceful fallback if leaflet cannot load */
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container || !this.leaflet) return;

    const loc = this.userLocation();
    const lat = loc?.latitude ?? 23.81;
    const lng = loc?.longitude ?? 90.41;

    this.map = this.leaflet.map(container, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false, // Prevents scroll hijacking on mobile
      attributionControl: true,
    });

    this.leaflet
      .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      })
      .addTo(this.map);

    this.updateUserMarker(lat, lng);

    // Initial markers if already loaded
    if (this.mosques().length > 0) {
      this.updateMapMarkers(this.mosques());
    }

    // Invalidate size once rendered
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private updateUserMarker(lat: number, lng: number): void {
    if (!this.map || !this.leaflet) return;

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
      return;
    }

    const userIcon = this.leaflet.divIcon({
      className: 'aq-map-marker aq-map-marker--user',
      html: '<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    this.userMarker = this.leaflet
      .marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(this.map)
      .bindPopup(`<strong>${this.isBn() ? 'আপনার অবস্থান' : 'Your Location'}</strong>`);
  }

  private updateMapMarkers(mosques: Mosque[]): void {
    if (!this.map || !this.leaflet) return;

    // Clear old markers
    for (const marker of this.markersMap.values()) {
      marker.remove();
    }
    this.markersMap.clear();

    const mosqueIcon = this.leaflet.divIcon({
      className: 'aq-map-marker aq-map-marker--mosque',
      html: `
        <div class="mosque-marker-pin">
          <svg width="26" height="32" viewBox="0 0 26 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 32 13 32C13 32 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#0f5132"/>
            <circle cx="13" cy="12" r="9" fill="#ffffff"/>
            <path d="M13 5C10.5 5 8.5 7 8.5 9.5C8.5 11.5 9.8 13.2 11.6 13.8V17H14.4V13.8C16.2 13.2 17.5 11.5 17.5 9.5C17.5 7 15.5 5 13 5Z" fill="#0f5132"/>
          </svg>
        </div>
      `,
      iconSize: [26, 32],
      iconAnchor: [13, 32],
      popupAnchor: [0, -28],
    });

    for (const m of mosques) {
      const distStr = this.formatDistance(m.distanceMeters);
      const popupContent = `
        <div class="map-popup-card">
          <h4 class="map-popup-title">${m.name}</h4>
          <p class="map-popup-dist">📍 ${distStr}</p>
          ${m.address ? `<p class="map-popup-addr">${m.address}</p>` : ''}
          <a href="${m.directionsUrl}" target="_blank" rel="noopener" class="map-popup-btn">
            ${this.isBn() ? 'দিকনির্দেশনা পান' : 'Get Directions'} &rarr;
          </a>
        </div>
      `;

      const marker = this.leaflet
        .marker([m.latitude, m.longitude], { icon: mosqueIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      marker.on('click', () => {
        this.mosqueService.selectMosque(m);
      });

      this.markersMap.set(m.id, marker);
    }
  }

  focusMosqueOnMap(mosque: Mosque): void {
    if (!this.map) return;
    this.map.setView([mosque.latitude, mosque.longitude], 16, { animate: true });
    const marker = this.markersMap.get(mosque.id);
    if (marker) {
      marker.openPopup();
    }
  }

  // --- Radius Selection ----------------------------------------------------
  setRadius(meters: number): void {
    this.mosqueService.setRadius(meters);
  }

  // --- Location Switcher & City Search -------------------------------------
  openCityModal(): void {
    this.cityQuery.set('');
    this.cityResults.set([]);
    this.isCityModalOpen.set(true);
  }

  closeCityModal(): void {
    this.isCityModalOpen.set(false);
  }

  selectPopularCity(city: Place): void {
    this.locationService.setManualLocation(city);
    this.closeCityModal();
  }

  async useCurrentLocation(): Promise<void> {
    await this.locationService.requestGeolocation();
    this.closeCityModal();
  }

  async onSearchCity(query: string): Promise<void> {
    this.cityQuery.set(query);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      this.cityResults.set([]);
      return;
    }

    this.isSearchingCity.set(true);
    try {
      const results = await firstValueFrom(this.locationService.searchCities(trimmed));
      this.cityResults.set(results);
    } finally {
      this.isSearchingCity.set(false);
    }
  }

  selectCityResult(city: Place): void {
    this.locationService.setManualLocation(city);
    this.closeCityModal();
  }

  // --- Formatting Helpers --------------------------------------------------
  formatDistance(meters: number): string {
    if (meters < 1000) {
      const rounded = Math.round(meters);
      return this.isBn()
        ? `${this.prayerTimes.toBnDigits(rounded)} মিটার`
        : `${rounded} m`;
    }
    const km = (meters / 1000).toFixed(1);
    return this.isBn()
      ? `${this.prayerTimes.toBnDigits(km)} কিমি`
      : `${km} km`;
  }

  retry(): void {
    this.mosqueService.retry();
  }
}

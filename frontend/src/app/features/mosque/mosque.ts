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
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { SeoService } from '../../core/services/seo';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { POPULAR_CITIES } from '../prayer/prayer';

export const POPULAR_MOSQUE_LOCATIONS: Place[] = [
  { name: 'Dhaka', displayName: 'Dhaka, Bangladesh', latitude: 23.8103, longitude: 90.4125, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Chittagong', displayName: 'Chittagong, Bangladesh', latitude: 22.3569, longitude: 91.7832, city: 'Chittagong', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Sylhet', displayName: 'Sylhet, Bangladesh', latitude: 24.8949, longitude: 91.8687, city: 'Sylhet', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Rajshahi', displayName: 'Rajshahi, Bangladesh', latitude: 24.3745, longitude: 88.6042, city: 'Rajshahi', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Khulna', displayName: 'Khulna, Bangladesh', latitude: 22.8456, longitude: 89.5403, city: 'Khulna', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Dhanmondi', displayName: 'Dhanmondi, Dhaka', latitude: 23.7461, longitude: 90.3742, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Mirpur', displayName: 'Mirpur, Dhaka', latitude: 23.8071, longitude: 90.3686, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Uttara', displayName: 'Uttara, Dhaka', latitude: 23.8759, longitude: 90.3795, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Gulshan', displayName: 'Gulshan, Dhaka', latitude: 23.7925, longitude: 90.4078, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Mohammadpur', displayName: 'Mohammadpur, Dhaka', latitude: 23.7658, longitude: 90.3585, city: 'Dhaka', country: 'Bangladesh', countryCode: 'bd' },
  { name: 'Makkah', displayName: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262, city: 'Makkah', country: 'Saudi Arabia', countryCode: 'sa' },
  { name: 'Madinah', displayName: 'Madinah, Saudi Arabia', latitude: 24.4672, longitude: 39.6111, city: 'Madinah', country: 'Saudi Arabia', countryCode: 'sa' },
];

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
  protected readonly mobileHardware = inject(MobileHardwareService);

  readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  readonly isBn = this.language.isBn;
  readonly radiusOptions = SEARCH_RADIUS_OPTIONS;
  readonly popularCities = POPULAR_MOSQUE_LOCATIONS;

  // Signals from MosqueService
  readonly searchResult = this.mosqueService.searchResult;
  readonly mosques = this.mosqueService.mosques;
  readonly loading = this.mosqueService.loading;
  readonly error = this.mosqueService.error;
  readonly radius = this.mosqueService.radius;
  readonly selectedMosque = this.mosqueService.selectedMosque;
  readonly userLocation = this.locationService.location;
  readonly isDetecting = this.locationService.isDetecting;
  readonly locationError = this.locationService.error;
  readonly permissionDenied = this.locationService.permissionDenied;

  // Mobile View & Interactivity State
  readonly viewMode = signal<'split' | 'map' | 'list'>('split');
  readonly isAdvisoryDismissed = signal(false);
  readonly canSearchThisArea = signal(false);

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
  private resizeObserver: ResizeObserver | null = null;
  private isUserPanned = false;

  constructor() {
    // When mosques change, update map markers
    effect(() => {
      const list = this.mosques();
      if (this.map && this.leaflet) {
        this.updateMapMarkers(list);
      }
    });

    // When selected mosque changes, highlight marker and center
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
        this.canSearchThisArea.set(false);
        this.mosqueService.loadNearby(loc.latitude, loc.longitude);
        if (this.map) {
          this.updateUserMarker(loc.latitude, loc.longitude);
          if (!this.isUserPanned) {
            this.map.setView([loc.latitude, loc.longitude], this.getZoomForRadius(this.radius()));
          }
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
      const leafletModule: any = await import('leaflet');
      // In Angular/esbuild bundle, Leaflet default export contains L (map, tileLayer, divIcon, marker)
      this.leaflet = leafletModule.default || leafletModule || (window as any).L;
      this.initMap();
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
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
      zoom: this.getZoomForRadius(this.radius()),
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });

    const primaryUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const fallbackUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

    const tiles = this.leaflet
      .tileLayer(primaryUrl, {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        crossOrigin: true,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      })
      .addTo(this.map);

    let errorCount = 0;
    tiles.on('tileerror', () => {
      errorCount++;
      if (errorCount > 3 && (tiles as any).setUrl && !(tiles as any)._hasFallenBack) {
        (tiles as any)._hasFallenBack = true;
        (tiles as any).setUrl(fallbackUrl);
      }
    });

    this.updateUserMarker(lat, lng);

    // Track when user manually drags the map to show "Search this area" button
    this.map.on('movestart', () => {
      this.isUserPanned = true;
    });

    this.map.on('moveend', () => {
      if (!this.map) return;
      const center = this.map.getCenter();
      const currentLoc = this.userLocation();
      const dist = this.getApproxDistanceMeters(
        center.lat,
        center.lng,
        currentLoc.latitude,
        currentLoc.longitude,
      );
      if (dist > 350) {
        this.canSearchThisArea.set(true);
      } else {
        this.canSearchThisArea.set(false);
      }
    });

    // Allow user to click anywhere on the map to set their precise location
    this.map.on('click', (e: any) => {
      if (e?.latlng) {
        this.isUserPanned = false;
        this.setUserCoordinates(e.latlng.lat, e.latlng.lng);
      }
    });

    // Initial markers if already loaded
    if (this.mosques().length > 0) {
      this.updateMapMarkers(this.mosques());
    }

    const selected = this.selectedMosque();
    if (selected) {
      this.focusMosqueOnMap(selected);
    }

    if (typeof ResizeObserver !== 'undefined' && container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
      });
      this.resizeObserver.observe(container);
    }

    // Invalidate size once rendered and after layout stabilizes
    setTimeout(() => this.map?.invalidateSize(), 100);
    setTimeout(() => this.map?.invalidateSize(), 300);
    setTimeout(() => this.map?.invalidateSize(), 800);
  }

  async setUserCoordinates(lat: number, lng: number): Promise<void> {
    await this.locationService.setCoordinates(lat, lng);
    this.canSearchThisArea.set(false);
    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    }
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

    const popupHtml = `
      <div style="text-align: center; font-size: 13px; line-height: 1.4; padding: 2px;">
        <strong>${this.isBn() ? '📍 আপনার অবস্থান' : '📍 Your Location'}</strong><br>
        <span style="font-size: 11px; color: #0f5132;">
          ${this.isBn() ? 'পিনটি টেনে বা ক্লিক করে সঠিক অবস্থান পরিবর্তন করুন' : 'Drag pin or click map to set location'}
        </span>
      </div>
    `;

    this.userMarker = this.leaflet
      .marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000,
        draggable: true,
      })
      .addTo(this.map)
      .bindPopup(popupHtml);

    this.userMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      if (pos) {
        this.isUserPanned = false;
        this.setUserCoordinates(pos.lat, pos.lng);
      }
    });
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
          <svg width="28" height="34" viewBox="0 0 26 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 32 13 32C13 32 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#0f5132"/>
            <circle cx="13" cy="12" r="9" fill="#ffffff"/>
            <path d="M13 5C10.5 5 8.5 7 8.5 9.5C8.5 11.5 9.8 13.2 11.6 13.8V17H14.4V13.8C16.2 13.2 17.5 11.5 17.5 9.5C17.5 7 15.5 5 13 5Z" fill="#0f5132"/>
          </svg>
        </div>
      `,
      iconSize: [28, 34],
      iconAnchor: [14, 34],
      popupAnchor: [0, -30],
    });

    const boundsPoints: [number, number][] = [];
    const loc = this.userLocation();
    if (loc) {
      boundsPoints.push([loc.latitude, loc.longitude]);
    }

    for (const m of mosques) {
      boundsPoints.push([m.latitude, m.longitude]);

      const distStr = this.formatDistance(m.distanceMeters);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`;
      const popupContent = `
        <div class="map-popup-card">
          <h4 class="map-popup-title">${m.name}</h4>
          <p class="map-popup-dist">📍 ${distStr}</p>
          ${m.address ? `<p class="map-popup-addr">${m.address}</p>` : ''}
          <a href="${googleMapsUrl}" target="_blank" rel="noopener" class="map-popup-btn">
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

    // Auto-fit bounds if we have points and user is not manually panning
    if (boundsPoints.length > 1 && this.map && !this.isUserPanned) {
      try {
        const bounds = this.leaflet.latLngBounds(boundsPoints);
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch {
        // Fallback
      }
    }
  }

  focusMosqueOnMap(mosque: Mosque): void {
    this.mosqueService.selectMosque(mosque);
    if (!this.map) return;

    this.map.setView([mosque.latitude, mosque.longitude], 16, { animate: true });
    const marker = this.markersMap.get(mosque.id);
    if (marker) {
      marker.openPopup();
    }
    const container = this.mapContainer()?.nativeElement;
    if (
      container &&
      typeof container.scrollIntoView === 'function' &&
      typeof window !== 'undefined' &&
      this.viewMode() !== 'list'
    ) {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  showMosqueOnMapTab(mosque: Mosque): void {
    this.mosqueService.selectMosque(mosque);
    this.viewMode.set('map');
    // Ensure map container updates layout
    setTimeout(() => {
      this.map?.invalidateSize();
      this.focusMosqueOnMap(mosque);
    }, 80);
  }

  closeSelectedPreview(): void {
    this.mosqueService.selectMosque(null);
  }

  recenterMapOnUser(): void {
    if (!this.map) return;
    this.isUserPanned = false;
    this.canSearchThisArea.set(false);
    const loc = this.userLocation();
    this.map.setView([loc.latitude, loc.longitude], 15, { animate: true });
    if (this.userMarker) {
      this.userMarker.openPopup();
    }
  }

  searchThisArea(): void {
    if (!this.map) return;
    const center = this.map.getCenter();
    this.isUserPanned = false;
    this.canSearchThisArea.set(false);
    this.setUserCoordinates(center.lat, center.lng);
  }

  setViewMode(mode: 'split' | 'map' | 'list'): void {
    this.viewMode.set(mode);
    if (mode === 'map') {
      setTimeout(() => this.map?.invalidateSize(), 80);
    }
  }

  dismissAdvisory(): void {
    this.isAdvisoryDismissed.set(true);
  }

  // --- Radius Selection ----------------------------------------------------
  setRadius(meters: number): void {
    this.mosqueService.setRadius(meters);
    if (this.map && !this.isUserPanned) {
      const loc = this.userLocation();
      this.map.setView([loc.latitude, loc.longitude], this.getZoomForRadius(meters));
    }
  }

  private getZoomForRadius(meters: number): number {
    if (meters <= 1000) return 15;
    if (meters <= 2000) return 14;
    if (meters <= 3000) return 14;
    if (meters <= 5000) return 13;
    return 12;
  }

  private getApproxDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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
    this.isUserPanned = false;
    this.locationService.setManualLocation(city);
    this.closeCityModal();
  }

  async useCurrentLocation(): Promise<void> {
    this.isUserPanned = false;
    await this.locationService.requestGeolocation();
    this.closeCityModal();
    if (this.map) {
      this.recenterMapOnUser();
    }
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
    this.isUserPanned = false;
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

  onOpenDirections(event: Event, m: Mosque): void {
    event.preventDefault();
    event.stopPropagation();
    this.mobileHardware.openNativeMapDirections(m.latitude, m.longitude, m.name);
  }

  retry(): void {
    this.mosqueService.retry();
  }
}

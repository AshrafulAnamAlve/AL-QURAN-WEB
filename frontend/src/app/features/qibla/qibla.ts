import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
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
import { Place, UserLocation } from '../../core/models/location';
import { KAABA_COORDINATES } from '../../core/models/qibla';
import { LanguageService } from '../../core/services/language';
import { LocationService } from '../../core/services/location';
import { QiblaService } from '../../core/services/qibla';
import { SeoService } from '../../core/services/seo';
import { SettingsService } from '../../core/services/settings';
import { POPULAR_CITIES } from '../prayer/prayer';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'aq-qibla-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, FilterFieldComponent],
  templateUrl: './qibla.html',
  styleUrl: './qibla.scss',
})
export class QiblaPage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly qibla = inject(QiblaService);
  protected readonly settings = inject(SettingsService);
  protected readonly locationService = inject(LocationService);
  protected readonly lang = inject(LanguageService);
  private readonly seo = inject(SeoService);

  readonly isBn = this.lang.isBn;
  readonly Math = Math;

  /** Active view mode: real-time visual compass or interactive Leaflet map */
  readonly viewMode = signal<'compass' | 'map'>('compass');

  /** Popular cities for quick selection */
  readonly popularCities = POPULAR_CITIES;

  /** City Switcher Modal state */
  readonly showCityModal = signal<boolean>(false);
  readonly citySearchQuery = signal<string>('');
  readonly isSearchingCities = signal<boolean>(false);
  readonly searchResults = signal<Place[]>([]);

  readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  readonly compassDial = viewChild<ElementRef<HTMLDivElement>>('compassDial');
  private readonly ngZone = inject(NgZone);
  private compassRafId: number | null = null;
  private currentDialAngle = 0;
  private map: any = null;
  private leaflet: any = null;
  private qiblaLine: any = null;
  private userMarker: any = null;
  private kaabaMarker: any = null;
  private resizeObserver: ResizeObserver | null = null;

  /** Rotation degrees of the compass dial (counter-clockwise by device heading) */
  readonly dialRotation = computed(() => {
    return -this.qibla.deviceHeading();
  });

  /** Pointer angle towards the Kaaba relative to dial */
  readonly kaabaPointerAngle = computed(() => {
    return this.qibla.qiblaData().bearing;
  });

  /** What direction the phone is currently pointing towards */
  readonly facingInfo = computed(() => {
    const heading = this.qibla.deviceHeading();
    const cardinal = this.qibla.currentFacingCardinal();
    return {
      degrees: heading,
      cardinalKey: cardinal.key,
      cardinalBn: cardinal.bn,
      cardinalEn: cardinal.en,
    };
  });

  readonly turnGuidance = this.qibla.turnGuidance;

  testVibration(): void {
    this.qibla.testHaptic();
  }

  toggleSound(): void {
    this.qibla.soundEnabled.update((v) => !v);
    if (this.qibla.soundEnabled()) {
      this.qibla.playAlignmentChime();
    }
  }

  toggleVibration(): void {
    this.qibla.vibrationEnabled.update((v) => !v);
    if (this.qibla.vibrationEnabled()) {
      this.qibla.testHaptic();
    }
  }

  constructor() {
    // Whenever location changes, update map path if map is active
    effect(() => {
      const loc = this.settings.location();
      if (this.map && this.leaflet) {
        this.renderMapQiblaLine(loc);
      }
    });

    // When viewMode switches to map, ensure map is instantiated & sized
    effect(() => {
      const mode = this.viewMode();
      if (mode === 'map') {
        setTimeout(() => {
          this.initMapIfNeeded();
          this.map?.invalidateSize();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Qibla Direction & Compass — কিবলা দিকনির্ণয়',
      description:
        'Find the exact Qibla direction towards the Holy Kaaba in Makkah with real-time motion sensor compass, accurate bearing, distance, and interactive map.',
      path: '/qibla',
    });

    this.qibla.startListening();
  }

  async ngAfterViewInit(): Promise<void> {
    this.startCompassAnimation();
    if (this.viewMode() === 'map') {
      await this.initMapIfNeeded();
    }
  }

  ngOnDestroy(): void {
    if (this.compassRafId !== null) {
      cancelAnimationFrame(this.compassRafId);
      this.compassRafId = null;
    }
    this.qibla.stopListening();
    this.cleanupMap();
  }

  private startCompassAnimation(): void {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        const dialEl = this.compassDial()?.nativeElement;
        if (dialEl && this.viewMode() === 'compass') {
          const rawHeading = this.qibla.getRawHeading();
          const targetAngle = -rawHeading;

          // Shortest angular distance interpolation (prevents 360°/0° flip)
          let diff = ((targetAngle - this.currentDialAngle + 540) % 360) - 180;

          if (Math.abs(diff) > 0.04) {
            this.currentDialAngle += diff * 0.22;
            dialEl.style.transform = `rotate3d(0, 0, 1, ${this.currentDialAngle}deg)`;
          }
        }
        this.compassRafId = requestAnimationFrame(render);
      };

      this.compassRafId = requestAnimationFrame(render);
    });
  }

  setViewMode(mode: 'compass' | 'map'): void {
    this.viewMode.set(mode);
  }

  async requestCompassPermission(): Promise<void> {
    await this.qibla.requestPermission();
  }

  // --- City / Location Switcher ---

  openCityModal(): void {
    this.citySearchQuery.set('');
    this.searchResults.set([]);
    this.showCityModal.set(true);
  }

  closeCityModal(): void {
    this.showCityModal.set(false);
  }

  selectPlace(place: Place): void {
    this.locationService.setManualLocation(place);
    this.closeCityModal();
  }

  async onCitySearchChange(query: string): Promise<void> {
    this.citySearchQuery.set(query);
    const clean = query.trim();
    if (clean.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.isSearchingCities.set(true);
    try {
      const places = await firstValueFrom(this.locationService.searchCities(clean));
      this.searchResults.set(places || []);
    } catch {
      this.searchResults.set([]);
    } finally {
      this.isSearchingCities.set(false);
    }
  }

  async useGps(): Promise<void> {
    try {
      await this.locationService.requestGeolocation();
    } catch {
      // Ignored - LocationService handles fallback
    }
  }

  // --- Leaflet Map Handling ---

  private async initMapIfNeeded(): Promise<void> {
    if (typeof window === 'undefined') return;
    const container = this.mapContainer()?.nativeElement;
    if (!container || this.map) return;

    try {
      const leafletModule: any = await import('leaflet');
      this.leaflet = leafletModule.default || leafletModule || (window as any).L;

      this.map = this.leaflet.map(container, {
        zoomControl: true,
        attributionControl: true,
      });

      this.leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(this.map);

      this.renderMapQiblaLine(this.settings.location());

      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.map?.invalidateSize();
        });
        this.resizeObserver.observe(container);
      }
    } catch (err) {
      console.error('Failed to load Leaflet for Qibla map:', err);
    }
  }

  private renderMapQiblaLine(loc: UserLocation): void {
    if (!this.map || !this.leaflet) return;

    const L = this.leaflet;
    const userCoords: [number, number] = [loc.latitude, loc.longitude];
    const kaabaCoords: [number, number] = [KAABA_COORDINATES.latitude, KAABA_COORDINATES.longitude];

    // Clear old layers
    if (this.qiblaLine) this.map.removeLayer(this.qiblaLine);
    if (this.userMarker) this.map.removeLayer(this.userMarker);
    if (this.kaabaMarker) this.map.removeLayer(this.kaabaMarker);

    // User marker
    const userIcon = L.divIcon({
      className: 'user-map-pin',
      html: `
        <div style="background: #10b981; border: 3px solid #fff; border-radius: 50%; width: 22px; height: 22px; box-shadow: 0 0 14px rgba(16, 185, 129, 0.7);"></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    this.userMarker = L.marker(userCoords, { icon: userIcon })
      .bindPopup(`<strong>${loc.displayName}</strong><br>${this.isBn() ? 'আপনার অবস্থান' : 'Your Location'}`)
      .addTo(this.map);

    // Kaaba marker
    const kaabaIcon = L.divIcon({
      className: 'kaaba-map-pin',
      html: `
        <div style="background: #000; border: 2.5px solid #d4af37; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 0 16px rgba(212, 175, 55, 0.9);">🕋</div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    this.kaabaMarker = L.marker(kaabaCoords, { icon: kaabaIcon })
      .bindPopup(`<strong>পবিত্র কা'বা শরীফ (Makkah)</strong><br>${this.isBn() ? 'কিবলার লক্ষ্যস্থল' : 'Qibla Destination'}`)
      .addTo(this.map);

    // Great circle line
    this.qiblaLine = L.polyline([userCoords, kaabaCoords], {
      color: '#d4af37',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 8',
    }).addTo(this.map);

    // Fit bounds with padding
    const bounds = L.latLngBounds([userCoords, kaabaCoords]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  private cleanupMap(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

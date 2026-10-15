import { Injectable, computed, inject, signal } from '@angular/core';
import { AppError } from '../models/api-error';
import { Mosque, MosqueSearchResult } from '../models/mosque';
import { LocationService } from './location';
import { MosqueApiService } from './mosque-api';

export const SEARCH_RADIUS_OPTIONS = [
  { meters: 1000, labelEn: '1 km', labelBn: '১ কিমি' },
  { meters: 2000, labelEn: '2 km', labelBn: '২ কিমি' },
  { meters: 3000, labelEn: '3 km', labelBn: '৩ কিমি' },
  { meters: 5000, labelEn: '5 km', labelBn: '৫ কিমি' },
  { meters: 10000, labelEn: '10 km', labelBn: '১০ কিমি' },
] as const;

/**
 * Manages nearby mosques state, radius adjustments, and map selection.
 */
@Injectable({ providedIn: 'root' })
export class MosqueService {
  private readonly mosqueApi = inject(MosqueApiService);
  private readonly locationService = inject(LocationService);

  private readonly _searchResult = signal<MosqueSearchResult | null>(null);
  readonly searchResult = this._searchResult.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<AppError | null>(null);
  readonly error = this._error.asReadonly();

  private readonly _radius = signal<number>(3000);
  readonly radius = this._radius.asReadonly();

  private readonly _selectedMosque = signal<Mosque | null>(null);
  readonly selectedMosque = this._selectedMosque.asReadonly();

  readonly mosques = computed<Mosque[]>(() => this._searchResult()?.mosques ?? []);
  readonly totalCount = computed<number>(() => this.mosques().length);
  readonly userLocation = computed(() => this.locationService.location());

  /**
   * Loads nearby mosques for a specific point or the current user location.
   */
  loadNearby(lat?: number, lng?: number, radius?: number): void {
    const loc = this.userLocation();
    const latitude = lat ?? loc.latitude;
    const longitude = lng ?? loc.longitude;
    const searchRadius = radius ?? this._radius();

    this._loading.set(true);
    this._error.set(null);

    this.mosqueApi.findNearby(latitude, longitude, searchRadius).subscribe({
      next: (res) => {
        this._searchResult.set(res);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        const appError = err as AppError;
        this._error.set(
          appError && appError.message
            ? appError
            : {
                code: 'upstream_unavailable',
                message: 'Could not load nearby mosques. The map server may be busy.',
                status: 502,
                retryable: true,
                service: 'Overpass (OpenStreetMap)',
              },
        );
        this._loading.set(false);
      },
    });
  }

  /** Changes the search radius and re-runs the search. */
  setRadius(meters: number): void {
    if (this._radius() !== meters) {
      this._radius.set(meters);
      this.loadNearby();
    }
  }

  /** Selects or deselects a mosque for map highlighting. */
  selectMosque(mosque: Mosque | null): void {
    this._selectedMosque.set(mosque);
  }

  /** Retries the previous search. */
  retry(): void {
    this.loadNearby();
  }
}

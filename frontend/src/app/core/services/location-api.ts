import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Place } from '../models/location';
import { ApiService } from './api';

/**
 * Communicates with the backend /api/location endpoints.
 */
@Injectable({ providedIn: 'root' })
export class LocationApiService {
  private readonly api = inject(ApiService);

  /** Search places by name/query. */
  search(query: string, limit = 10): Observable<Place[]> {
    return this.api.get<Place[]>('location/search', { q: query, limit });
  }

  /** Reverse geocode a latitude/longitude coordinate to a Place. */
  reverse(latitude: number, longitude: number): Observable<Place> {
    return this.api.get<Place>('location/reverse', { latitude, longitude });
  }
}

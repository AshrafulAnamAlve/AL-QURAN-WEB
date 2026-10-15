import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MosqueSearchResult } from '../models/mosque';
import { ApiService } from './api';

/**
 * Communicates with the backend /api/mosques endpoints.
 */
@Injectable({ providedIn: 'root' })
export class MosqueApiService {
  private readonly api = inject(ApiService);

  /**
   * Finds mosques within a radius of a coordinate, nearest first.
   *
   * @param latitude Latitude, -90 to 90.
   * @param longitude Longitude, -180 to 180.
   * @param radius Search radius in metres (100 to 50000). Default is 3000.
   * @param limit Maximum results to return (1 to 500). Default is 50.
   */
  findNearby(
    latitude: number,
    longitude: number,
    radius?: number,
    limit?: number,
  ): Observable<MosqueSearchResult> {
    return this.api.get<MosqueSearchResult>('mosques', {
      latitude,
      longitude,
      radius,
      limit,
    });
  }
}

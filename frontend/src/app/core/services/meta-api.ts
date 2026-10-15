import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInfo, Health, UpstreamHealthReport } from '../models/app-info';
import { ApiService } from './api';

/**
 * Talks to the backend's /api/meta and /api/health endpoints.
 *
 * This is the pattern every feature service follows: one small class per API
 * area, depending on ApiService, returning typed models. Components never build
 * URLs or touch HttpClient themselves.
 */
@Injectable({ providedIn: 'root' })
export class MetaApiService {
  private readonly api = inject(ApiService);

  /** App name, version and the catalogue of external APIs in use. */
  getAppInfo(): Observable<AppInfo> {
    return this.api.get<AppInfo>('meta');
  }

  /** Is the backend process alive? Does not touch the network. */
  getHealth(): Observable<Health> {
    return this.api.get<Health>('health');
  }

  /** Live connectivity check against every third-party API. */
  getUpstreamHealth(): Observable<UpstreamHealthReport> {
    return this.api.get<UpstreamHealthReport>('health/upstreams');
  }
}

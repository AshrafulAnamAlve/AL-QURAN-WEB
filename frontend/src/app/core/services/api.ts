import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Query string values we know how to serialise. */
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * The single door to the ASP.NET Core backend.
 *
 * Feature services (QuranService, PrayerService, ...) depend on this rather than
 * on HttpClient, so the base URL, the request timeout and the error shape are
 * defined once. Components never call HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /** Hard client-side ceiling so a hung request cannot spin forever. */
  private static readonly REQUEST_TIMEOUT_MS = 30_000;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<T>(this.url(path), { params: ApiService.toHttpParams(params) })
      .pipe(timeout(ApiService.REQUEST_TIMEOUT_MS));
  }

  post<T>(path: string, body: unknown, params?: QueryParams): Observable<T> {
    return this.http
      .post<T>(this.url(path), body, { params: ApiService.toHttpParams(params) })
      .pipe(timeout(ApiService.REQUEST_TIMEOUT_MS));
  }

  /** Joins the configured base URL and a relative path without doubling slashes. */
  private url(path: string): string {
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const suffix = path.replace(/^\/+/, '');
    return `${base}/${suffix}`;
  }

  /** Drops undefined and null so optional filters never appear as "?x=undefined". */
  private static toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams.keys().length > 0 ? httpParams : undefined;
  }
}

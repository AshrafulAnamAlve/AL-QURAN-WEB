import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Place, UserLocation, roundCoordinate } from '../models/location';
import { LocationApiService } from './location-api';
import { STORAGE_KEYS, StorageService } from './storage';

/** Default fallback location for Bangladesh (Dhaka). */
export const DEFAULT_BANGLADESH_LOCATION: UserLocation = {
  latitude: 23.81,
  longitude: 90.41,
  city: 'Dhaka',
  country: 'Bangladesh',
  displayName: 'Dhaka, Bangladesh',
  source: 'default',
};

/**
 * Detects the most accurate default location based on the browser's timezone and UTC offset,
 * defaulting to Dhaka for Bangladesh users (UTC+6) or Makkah for others.
 */
export function detectDefaultLocation(): UserLocation {
  try {
    const tz =
      typeof Intl !== 'undefined' && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || ''
        : '';
    const offsetMinutes = -new Date().getTimezoneOffset(); // e.g. +360 for UTC+6

    if (tz.includes('Dhaka') || tz === 'Asia/Dhaka' || offsetMinutes === 360) {
      return DEFAULT_BANGLADESH_LOCATION;
    }
    if (tz.includes('Karachi') || tz === 'Asia/Karachi' || offsetMinutes === 300) {
      return {
        latitude: 24.86,
        longitude: 67.0,
        city: 'Karachi',
        country: 'Pakistan',
        displayName: 'Karachi, Pakistan',
        source: 'default',
      };
    }
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz === 'Asia/Kolkata' || offsetMinutes === 330) {
      return {
        latitude: 22.57,
        longitude: 88.36,
        city: 'Kolkata',
        country: 'India',
        displayName: 'Kolkata, India',
        source: 'default',
      };
    }
    if (tz.includes('Jakarta') || tz === 'Asia/Jakarta' || offsetMinutes === 420) {
      return {
        latitude: -6.2,
        longitude: 106.81,
        city: 'Jakarta',
        country: 'Indonesia',
        displayName: 'Jakarta, Indonesia',
        source: 'default',
      };
    }
    if (tz.includes('London') || tz === 'Europe/London') {
      return {
        latitude: 51.51,
        longitude: -0.13,
        city: 'London',
        country: 'United Kingdom',
        displayName: 'London, United Kingdom',
        source: 'default',
      };
    }
    if (tz.includes('New_York') || tz === 'America/New_York') {
      return {
        latitude: 40.71,
        longitude: -74.01,
        city: 'New York',
        country: 'United States',
        displayName: 'New York, United States',
        source: 'default',
      };
    }
  } catch {
    // Non-critical fallback
  }

  return {
    latitude: 21.42,
    longitude: 39.83,
    city: 'Makkah',
    country: 'Saudi Arabia',
    displayName: 'Makkah, Saudi Arabia',
    source: 'default',
  };
}

/** Default fallback location resolved at runtime. */
export const DEFAULT_LOCATION: UserLocation = detectDefaultLocation();

/**
 * Manages user location detection, manual place selection, coordinate rounding,
 * and persistence.
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly storage = inject(StorageService);
  private readonly locationApi = inject(LocationApiService);

  private readonly _location = signal<UserLocation>(this.loadInitialLocation());
  readonly location = this._location.asReadonly();

  private readonly _isDetecting = signal<boolean>(false);
  readonly isDetecting = this._isDetecting.asReadonly();

  private readonly _permissionDenied = signal<boolean>(false);
  readonly permissionDenied = this._permissionDenied.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  constructor() {
    this.checkAutoGeolocation();
  }

  private checkAutoGeolocation(): void {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (result.state === 'granted') {
            this.requestGeolocation();
          }
        })
        .catch(() => {});
    }
  }

  /** Searches cities/places via the backend geocoding endpoint. */
  searchCities(query: string): Observable<Place[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return of([]);
    }
    return this.locationApi.search(trimmed);
  }

  /**
   * Requests geolocation from the browser.
   * On success: coordinates are rounded to 2 decimal places for privacy and reverse geocoded.
   * On failure/denial: permissionDenied signal is set and false is returned gracefully.
   */
  async requestGeolocation(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this._error.set('Geolocation is not supported by your browser.');
      this._permissionDenied.set(true);
      return false;
    }

    this._isDetecting.set(true);
    this._error.set(null);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const rawLat = position.coords.latitude;
            const rawLng = position.coords.longitude;
            const latitude = roundCoordinate(rawLat, 2);
            const longitude = roundCoordinate(rawLng, 2);

            let displayName = `Coordinates: ${latitude}, ${longitude}`;
            let city: string | null = null;
            let country: string | null = null;

            try {
              const place = await firstValueFrom(
                this.locationApi.reverse(latitude, longitude).pipe(catchError(() => of(null))),
              );
              if (place) {
                displayName = place.displayName || `${place.city || place.name}, ${place.country || ''}`;
                city = place.city || place.name || null;
                country = place.country || null;
              }
            } catch {
              // Non-critical; fallback displayName is already set
            }

            const detectedLocation: UserLocation = {
              latitude,
              longitude,
              city,
              country,
              displayName,
              source: 'geolocation',
            };

            this._location.set(detectedLocation);
            this.storage.write(STORAGE_KEYS.location, detectedLocation);
            this._permissionDenied.set(false);
            this._error.set(null);
            this._isDetecting.set(false);
            resolve(true);
          } catch (err) {
            this._error.set('Failed to resolve location coordinates.');
            this._isDetecting.set(false);
            resolve(false);
          }
        },
        (error) => {
          this._isDetecting.set(false);
          if (error.code === error.PERMISSION_DENIED) {
            this._permissionDenied.set(true);
            this._error.set('Location permission was denied.');
          } else {
            this._error.set(error.message || 'Unable to retrieve your location.');
          }
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    });
  }

  /** Sets a user-selected place from manual search. */
  setManualLocation(place: Place): void {
    const latitude = roundCoordinate(place.latitude, 2);
    const longitude = roundCoordinate(place.longitude, 2);

    const manualLocation: UserLocation = {
      latitude,
      longitude,
      city: place.city || place.name || null,
      country: place.country || null,
      displayName: place.displayName || `${place.name}, ${place.country || ''}`,
      source: 'manual',
    };

    this._location.set(manualLocation);
    this.storage.write(STORAGE_KEYS.location, manualLocation);
    this._permissionDenied.set(false);
    this._error.set(null);
  }

  /** Clears the permission-denied flag (e.g. after user dismisses banner). */
  dismissPermissionPrompt(): void {
    this._permissionDenied.set(false);
  }

  private loadInitialLocation(): UserLocation {
    const saved = this.storage.read<UserLocation | null>(STORAGE_KEYS.location, null);
    if (saved && typeof saved.latitude === 'number' && typeof saved.longitude === 'number') {
      if (saved.source !== 'default') {
        return {
          ...saved,
          latitude: roundCoordinate(saved.latitude, 2),
          longitude: roundCoordinate(saved.longitude, 2),
        };
      }
    }
    return DEFAULT_LOCATION;
  }
}

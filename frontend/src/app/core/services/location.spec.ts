import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { Place, UserLocation, roundCoordinate } from '../models/location';
import { LocationApiService } from './location-api';
import { DEFAULT_LOCATION, LocationService } from './location';
import { STORAGE_KEYS, StorageService } from './storage';

describe('LocationService', () => {
  let service: LocationService;
  let storage: StorageService;
  let locationApi: { search: ReturnType<typeof vi.fn>; reverse: ReturnType<typeof vi.fn> };

  const mockDhakaPlace: Place = {
    name: 'Dhaka',
    displayName: 'Dhaka, Bangladesh',
    latitude: 23.810332,
    longitude: 90.412518,
    city: 'Dhaka',
    country: 'Bangladesh',
    countryCode: 'bd',
  };

  beforeEach(() => {
    locationApi = {
      search: vi.fn().mockReturnValue(of([mockDhakaPlace])),
      reverse: vi.fn().mockReturnValue(of(mockDhakaPlace)),
    };

    TestBed.configureTestingModule({
      providers: [
        LocationService,
        StorageService,
        { provide: LocationApiService, useValue: locationApi },
      ],
    });

    storage = TestBed.inject(StorageService);
    storage.clearAll();
  });

  afterEach(() => {
    storage.clearAll();
    vi.restoreAllMocks();
  });

  it('initializes with DEFAULT_LOCATION if no location is stored', () => {
    service = TestBed.inject(LocationService);
    expect(service.location()).toEqual(DEFAULT_LOCATION);
    expect(service.permissionDenied()).toBe(false);
  });

  it('initializes with stored location and rounds coordinates', () => {
    const saved: UserLocation = {
      latitude: 23.810332,
      longitude: 90.412518,
      displayName: 'Dhaka, Bangladesh',
      source: 'manual',
    };
    storage.write(STORAGE_KEYS.location, saved);

    service = TestBed.inject(LocationService);
    expect(service.location().latitude).toBe(23.8103);
    expect(service.location().longitude).toBe(90.4125);
    expect(service.location().displayName).toBe('Dhaka, Bangladesh');
  });

  it('rounds coordinates to specified decimal places', () => {
    expect(roundCoordinate(23.810332, 2)).toBe(23.81);
    expect(roundCoordinate(90.412518, 2)).toBe(90.41);
    expect(roundCoordinate(21.4225, 3)).toBe(21.423);
  });

  it('sets manual location with rounded coordinates and persists', () => {
    service = TestBed.inject(LocationService);
    service.setManualLocation(mockDhakaPlace);

    const current = service.location();
    expect(current.latitude).toBe(23.8103);
    expect(current.longitude).toBe(90.4125);
    expect(current.displayName).toBe('Dhaka, Bangladesh');
    expect(current.source).toBe('manual');

    const stored = storage.read<UserLocation>(STORAGE_KEYS.location, DEFAULT_LOCATION);
    expect(stored.latitude).toBe(23.8103);
    expect(stored.longitude).toBe(90.4125);
  });

  it('sets coordinates directly via setCoordinates', async () => {
    service = TestBed.inject(LocationService);
    await service.setCoordinates(23.75489, 90.38923);

    const current = service.location();
    expect(current.latitude).toBe(23.7549);
    expect(current.longitude).toBe(90.3892);
    expect(current.source).toBe('manual');
  });

  it('searches cities when query has at least 2 characters', async () => {
    service = TestBed.inject(LocationService);
    const results = await new Promise<Place[]>((resolve) => {
      service.searchCities('Dhaka').subscribe(resolve);
    });

    expect(locationApi.search).toHaveBeenCalledWith('Dhaka');
    expect(results).toEqual([mockDhakaPlace]);
  });

  it('returns empty array when search query has less than 2 characters', async () => {
    service = TestBed.inject(LocationService);
    const results = await new Promise<Place[]>((resolve) => {
      service.searchCities('D').subscribe(resolve);
    });

    expect(locationApi.search).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  it('handles geolocation permission denied cleanly', async () => {
    service = TestBed.inject(LocationService);

    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          message: 'User denied Geolocation',
        });
      }),
    };

    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: mockGeolocation,
    });

    const success = await service.requestGeolocation();
    expect(success).toBe(false);
    expect(service.permissionDenied()).toBe(true);
    expect(service.error()).toContain('Location permission was denied');
    expect(service.location()).toEqual(DEFAULT_LOCATION);
  });

  it('handles geolocation success, rounds coordinates, and reverse geocodes', async () => {
    service = TestBed.inject(LocationService);

    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 23.81234,
            longitude: 90.41456,
          },
        });
      }),
    };

    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: mockGeolocation,
    });

    const success = await service.requestGeolocation();
    expect(success).toBe(true);
    expect(service.permissionDenied()).toBe(false);
    expect(locationApi.reverse).toHaveBeenCalledWith(23.8123, 90.4146);
    expect(service.location().latitude).toBe(23.8123);
    expect(service.location().longitude).toBe(90.4146);
    expect(service.location().source).toBe('geolocation');
  });

  it('allows dismissing the permission denied prompt', () => {
    service = TestBed.inject(LocationService);
    (service as unknown as { _permissionDenied: { set: (v: boolean) => void } })._permissionDenied.set(true);
    expect(service.permissionDenied()).toBe(true);

    service.dismissPermissionPrompt();
    expect(service.permissionDenied()).toBe(false);
  });
});

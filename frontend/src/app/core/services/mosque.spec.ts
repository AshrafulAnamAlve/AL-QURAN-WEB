import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AppError } from '../models/api-error';
import { Mosque, MosqueSearchResult } from '../models/mosque';
import { DEFAULT_BANGLADESH_LOCATION, LocationService } from './location';
import { MosqueApiService } from './mosque-api';
import { MosqueService } from './mosque';

describe('MosqueService', () => {
  let service: MosqueService;
  let mosqueApi: { findNearby: ReturnType<typeof vi.fn> };
  let locationService: { location: ReturnType<typeof vi.fn> };

  const mockMosque: Mosque = {
    id: 'node/12345',
    name: 'Baitul Mukarram National Mosque',
    hasName: true,
    latitude: 23.7289,
    longitude: 90.4125,
    distanceMeters: 450,
    address: 'Topkhana Rd, Dhaka',
    denomination: 'Sunni',
    website: null,
    phone: null,
    osmType: 'node',
    osmId: 12345,
    mapUrl: 'https://www.openstreetmap.org/node/12345',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=23.7289,90.4125',
  };

  const mockResult: MosqueSearchResult = {
    latitude: 23.81,
    longitude: 90.41,
    radiusMeters: 3000,
    mosques: [mockMosque],
    source: 'Overpass API',
    attribution: 'Data © OpenStreetMap contributors',
    notice: 'Community data',
  };

  beforeEach(() => {
    mosqueApi = {
      findNearby: vi.fn().mockReturnValue(of(mockResult)),
    };

    locationService = {
      location: vi.fn().mockReturnValue(DEFAULT_BANGLADESH_LOCATION),
    };

    TestBed.configureTestingModule({
      providers: [
        MosqueService,
        { provide: MosqueApiService, useValue: mosqueApi },
        { provide: LocationService, useValue: locationService },
      ],
    });

    service = TestBed.inject(MosqueService);
  });

  it('loads nearby mosques and updates signals', () => {
    service.loadNearby();

    expect(mosqueApi.findNearby).toHaveBeenCalledWith(23.81, 90.41, 3000);
    expect(service.mosques().length).toBe(1);
    expect(service.totalCount()).toBe(1);
    expect(service.mosques()[0].name).toBe('Baitul Mukarram National Mosque');
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('handles upstream Overpass errors gracefully with retryable flag', () => {
    const appError: AppError = {
      code: 'upstream_unavailable',
      message: 'Every OpenStreetMap mosque server is busy right now.',
      status: 502,
      retryable: true,
      service: 'Overpass (OpenStreetMap)',
    };

    mosqueApi.findNearby.mockReturnValue(throwError(() => appError));
    service.loadNearby();

    expect(service.loading()).toBe(false);
    expect(service.error()).not.toBeNull();
    expect(service.error()?.retryable).toBe(true);
    expect(service.error()?.message).toContain('busy');
  });

  it('updates radius and triggers reload on setRadius()', () => {
    service.setRadius(5000);

    expect(service.radius()).toBe(5000);
    expect(mosqueApi.findNearby).toHaveBeenCalledWith(23.81, 90.41, 5000);
  });

  it('selects and deselects a mosque with selectMosque()', () => {
    expect(service.selectedMosque()).toBeNull();

    service.selectMosque(mockMosque);
    expect(service.selectedMosque()?.id).toBe('node/12345');

    service.selectMosque(null);
    expect(service.selectedMosque()).toBeNull();
  });

  it('retries search with current settings on retry()', () => {
    service.retry();
    expect(mosqueApi.findNearby).toHaveBeenCalled();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { MosqueSearchResult } from '../models/mosque';
import { MosqueApiService } from './mosque-api';

describe('MosqueApiService', () => {
  let service: MosqueApiService;
  let http: HttpTestingController;

  const mockResponse: MosqueSearchResult = {
    latitude: 23.81,
    longitude: 90.41,
    radiusMeters: 3000,
    mosques: [
      {
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
      },
    ],
    source: 'Overpass (mail.overpass-api.de)',
    attribution: 'Data © OpenStreetMap contributors, ODbL 1.0',
    notice: 'Community-maintained data.',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MosqueApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries /api/mosques with latitude and longitude', () => {
    let result: MosqueSearchResult | undefined;
    service.findNearby(23.81, 90.41).subscribe((res) => (result = res));

    const req = http.expectOne('/api/mosques?latitude=23.81&longitude=90.41');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(result?.mosques.length).toBe(1);
    expect(result?.mosques[0].name).toBe('Baitul Mukarram National Mosque');
  });

  it('includes radius and limit query parameters when supplied', () => {
    let result: MosqueSearchResult | undefined;
    service.findNearby(23.81, 90.41, 5000, 20).subscribe((res) => (result = res));

    const req = http.expectOne('/api/mosques?latitude=23.81&longitude=90.41&radius=5000&limit=20');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(result?.radiusMeters).toBe(3000);
  });
});

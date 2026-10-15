import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Mosque, MosqueSearchResult } from '../../core/models/mosque';
import { DEFAULT_BANGLADESH_LOCATION, LocationService } from '../../core/services/location';
import { LocationApiService } from '../../core/services/location-api';
import { MosqueApiService } from '../../core/services/mosque-api';
import { MosqueService } from '../../core/services/mosque';
import { PrayerApiService } from '../../core/services/prayer-api';
import { MosquePage } from './mosque';

describe('MosquePage', () => {
  let fixture: ComponentFixture<MosquePage>;
  let component: MosquePage;
  let mosqueService: MosqueService;

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

  beforeEach(async () => {
    const mosqueApi = {
      findNearby: vi.fn().mockReturnValue(of(mockResult)),
    };

    const locationApi = {
      search: vi.fn().mockReturnValue(of([])),
      reverse: vi.fn().mockReturnValue(of(null)),
    };

    const prayerApi = {
      getTimings: vi.fn().mockReturnValue(of(null)),
      getMethods: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [MosquePage],
      providers: [
        provideRouter([]),
        { provide: MosqueApiService, useValue: mosqueApi },
        { provide: LocationApiService, useValue: locationApi },
        { provide: PrayerApiService, useValue: prayerApi },
      ],
    }).compileComponents();

    mosqueService = TestBed.inject(MosqueService);
    fixture = TestBed.createComponent(MosquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders page header and location badge', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Nearby Mosques');
    expect(el.textContent).toContain('Dhaka');
  });

  it('renders OpenStreetMap community data advisory note', () => {
    const el: HTMLElement = fixture.nativeElement;
    const advisory = el.querySelector('.advisory-banner');
    expect(advisory).not.toBeNull();
    expect(advisory?.textContent).toContain('OpenStreetMap');
  });

  it('renders radius selector pills and changes radius on click', () => {
    const el: HTMLElement = fixture.nativeElement;
    const pills = el.querySelectorAll('.radius-pill');
    expect(pills.length).toBe(5);

    const radiusSpy = vi.spyOn(mosqueService, 'setRadius');
    component.setRadius(5000);
    expect(radiusSpy).toHaveBeenCalledWith(5000);
  });

  it('renders mosque list cards with distance and directions link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const card = el.querySelector('.mosque-card');
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain('Baitul Mukarram National Mosque');
    expect(card?.textContent).toContain('450 m');
    expect(card?.textContent).toContain('Directions');

    const directionsLink = el.querySelector('.directions-link') as HTMLAnchorElement;
    expect(directionsLink?.href).toContain('google.com/maps');
  });

  it('opens and closes city switcher modal', () => {
    expect(component.isCityModalOpen()).toBe(false);

    component.openCityModal();
    fixture.detectChanges();
    expect(component.isCityModalOpen()).toBe(true);

    const modal = fixture.nativeElement.querySelector('.modal-dialog');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Select Location');

    component.closeCityModal();
    fixture.detectChanges();
    expect(component.isCityModalOpen()).toBe(false);
  });
});

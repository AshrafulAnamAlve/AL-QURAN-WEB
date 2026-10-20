import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  QiblaService,
  calculateKaabaDistance,
  calculateQiblaBearing,
  getCardinalDirection,
} from './qibla';
import { SettingsService } from './settings';

describe('QiblaService Math & Utilities', () => {
  it('calculates accurate Qibla bearing and distance for Dhaka, Bangladesh', () => {
    // Dhaka coordinates: ~23.81 N, 90.41 E
    const bearing = calculateQiblaBearing(23.81, 90.41);
    const distance = calculateKaabaDistance(23.81, 90.41);

    // Dhaka to Makkah bearing is ~277.6° (West by West-Northwest)
    expect(bearing).toBeGreaterThan(276);
    expect(bearing).toBeLessThan(279);

    // Distance is ~5,150 km
    expect(distance).toBeGreaterThan(5100);
    expect(distance).toBeLessThan(5200);

    const cardinal = getCardinalDirection(bearing);
    expect(['W', 'WNW']).toContain(cardinal.key);
  });

  it('calculates accurate Qibla bearing for Medina (North of Makkah)', () => {
    // Medina coordinates: ~24.47 N, 39.61 E
    // Makkah is directly South of Medina: Bearing should be ~177° (South)
    const bearing = calculateQiblaBearing(24.47, 39.61);
    const distance = calculateKaabaDistance(24.47, 39.61);

    expect(bearing).toBeGreaterThan(170);
    expect(bearing).toBeLessThan(185);

    // Medina to Makkah distance is approx ~340 km
    expect(distance).toBeGreaterThan(320);
    expect(distance).toBeLessThan(370);

    const cardinal = getCardinalDirection(bearing);
    expect(['S', 'SSE']).toContain(cardinal.key);
  });

  it('calculates accurate Qibla bearing for London, UK', () => {
    // London coordinates: ~51.5074 N, -0.1278 W
    // London to Makkah bearing is ~118.9° (East-Southeast)
    const bearing = calculateQiblaBearing(51.5074, -0.1278);
    expect(bearing).toBeGreaterThan(117);
    expect(bearing).toBeLessThan(121);

    const cardinal = getCardinalDirection(bearing);
    expect(['ESE', 'SE']).toContain(cardinal.key);
  });

  it('returns valid cardinal directions in English and Bengali', () => {
    const north = getCardinalDirection(0);
    expect(north.key).toBe('N');
    expect(north.bn).toBe('উত্তর');

    const east = getCardinalDirection(90);
    expect(east.key).toBe('E');
    expect(east.bn).toBe('পূর্ব');

    const south = getCardinalDirection(180);
    expect(south.key).toBe('S');
    expect(south.bn).toBe('দক্ষিণ');

    const west = getCardinalDirection(270);
    expect(west.key).toBe('W');
    expect(west.bn).toBe('পশ্চিম');
  });

  it('service initializes with reactive calculation and default heading', () => {
    TestBed.configureTestingModule({
      providers: [QiblaService, SettingsService],
    });

    const service = TestBed.inject(QiblaService);
    const qibla = service.qiblaData();

    expect(qibla.bearing).toBeDefined();
    expect(qibla.distanceKm).toBeGreaterThan(0);
    expect(qibla.cardinalKey).toBeDefined();
    expect(service.deviceHeading()).toBe(0);
  });
});

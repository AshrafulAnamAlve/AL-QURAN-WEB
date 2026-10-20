import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DesktopService } from './desktop';
import { LanguageService } from './language';
import { LocationService } from './location';
import { PrayerApiService } from './prayer-api';
import { PrayerTimesService } from './prayer';
import { StorageService } from './storage';

describe('DesktopService', () => {
  let service: DesktopService;

  beforeEach(() => {
    localStorage.clear();

    const mockPrayerApi = {
      getTimings: vi.fn().mockReturnValue(of({ times: [] })),
      getMethods: vi.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      providers: [
        DesktopService,
        PrayerTimesService,
        LanguageService,
        StorageService,
        LocationService,
        { provide: PrayerApiService, useValue: mockPrayerApi },
      ],
    });

    service = TestBed.inject(DesktopService);
  });

  it('initializes and detects web environment by default', () => {
    expect(service.isDesktop()).toBe(false);
    expect(service.platform()).toBe('web');
  });

  it('delegates notification and window controls safely when desktopApi is not present', () => {
    expect(() => service.sendNotification('Test', 'Body')).not.toThrow();
    expect(() => service.minimize()).not.toThrow();
    expect(() => service.maximize()).not.toThrow();
    expect(() => service.close()).not.toThrow();
    expect(() => service.quit()).not.toThrow();
  });

  it('delegates to desktopApi when desktopApi is present', () => {
    const notifySpy = vi.fn();
    const minimizeSpy = vi.fn();
    const updatePrayerSpy = vi.fn();

    (window as any).desktopApi = {
      isDesktop: true,
      platform: 'win32',
      notify: notifySpy,
      minimize: minimizeSpy,
      updatePrayerStatus: updatePrayerSpy,
    };

    const desktopService = TestBed.inject(DesktopService);
    desktopService.sendNotification('Title', 'Message');
    expect(notifySpy).toHaveBeenCalledWith('Title', 'Message', undefined);

    desktopService.minimize();
    expect(minimizeSpy).toHaveBeenCalled();

    delete (window as any).desktopApi;
  });
});

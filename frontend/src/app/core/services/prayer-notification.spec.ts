import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PrayerNotificationService } from './prayer-notification';
import { StorageService } from './storage';
import { PrayerTimesService } from './prayer';
import { LocationService } from './location';
import { LanguageService } from './language';
import { LoggerService } from './logger';
import { DEFAULT_PRAYER_NOTIFICATION_SETTINGS } from '../models/prayer-notification';
import { PrayerTime } from '../models/prayer';

describe('PrayerNotificationService', () => {
  let service: PrayerNotificationService;
  let storage: StorageService;
  let prayerTimes: PrayerTimesService;

  const mockPrayer: PrayerTime = {
    key: 'asr',
    name: 'Asr',
    arabicName: 'العصر',
    banglaName: 'আসর',
    time: '15:54',
    at: new Date().toISOString(),
    isPrayer: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrayerNotificationService,
        StorageService,
        PrayerTimesService,
        LocationService,
        LanguageService,
        LoggerService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    storage = TestBed.inject(StorageService);
    storage.clearAll();
    prayerTimes = TestBed.inject(PrayerTimesService);
    service = TestBed.inject(PrayerNotificationService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    storage.clearAll();
  });

  it('should be created with default settings', () => {
    expect(service).toBeTruthy();
    expect(service.settings().enabled).toBe(true);
    expect(service.settings().fajr).toBe(true);
    expect(service.settings().dhuhr).toBe(true);
    expect(service.settings().asr).toBe(true);
    expect(service.settings().maghrib).toBe(true);
    expect(service.settings().isha).toBe(true);
    expect(service.settings().defaultMuted).toBe(false);
    expect(service.settings().autoPlayAdhan).toBe(true);
  });

  it('should update and persist settings', () => {
    service.updateSettings({ volume: 0.5 });
    expect(service.settings().volume).toBe(0.5);
  });

  it('should set adhan voice', () => {
    service.setAdhanVoice('alaqsa');
    expect(service.settings().adhanVoice).toBe('alaqsa');
    expect(service.currentVoice().id).toBe('alaqsa');
  });

  it('should toggle prayer alerts', () => {
    service.togglePrayer('fajr', false);
    expect(service.settings().fajr).toBe(false);

    service.toggleMaster(false);
    expect(service.settings().enabled).toBe(false);

    service.toggleAutoAdhan(false);
    expect(service.settings().autoPlayAdhan).toBe(false);

    service.toggleModalAutoPopup(false);
    expect(service.settings().autoPlayAdhanModal).toBe(false);

    service.setDefaultMuted(false);
    expect(service.settings().defaultMuted).toBe(false);

    service.setVolume(0.4);
    expect(service.settings().volume).toBe(0.4);
  });

  it('should open and close in-app Adhan modal', () => {
    expect(service.activeAdhanModal()).toBeNull();

    service.openAdhanModal(mockPrayer);
    const modalState = service.activeAdhanModal();
    expect(modalState).not.toBeNull();
    expect(modalState?.prayer.key).toBe('asr');

    service.closeAdhanModal();
    expect(service.activeAdhanModal()).toBeNull();
  });

  it('should trigger test alert', () => {
    service.triggerTestAlert('asr');
    const modalState = service.activeAdhanModal();
    expect(modalState).not.toBeNull();
    expect(modalState?.isTest).toBe(true);
  });

  it('should snooze and close modal immediately', () => {
    service.openAdhanModal(mockPrayer);
    expect(service.activeAdhanModal()).not.toBeNull();

    service.snooze(10);
    expect(service.activeAdhanModal()).toBeNull();
  });
});

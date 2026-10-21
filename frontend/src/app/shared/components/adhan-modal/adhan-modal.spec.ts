import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdhanModalComponent } from './adhan-modal';
import { PrayerNotificationService } from '../../../core/services/prayer-notification';
import { PrayerTimesService } from '../../../core/services/prayer';
import { StorageService } from '../../../core/services/storage';
import { LanguageService } from '../../../core/services/language';
import { LocationService } from '../../../core/services/location';
import { LoggerService } from '../../../core/services/logger';
import { AdhanModalState } from '../../../core/models/prayer-notification';

describe('AdhanModalComponent', () => {
  let component: AdhanModalComponent;
  let fixture: ComponentFixture<AdhanModalComponent>;
  let notificationService: PrayerNotificationService;
  let storage: StorageService;

  const mockModalState: AdhanModalState = {
    prayer: {
      key: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      banglaName: 'আসর',
      time: '15:54',
      at: '2026-10-18T15:54:00.000Z',
      isPrayer: true,
    },
    time12h: '03:54 PM',
    time12hBn: '০৩:৫৪ PM',
    locationName: 'Dhaka',
    isTest: false,
  };

  let originalAudio: typeof window.Audio;

  beforeEach(async () => {
    originalAudio = window.Audio;
    // Mock Audio constructor
    class MockAudio {
      muted = true;
      volume = 0.8;
      currentTime = 0;
      duration = 180;
      preload = 'auto';
      src = '';
      listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

      addEventListener(event: string, cb: (...args: unknown[]) => void) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(cb);
      }
      removeEventListener() {}
      dispatchEvent() {
        return true;
      }
      play() {
        return Promise.resolve();
      }
      pause() {}
      load() {}
      removeAttribute() {}
    }
    (window as unknown as { Audio: typeof MockAudio }).Audio = MockAudio;

    await TestBed.configureTestingModule({
      imports: [AdhanModalComponent],
      providers: [
        PrayerNotificationService,
        PrayerTimesService,
        StorageService,
        LanguageService,
        LocationService,
        LoggerService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    storage = TestBed.inject(StorageService);
    storage.clearAll();

    notificationService = TestBed.inject(PrayerNotificationService);
    notificationService.openAdhanModal(mockModalState.prayer, false, true);

    fixture = TestBed.createComponent(AdhanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
    storage.clearAll();
    window.Audio = originalAudio;
  });

  it('should create and render prayer details', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prayer-arabic')?.textContent).toContain('العصر');
    expect(compiled.querySelector('.prayer-title')?.textContent).toContain('আসর');
  });

  it('should start muted when startMuted is specified', () => {
    expect(component['isMuted']()).toBe(true);
  });

  it('should unmute adhan when unmute button is clicked', () => {
    component.unmuteAdhan();
    expect(component['isMuted']()).toBe(false);
  });

  it('should seek audio position', () => {
    const event = { target: { value: '45' } } as unknown as Event;
    component.onSeek(event);
    expect(component['currentTime']()).toBe(45);
  });

  it('should toggle play and pause', () => {
    component.togglePlay();
    expect(component).toBeTruthy();
  });

  it('should handle voice selection', () => {
    const event = { target: { value: 'alaqsa' } } as unknown as Event;
    component.onVoiceSelect(event);
    expect(component['currentVoiceId']()).toBe('alaqsa');
    expect(notificationService.settings().adhanVoice).toBe('alaqsa');
  });

  it('should handle volume change', () => {
    const event = { target: { value: '0.6' } } as unknown as Event;
    component.onVolumeChange(event);
    expect(component['volume']()).toBe(0.6);
    expect(notificationService.settings().volume).toBe(0.6);
  });

  it('should snooze modal', () => {
    component.snooze();
    expect(notificationService.activeAdhanModal()).toBeNull();
  });

  it('should dismiss modal', () => {
    component.dismiss();
    expect(notificationService.activeAdhanModal()).toBeNull();
  });

  it('should toggle next prayer alert', async () => {
    await component.toggleNextPrayerAlert();
    expect(component.isNextAdhanActive()).toBeDefined();
  });
});

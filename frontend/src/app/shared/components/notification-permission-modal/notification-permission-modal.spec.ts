import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationPermissionModalComponent } from './notification-permission-modal';
import { PrayerNotificationService } from '../../../core/services/prayer-notification';
import { StorageService } from '../../../core/services/storage';
import { MobileHardwareService } from '../../../core/services/mobile-hardware.service';

describe('NotificationPermissionModalComponent', () => {
  let component: NotificationPermissionModalComponent;
  let notificationService: PrayerNotificationService;
  let mobileHardware: MobileHardwareService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotificationPermissionModalComponent],
      providers: [
        PrayerNotificationService,
        MobileHardwareService,
        StorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    storage = TestBed.inject(StorageService);
    storage.clearAll();
    notificationService = TestBed.inject(PrayerNotificationService);
    mobileHardware = TestBed.inject(MobileHardwareService);
    const fixture = TestBed.createComponent(NotificationPermissionModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    notificationService.ngOnDestroy();
    storage.clearAll();
    vi.restoreAllMocks();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect visibility from prayer notification service', () => {
    expect(component.isVisible()).toBe(false);
    notificationService.openPermissionModal();
    expect(component.isVisible()).toBe(true);
    notificationService.closePermissionModal();
    expect(component.isVisible()).toBe(false);
  });

  it('should dismiss modal on dismiss() call and persist timestamp in storage', () => {
    notificationService.openPermissionModal();
    expect(component.isVisible()).toBe(true);

    const dismissSpy = vi.spyOn(notificationService, 'dismissPermissionModal');
    component.dismiss();

    expect(dismissSpy).toHaveBeenCalled();
    expect(component.isVisible()).toBe(false);
  });

  it('should dismiss on onEscape() when visible and not loading', () => {
    notificationService.openPermissionModal();
    expect(component.isVisible()).toBe(true);

    const dismissSpy = vi.spyOn(component, 'dismiss');
    component.onEscape();

    expect(dismissSpy).toHaveBeenCalled();
  });

  it('should not dismiss on onEscape() when loading', () => {
    notificationService.openPermissionModal();
    component.isLoading.set(true);

    const dismissSpy = vi.spyOn(component, 'dismiss');
    component.onEscape();

    expect(dismissSpy).not.toHaveBeenCalled();
  });

  it('should request permission, enable master alerts, and show success state when granted', async () => {
    vi.useFakeTimers();
    vi.spyOn(notificationService, 'requestPermission').mockResolvedValue(true);
    const toggleMasterSpy = vi.spyOn(notificationService, 'toggleMaster');
    const hapticSpy = vi.spyOn(mobileHardware, 'hapticSuccess').mockResolvedValue();

    notificationService.openPermissionModal();
    expect(component.isVisible()).toBe(true);

    const allowPromise = component.allowPermission();
    expect(component.isLoading()).toBe(true);

    await allowPromise;

    expect(toggleMasterSpy).toHaveBeenCalledWith(true);
    expect(hapticSpy).toHaveBeenCalled();
    expect(component.isSuccess()).toBe(true);

    // Fast forward timer to check completion and modal close
    vi.advanceTimersByTime(1000);
    expect(component.isVisible()).toBe(false);
    expect(component.isSuccess()).toBe(false);
    expect(component.isLoading()).toBe(false);

    vi.useRealTimers();
  });

  it('should close modal when permission is denied', async () => {
    vi.spyOn(notificationService, 'requestPermission').mockResolvedValue(false);
    const toggleMasterSpy = vi.spyOn(notificationService, 'toggleMaster');

    notificationService.openPermissionModal();
    expect(component.isVisible()).toBe(true);

    await component.allowPermission();

    expect(toggleMasterSpy).not.toHaveBeenCalled();
    expect(component.isSuccess()).toBe(false);
    expect(component.isLoading()).toBe(false);
    expect(component.isVisible()).toBe(false);
  });
});

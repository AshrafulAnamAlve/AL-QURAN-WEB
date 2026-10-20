import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  ADHAN_VOICE_OPTIONS,
  AdhanModalState,
  AdhanVoiceId,
  AdhanVoiceOption,
  CorePrayerAlertKey,
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  PrayerNotificationSettings,
} from '../models/prayer-notification';
import { PrayerTime } from '../models/prayer';
import { LanguageService } from './language';
import { LocationService } from './location';
import { LoggerService } from './logger';
import { PrayerTimesService } from './prayer';
import { STORAGE_KEYS, StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class PrayerNotificationService implements OnDestroy {
  private readonly storage = inject(StorageService);
  private readonly prayerTimes = inject(PrayerTimesService);
  private readonly locationService = inject(LocationService);
  private readonly language = inject(LanguageService);
  private readonly logger = inject(LoggerService);

  private checkIntervalId: ReturnType<typeof setInterval> | null = null;
  private snoozeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Stored state
  private readonly _settings = signal<PrayerNotificationSettings>(
    this.storage.read<PrayerNotificationSettings>(
      STORAGE_KEYS.prayerNotifications,
      DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
    ),
  );
  readonly settings = this._settings.asReadonly();

  // Permission state
  private readonly _permission = signal<NotificationPermission>(this.detectPermission());
  readonly permission = this._permission.asReadonly();
  readonly isPermissionGranted = computed(() => this._permission() === 'granted');
  readonly isPermissionDenied = computed(() => this._permission() === 'denied');

  // In-App Adhan Modal State
  private readonly _activeAdhanModal = signal<AdhanModalState | null>(null);
  readonly activeAdhanModal = this._activeAdhanModal.asReadonly();

  // Audio configuration & voices
  readonly voices = ADHAN_VOICE_OPTIONS;
  readonly currentVoice = computed<AdhanVoiceOption>(() => {
    const voiceId = this._settings().adhanVoice;
    return this.voices.find((v) => v.id === voiceId) ?? this.voices[0];
  });

  // Track already notified prayers for current day (key: "YYYY-MM-DD:prayerKey")
  private readonly notifiedPrayers = new Set<string>();

  constructor() {
    this.startScheduler();
  }

  ngOnDestroy(): void {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    if (this.snoozeTimeoutId !== null) {
      clearTimeout(this.snoozeTimeoutId);
      this.snoozeTimeoutId = null;
    }
  }

  private detectPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * Requests native desktop notification permission from user.
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this._permission.set(perm);
      return perm === 'granted';
    } catch (err) {
      this.logger.warn('Error requesting notification permission', err);
      return false;
    }
  }

  /**
   * Updates notification settings and persists to storage.
   */
  updateSettings(partial: Partial<PrayerNotificationSettings>): void {
    const updated: PrayerNotificationSettings = {
      ...this._settings(),
      ...partial,
    };
    this._settings.set(updated);
    this.storage.write(STORAGE_KEYS.prayerNotifications, updated);
  }

  setAdhanVoice(voice: AdhanVoiceId): void {
    this.updateSettings({ adhanVoice: voice });
  }

  togglePrayer(key: CorePrayerAlertKey, enabled: boolean): void {
    this.updateSettings({ [key]: enabled });
  }

  toggleMaster(enabled: boolean): void {
    this.updateSettings({ enabled });
  }

  /**
   * Returns true if prayer alerts are enabled globally AND for this specific prayer.
   */
  isPrayerAlertActive(key: string): boolean {
    const s = this._settings();
    if (!s.enabled) return false;
    const pKey = key.toLowerCase() as CorePrayerAlertKey;
    return Boolean(s[pKey]);
  }

  /**
   * Toggles master prayer alerts. If turning on and permission has not been requested,
   * prompts user for notification permission.
   */
  async toggleMasterAlerts(): Promise<boolean> {
    const nextState = !this._settings().enabled;
    this.toggleMaster(nextState);
    if (nextState && this._permission() !== 'granted') {
      await this.requestPermission();
    }
    return nextState;
  }

  toggleModalAutoPopup(enabled: boolean): void {
    this.updateSettings({ autoPlayAdhanModal: enabled });
  }

  setDefaultMuted(defaultMuted: boolean): void {
    this.updateSettings({ defaultMuted });
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.updateSettings({ volume: clamped });
  }

  /**
   * Opens the in-app Adhan modal.
   * @param startMuted If undefined, falls back to settings().defaultMuted
   * @param isManual True if manually triggered by user preview
   */
  openAdhanModal(
    prayer: PrayerTime,
    isTest = false,
    startMuted?: boolean,
    isManual = false,
  ): void {
    const loc = this.locationService.location();
    const city = loc.city || loc.displayName || (this.language.isBn() ? 'আপনার এলাকা' : 'Your Location');
    const time12h = this.prayerTimes.format12h(prayer.time, false);
    const time12hBn = this.prayerTimes.format12h(prayer.time, true);

    this._activeAdhanModal.set({
      prayer,
      time12h,
      time12hBn,
      locationName: city,
      isTest,
      isManual,
      startMuted,
    });
  }

  /**
   * Closes the in-app Adhan modal.
   */
  closeAdhanModal(): void {
    this._activeAdhanModal.set(null);
  }

  /**
   * Snoozes the current alert for specified minutes (default: 10m).
   */
  snooze(minutes = 10): void {
    const current = this._activeAdhanModal();
    this.closeAdhanModal();

    if (!current) return;

    if (this.snoozeTimeoutId !== null) {
      clearTimeout(this.snoozeTimeoutId);
    }

    this.snoozeTimeoutId = setTimeout(() => {
      this.sendDesktopNotification(current.prayer);
      if (this._settings().autoPlayAdhanModal) {
        this.openAdhanModal(current.prayer);
      }
    }, minutes * 60 * 1000);
  }

  /**
   * Sends desktop notification with prayer details and audio/focus actions.
   */
  sendDesktopNotification(prayer: PrayerTime): Notification | null {
    if (typeof window !== 'undefined' && window.desktopApi?.isDesktop) {
      const loc = this.locationService.location();
      const city = loc.city || loc.displayName || (this.language.isBn() ? 'আপনার এলাকা' : 'your area');
      const time12h = this.prayerTimes.format12h(prayer.time, false);
      const time12hBn = this.prayerTimes.format12h(prayer.time, true);

      const isBn = this.language.isBn();
      const title = isBn
        ? `🕌 ${prayer.banglaName} নামাজের সময় হয়েছে`
        : `🕌 It is now time for ${prayer.name} prayer`;

      const body = isBn
        ? `${city}-এ এখন ${prayer.banglaName} নামাজের সময় (${time12hBn})।`
        : `It is now time for ${prayer.name} prayer (${time12h}) in ${city}.`;

      window.desktopApi.notify(title, body);
      return null;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    if (Notification.permission !== 'granted' || !this._settings().enabled) {
      return null;
    }

    const loc = this.locationService.location();
    const city = loc.city || loc.displayName || (this.language.isBn() ? 'আপনার এলাকা' : 'your area');
    const time12h = this.prayerTimes.format12h(prayer.time, false);
    const time12hBn = this.prayerTimes.format12h(prayer.time, true);

    const isBn = this.language.isBn();
    const title = isBn
      ? `🕌 ${prayer.banglaName} নামাজের সময় হয়েছে`
      : `🕌 It is now time for ${prayer.name} prayer`;

    const body = isBn
      ? `${city}-এ এখন ${prayer.banglaName} নামাজের সময় (${time12hBn})। আযান শুনতে ট্যাপ করুন।`
      : `It is now time for ${prayer.name} prayer (${time12h}) in ${city}. Tap to hear Adhan.`;

    const options: NotificationOptions = {
      body,
      icon: 'icons/icon-192x192.png',
      badge: 'icons/icon-192x192.png',
      tag: `prayer-${prayer.key.toLowerCase()}`,
      requireInteraction: false,
      data: {
        url: window.location.origin + window.location.pathname + '#/prayer',
      },
    };

    // Mobile Android Chrome requires ServiceWorkerRegistration.showNotification()
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, options))
        .catch((swErr) => {
          this.logger.warn('ServiceWorker showNotification failed, trying fallback', swErr);
          this.emitDesktopNotificationFallback(title, options, prayer);
        });
      return null;
    }

    return this.emitDesktopNotificationFallback(title, options, prayer);
  }

  private emitDesktopNotificationFallback(
    title: string,
    options: NotificationOptions,
    prayer: PrayerTime,
  ): Notification | null {
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        if (typeof window !== 'undefined') {
          window.focus();
        }
        this.openAdhanModal(prayer);
        notification.close();
      };
      return notification;
    } catch (err) {
      this.logger.warn('Failed to emit Notification fallback', err);
      return null;
    }
  }

  /**
   * Triggers a test alert immediately with desktop notification and in-app modal.
   */
  triggerTestAlert(prayerKey = 'asr'): void {
    const table = this.prayerTimes.timetable();
    const target =
      table?.times.find((t) => t.key.toLowerCase() === prayerKey.toLowerCase()) ?? {
        key: 'asr',
        name: 'Asr',
        arabicName: 'العصر',
        banglaName: 'আসর',
        time: '15:54',
        at: new Date().toISOString(),
        isPrayer: true,
      };

    this.sendDesktopNotification(target);
    this.openAdhanModal(target, true);
  }

  /**
   * Periodic scheduler checking every 5 seconds for prayer transitions.
   */
  private startScheduler(): void {
    if (typeof window === 'undefined') return;

    this.checkIntervalId = setInterval(() => {
      this.checkPrayerTimes();
    }, 5000);
  }

  private checkPrayerTimes(): void {
    const settings = this._settings();
    if (!settings.enabled) return;

    const table = this.prayerTimes.timetable();
    if (!table || table.times.length === 0) return;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMs = now.getTime();

    for (const prayer of table.times) {
      if (!prayer.at) continue;

      const pKey = prayer.key.toLowerCase() as CorePrayerAlertKey;
      // Check if this prayer alert is enabled
      const isEnabled = settings[pKey] ?? false;
      if (!isEnabled) continue;

      const prayerMs = new Date(prayer.at).getTime();
      const diffMs = currentMs - prayerMs;

      // Check if we are within the minute of the prayer time (0 to 60 seconds)
      const isDue = diffMs >= 0 && diffMs < 60000;
      const dedupeKey = `${todayStr}:${pKey}`;

      if (isDue && !this.notifiedPrayers.has(dedupeKey)) {
        this.notifiedPrayers.add(dedupeKey);
        this.logger.info(`Prayer alert triggered for: ${pKey}`);

        // 1. Emit native desktop/PWA notification
        this.sendDesktopNotification(prayer);

        // 2. Open in-app Adhan modal if auto-popup is active
        if (settings.autoPlayAdhanModal) {
          this.openAdhanModal(prayer);
        }
      }
    }
  }
}

import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import {
  ADHAN_VOICE_OPTIONS,
  AdhanModalState,
  AdhanVoiceId,
  AdhanVoiceOption,
  CorePrayerAlertKey,
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  PrayerNotificationSettings,
} from '../models/prayer-notification';
import { PrayerDay, PrayerTime } from '../models/prayer';
import { DesktopService } from './desktop';
import { LanguageService } from './language';
import { LocationService } from './location';
import { LoggerService } from './logger';
import { MobileHardwareService, PrayerAlarmItem } from './mobile-hardware.service';
import { PrayerTimesService } from './prayer';
import { STORAGE_KEYS, StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class PrayerNotificationService implements OnDestroy {
  private readonly storage = inject(StorageService);
  private readonly prayerTimes = inject(PrayerTimesService);
  private readonly locationService = inject(LocationService);
  private readonly language = inject(LanguageService);
  private readonly logger = inject(LoggerService);
  private readonly desktopService = inject(DesktopService);
  private readonly mobileHardware = inject(MobileHardwareService);

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

  // Active Background / In-App Audio Engine
  private audio: HTMLAudioElement | null = null;
  private readonly _isAdhanPlaying = signal<boolean>(false);
  readonly isAdhanPlaying = this._isAdhanPlaying.asReadonly();

  private readonly _adhanCurrentTime = signal<number>(0);
  readonly adhanCurrentTime = this._adhanCurrentTime.asReadonly();

  private readonly _adhanDuration = signal<number>(0);
  readonly adhanDuration = this._adhanDuration.asReadonly();

  private readonly _adhanAudioError = signal<string | null>(null);
  readonly adhanAudioError = this._adhanAudioError.asReadonly();

  private readonly _currentAdhanPrayer = signal<PrayerTime | null>(null);
  readonly currentAdhanPrayer = this._currentAdhanPrayer.asReadonly();

  // Permission state
  private readonly _nativePermissionGranted = signal<boolean>(false);
  private readonly _permission = signal<NotificationPermission>(this.detectPermission());
  readonly permission = this._permission.asReadonly();
  readonly isPermissionGranted = computed(
    () =>
      this.desktopService.isDesktop() ||
      (this.mobileHardware.isNativeMobile() ? this._nativePermissionGranted() : this._permission() === 'granted'),
  );
  readonly isPermissionDenied = computed(
    () =>
      !this.desktopService.isDesktop() &&
      (this.mobileHardware.isNativeMobile()
        ? !this._nativePermissionGranted() && this._permission() === 'denied'
        : this._permission() === 'denied'),
  );

  // In-App Permission Prompt Modal State
  private readonly _showPermissionModal = signal<boolean>(false);
  readonly showPermissionModal = this._showPermissionModal.asReadonly();

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
    this.initDesktopIntegration();
    this.initMobileIntegration();

    // Check if permission prompt modal should be shown on startup (mobile & web)
    if (!this.desktopService.isDesktop()) {
      if (!this.mobileHardware.isNativeMobile() && this._permission() !== 'granted') {
        this.checkPermissionPromptOnStartup();
      }
    }

    // Automatically synchronize native mobile alarms whenever prayer times or settings change
    effect(() => {
      const table = this.prayerTimes.timetable();
      const upcoming = this.prayerTimes.upcomingDays();
      const settings = this._settings();
      if (table && this.mobileHardware.isNativeMobile()) {
        this.rescheduleMobileAlarms();
      }
    });
  }

  private initMobileIntegration(): void {
    if (!this.mobileHardware.isNativeMobile()) return;

    void this.mobileHardware.initNotificationChannel();
    void this.mobileHardware.checkNotificationPermission().then((granted) => {
      this._nativePermissionGranted.set(granted);
      if (granted) {
        this._permission.set('granted');
        this.rescheduleMobileAlarms();
      } else {
        this.checkPermissionPromptOnStartup();
      }
    });

    this.mobileHardware.initNotificationListener((waqtName) => {
      const table = this.prayerTimes.timetable();
      const target = waqtName
        ? table?.times.find((t) => t.key.toLowerCase() === waqtName.toLowerCase())
        : null;
      const prayerToOpen = target || this._currentAdhanPrayer() || this.prayerTimes.nextPrayer()?.prayer;
      if (prayerToOpen) {
        this.openAdhanModal(prayerToOpen);
      }
    });
  }

  /**
   * Prompts user with explanation modal on startup if permission is not yet granted
   * and user hasn't dismissed the prompt within the last 3 days.
   */
  checkPermissionPromptOnStartup(): void {
    if (this.desktopService.isDesktop()) return;
    const dismissedAt = this.storage.read<number | null>(
      STORAGE_KEYS.notificationPromptDismissed,
      null,
    );
    const now = Date.now();
    // 3 days threshold: 3 * 24 * 60 * 60 * 1000 = 259,200,000 ms
    if (!dismissedAt || now - dismissedAt > 259200000) {
      setTimeout(() => {
        if (!this.isPermissionGranted()) {
          this.openPermissionModal();
        }
      }, 1800);
    }
  }

  openPermissionModal(): void {
    this._showPermissionModal.set(true);
  }

  closePermissionModal(): void {
    this._showPermissionModal.set(false);
  }

  dismissPermissionModal(): void {
    this._showPermissionModal.set(false);
    this.storage.write(STORAGE_KEYS.notificationPromptDismissed, Date.now());
  }

  private initDesktopIntegration(): void {
    if (!this.desktopService.isDesktop()) return;

    // Sync Adhan mute & prayer alert states between desktop tray and app settings
    this.desktopService.setTrayAdhanMuted(this._settings().defaultMuted);
    this.desktopService.setPrayerAlertsEnabled(this._settings().enabled);
    this.desktopService.setAutoAdhanEnabled(this._settings().autoPlayAdhan);

    this.desktopService.onToggleAdhanMute((muted) => {
      this.setDefaultMuted(muted);
    });

    this.desktopService.onTogglePrayerAlerts((enabled) => {
      this.toggleMaster(enabled);
    });

    this.desktopService.onToggleAutoAdhan((enabled) => {
      this.toggleAutoAdhan(enabled);
    });

    this.desktopService.onStopAdhan(() => {
      this.stopAdhan();
    });

    this.desktopService.onNotificationClick(() => {
      const active = this._currentAdhanPrayer() || this.prayerTimes.nextPrayer()?.prayer;
      if (active) {
        this.openAdhanModal(active);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAdhan();
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
   * Requests native mobile / desktop notification permission from user.
   */
  async requestPermission(): Promise<boolean> {
    if (this.mobileHardware.isNativeMobile()) {
      const granted = await this.mobileHardware.requestNotificationPermission();
      this._nativePermissionGranted.set(granted);
      this._permission.set(granted ? 'granted' : 'denied');
      if (granted) {
        this.rescheduleMobileAlarms();
      }
      return granted;
    }

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

    if (partial.defaultMuted !== undefined) {
      if (this.audio) {
        this.audio.muted = partial.defaultMuted;
      }
      if (this.desktopService.isDesktop()) {
        this.desktopService.setTrayAdhanMuted(partial.defaultMuted);
      }
    }

    if (partial.volume !== undefined && this.audio) {
      this.audio.volume = partial.volume;
    }

    if (partial.enabled !== undefined && this.desktopService.isDesktop()) {
      this.desktopService.setPrayerAlertsEnabled(partial.enabled);
    }

    if (partial.autoPlayAdhan !== undefined && this.desktopService.isDesktop()) {
      this.desktopService.setAutoAdhanEnabled(partial.autoPlayAdhan);
    }

    if (this.mobileHardware.isNativeMobile()) {
      this.rescheduleMobileAlarms();
    }
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

  toggleAutoAdhan(enabled?: boolean): void {
    const next = enabled !== undefined ? enabled : !this._settings().autoPlayAdhan;
    this.updateSettings({ autoPlayAdhan: next });
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
   * Toggles master prayer alerts. If turning on and permission has not been granted,
   * opens the explanation modal for user to grant permission.
   */
  async toggleMasterAlerts(): Promise<boolean> {
    const nextState = !this._settings().enabled;
    if (nextState && !this.isPermissionGranted()) {
      this.openPermissionModal();
      return false;
    }
    this.toggleMaster(nextState);
    if (this.mobileHardware.isNativeMobile()) {
      this.rescheduleMobileAlarms();
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
   * Sends desktop or mobile native notification with prayer details and audio/focus actions.
   */
  sendDesktopNotification(prayer: PrayerTime): Notification | null {
    if (this.desktopService.isDesktop()) {
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

      this.desktopService.sendNotification(title, body);
      return null;
    }

    if (this.mobileHardware.isNativeMobile()) {
      if (!this._settings().enabled) return null;
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

      void this.mobileHardware.sendImmediateNotification(title, body, {
        waqtName: prayer.key,
        timeStr: prayer.at,
      });
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
   * Plays Adhan audio recitation. Runs reliably even if the app window is hidden or minimized to tray.
   */
  playAdhan(prayer: PrayerTime, voiceId?: AdhanVoiceId): void {
    if (typeof window === 'undefined') return;

    this.stopAdhan();
    this._adhanAudioError.set(null);
    this._currentAdhanPrayer.set(prayer);

    const voice = (voiceId ? this.voices.find((v) => v.id === voiceId) : null) ?? this.currentVoice();
    const url = voice.audioUrl;

    try {
      this.audio = new Audio(url);
      this.audio.preload = 'auto';
      this.audio.volume = this._settings().volume;
      this.audio.muted = this._settings().defaultMuted;

      this.audio.addEventListener('play', () => {
        this._isAdhanPlaying.set(true);
        this.desktopService.notifyAdhanPlaying(true);
      });

      this.audio.addEventListener('pause', () => {
        this._isAdhanPlaying.set(false);
        this.desktopService.notifyAdhanPlaying(false);
      });

      this.audio.addEventListener('ended', () => {
        this._isAdhanPlaying.set(false);
        this._adhanCurrentTime.set(0);
        this.desktopService.notifyAdhanPlaying(false);
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          this._adhanCurrentTime.set(this.audio.currentTime);
          this._adhanDuration.set(this.audio.duration || 0);
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          this._adhanDuration.set(this.audio.duration || 0);
        }
      });

      this.audio.addEventListener('error', () => {
        this._adhanAudioError.set('Could not load audio stream');
        this._isAdhanPlaying.set(false);
        this.desktopService.notifyAdhanPlaying(false);
      });

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          this.logger.warn('Audio play was interrupted or restricted', err);
          this._isAdhanPlaying.set(false);
          this.desktopService.notifyAdhanPlaying(false);
        });
      }
    } catch (err) {
      this.logger.warn('Failed to initialize Audio', err);
      this._adhanAudioError.set('Audio playback failed');
    }
  }

  /**
   * Stops Adhan audio playback completely.
   */
  stopAdhan(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute('src');
        this.audio.load();
      } catch {
        // Ignored
      }
      this.audio = null;
    }
    this._isAdhanPlaying.set(false);
    this._adhanCurrentTime.set(0);
    this.desktopService.notifyAdhanPlaying(false);
  }

  /**
   * Toggles play/pause for active Adhan playback.
   */
  toggleAdhanPlayback(): void {
    if (!this.audio) {
      const p = this._currentAdhanPrayer() || this.prayerTimes.nextPrayer()?.prayer;
      if (p) {
        this.playAdhan(p);
      }
      return;
    }
    if (this._isAdhanPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }

  /**
   * Toggles mute/unmute for Adhan audio.
   */
  toggleAdhanMute(): void {
    const nextMuted = !this._settings().defaultMuted;
    this.setDefaultMuted(nextMuted);
    if (this.audio) {
      this.audio.muted = nextMuted;
    }
  }

  /**
   * Triggers a test alert immediately with native notification, auto Adhan audio, and in-app modal.
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

    const isBn = this.language.isBn();
    const title = isBn
      ? `🕌 পরীক্ষা: ${target.banglaName} নামাজের আযান`
      : `🕌 Test Alert: ${target.name} Adhan Notification`;
    const body = isBn
      ? `আল-কুরআন আযান নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে।`
      : `Al-Quran Adhan notification is successfully active.`;

    if (this.mobileHardware.isNativeMobile()) {
      void this.mobileHardware.sendImmediateNotification(title, body, {
        waqtName: target.key,
        isTest: true,
      });
    } else if (this._settings().enabled) {
      this.sendDesktopNotification(target);
    }

    if (this._settings().autoPlayAdhan && !this._settings().defaultMuted) {
      this.playAdhan(target);
    }
    this.openAdhanModal(target, true);
  }

  /**
   * Reschedules exact prayer alarms in Android AlarmManager for up to 7 upcoming days.
   * Runs in the background and wakes up the device with Adhan sound even if the app is killed.
   */
  rescheduleMobileAlarms(): void {
    if (!this.mobileHardware.isNativeMobile()) return;

    const settings = this._settings();
    // If both alerts and auto-play Adhan are disabled, clear all alarms
    if (!settings.enabled && !settings.autoPlayAdhan) {
      void this.mobileHardware.cancelAllPrayerAlarms();
      return;
    }

    const loc = this.locationService.location();
    const city = loc.city || loc.displayName || (this.language.isBn() ? 'আপনার এলাকা' : 'your area');

    const todayTable = this.prayerTimes.timetable();
    const upcoming = this.prayerTimes.upcomingDays();

    const daysMap = new Map<string, PrayerDay>();
    if (todayTable) {
      daysMap.set(todayTable.date, todayTable);
    }
    for (const d of upcoming) {
      if (!daysMap.has(d.date)) {
        daysMap.set(d.date, d);
      }
    }

    const sortedDays = Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const targetDays = sortedDays.slice(0, 7);

    const alarms: PrayerAlarmItem[] = [];
    const nowMs = Date.now();

    for (let dayIdx = 0; dayIdx < targetDays.length; dayIdx++) {
      const day = targetDays[dayIdx];
      if (!day.times) continue;

      const dayNumber = parseInt(day.date.slice(8, 10), 10) || (dayIdx + 1);

      day.times
        .filter((t) => t.isPrayer && t.at)
        .forEach((t, prayerIdx) => {
          const pKey = t.key.toLowerCase() as CorePrayerAlertKey;
          if (settings[pKey] === false) return;

          const prayerDate = new Date(t.at!);
          if (prayerDate.getTime() <= nowMs) return; // In the past

          // Deterministic unique 32-bit ID
          const id = dayNumber * 10 + (prayerIdx % 10);

          const time12h = this.prayerTimes.format12h(t.time, false);
          const time12hBn = this.prayerTimes.format12h(t.time, true);

          alarms.push({
            id,
            name: t.key,
            time: prayerDate,
            titleBn: `🕌 ${t.banglaName} নামাজের ওয়াক্ত হয়েছে`,
            titleEn: `🕌 It is now time for ${t.name} prayer`,
            bodyBn: `${city}-এ এখন ${t.banglaName} নামাজের সময় (${time12hBn})। আল্লাহু আকবার। আযান শুনতে ট্যাপ করুন।`,
            bodyEn: `It is now time for ${t.name} prayer (${time12h}) in ${city}. Allahu Akbar. Tap to listen.`,
          });
        });
    }

    void this.mobileHardware.schedulePrayerAlarms(alarms);
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
    // Proceed if either notification alerts OR auto-play Adhan audio is enabled
    if (!settings.enabled && !settings.autoPlayAdhan) return;

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

        // 1. Emit native desktop/PWA notification (if alerts are enabled)
        if (settings.enabled) {
          this.sendDesktopNotification(prayer);
        }

        // 2. Automatically play Azan audio (even when app window is closed / in system tray)
        if (settings.autoPlayAdhan && !settings.defaultMuted) {
          this.playAdhan(prayer);
        }

        // 3. Open in-app Adhan modal if auto-popup is active
        if (settings.autoPlayAdhanModal) {
          this.openAdhanModal(prayer);
        }
      }
    }
  }
}

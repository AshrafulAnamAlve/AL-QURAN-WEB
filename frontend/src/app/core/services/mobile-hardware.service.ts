import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export interface MobileMediaSessionMetadata {
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  duration?: number;
}

export interface PrayerAlarmItem {
  id: number;
  name: string;
  time: Date;
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
}

/**
 * MobileHardwareService provides a unified bridge to native mobile capabilities
 * including Capacitor native hardware plugins (Haptics, Compass, Geolocation,
 * Local Notifications / Alarms) and web standard APIs (MediaSession, Geolocation).
 */
@Injectable({ providedIn: 'root' })
export class MobileHardwareService {
  public static readonly ADHAN_CHANNEL_ID = 'adhan_prayer_channel';

  /** True when running inside Capacitor Android or iOS shell */
  readonly isNativeMobile = signal<boolean>(this.checkNativeMobile());

  /** True on Android platform */
  readonly isAndroid = signal<boolean>(this.checkAndroid());

  /** True on iOS platform */
  readonly isIos = signal<boolean>(this.checkIos());

  private channelInitialized = false;

  constructor() {
    this.initPlatformFlags();
    if (this.isNativeMobile()) {
      void this.initNotificationChannel();
    }
  }

  private checkNativeMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform();
  }

  private checkAndroid(): boolean {
    if (typeof navigator === 'undefined') return false;
    return Capacitor.getPlatform() === 'android';
  }

  private checkIos(): boolean {
    if (typeof navigator === 'undefined') return false;
    return Capacitor.getPlatform() === 'ios';
  }

  private initPlatformFlags(): void {
    if (typeof window !== 'undefined') {
      const update = () => {
        this.isNativeMobile.set(this.checkNativeMobile());
        this.isAndroid.set(this.checkAndroid());
        this.isIos.set(this.checkIos());
      };
      update();
      if (typeof document !== 'undefined' && document.readyState !== 'complete') {
        window.addEventListener('load', update, { once: true });
      }
    }
  }

  // =========================================================================
  // 1. TACTILE HAPTIC FEEDBACK (Tasbih, Qibla Kaaba Lock, Goals)
  // =========================================================================

  /**
   * Subtle click for Tasbih counters and toggle buttons
   */
  async hapticTap(): Promise<void> {
    try {
      if (this.isNativeMobile()) {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
    } catch {
      // Fallback below
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Medium feedback for completing a set of 33, 100, or a Dhikr target
   */
  async hapticSuccess(): Promise<void> {
    try {
      if (this.isNativeMobile()) {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      }
    } catch {
      // Fallback below
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 100]);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Strong distinct pulse when compass points directly (within ±3°) to Holy Kaaba
   */
  async hapticKaabaLock(): Promise<void> {
    try {
      if (this.isNativeMobile()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        return;
      }
    } catch {
      // Fallback below
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 40, 50]);
      } catch {
        // Ignore
      }
    }
  }

  // =========================================================================
  // 2. MAP NAVIGATION (1-Tap Google Maps / Apple Maps Navigation)
  // =========================================================================

  /**
   * Launches native turn-by-turn navigation app to the selected Mosque
   */
  openNativeMapDirections(latitude: number, longitude: number, name: string): void {
    if (typeof window === 'undefined') return;

    const encodedName = encodeURIComponent(name);

    if (this.isIos()) {
      // Apple Maps navigation deep link
      const appleUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedName}`;
      window.location.href = appleUrl;
      return;
    }

    if (this.isAndroid()) {
      // Android Intent: open in Google Maps directly
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedName}`;

      const link = document.createElement('a');
      link.href = geoUrl;
      link.target = '_system';
      link.click();

      // Fallback timeout to web if geo protocol is not registered
      setTimeout(() => {
        window.open(webUrl, '_blank', 'noopener');
      }, 500);
      return;
    }

    // Default Web Browser / Desktop
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // =========================================================================
  // 3. BACKGROUND AUDIO & LOCK-SCREEN CONTROLS (MediaSession API)
  // =========================================================================

  /**
   * Configures lock screen and Bluetooth media controls for recitation
   */
  updateMediaSession(
    metadata: MobileMediaSessionMetadata,
    handlers?: {
      onPlay?: () => void;
      onPause?: () => void;
      onNext?: () => void;
      onPrevious?: () => void;
      onSeek?: (details: MediaSessionActionDetails) => void;
    },
  ): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const artwork = metadata.artworkUrl
        ? [
            { src: metadata.artworkUrl, sizes: '96x96', type: 'image/png' },
            { src: metadata.artworkUrl, sizes: '128x128', type: 'image/png' },
            { src: metadata.artworkUrl, sizes: '192x192', type: 'image/png' },
            { src: metadata.artworkUrl, sizes: '512x512', type: 'image/png' },
          ]
        : [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album || 'Al-Quran Al-Kareem (আল-কুরআন)',
        artwork,
      });

      if (handlers) {
        if (handlers.onPlay) {
          navigator.mediaSession.setActionHandler('play', handlers.onPlay);
        }
        if (handlers.onPause) {
          navigator.mediaSession.setActionHandler('pause', handlers.onPause);
        }
        if (handlers.onNext) {
          navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
        }
        if (handlers.onPrevious) {
          navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
        }
        if (handlers.onSeek) {
          navigator.mediaSession.setActionHandler('seekto', handlers.onSeek);
        }
      }
    } catch (err) {
      console.warn('MediaSession update error:', err);
    }
  }

  setPlaybackState(state: 'none' | 'paused' | 'playing'): void {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state;
      } catch {
        // Ignore
      }
    }
  }

  // =========================================================================
  // 4. EXACT WAQT NOTIFICATIONS & ADHAN ALARMS (Capacitor LocalNotifications)
  // =========================================================================

  /**
   * Initializes high-importance notification channel with custom Adhan sound on Android
   */
  async initNotificationChannel(): Promise<void> {
    if (!this.isNativeMobile() || !this.isAndroid() || this.channelInitialized) return;
    try {
      await LocalNotifications.createChannel({
        id: MobileHardwareService.ADHAN_CHANNEL_ID,
        name: 'Adhan & Prayer Times',
        description: 'Real-time Waqt notifications and Adhan recitation alerts',
        sound: 'adhan.wav',
        importance: 5, // IMPORTANCE_HIGH (pops up on screen with sound)
        visibility: 1, // VISIBILITY_PUBLIC (shows on lockscreen)
        vibration: true,
        lights: true,
        lightColor: '#10b981',
      });
      this.channelInitialized = true;
      console.info('[MobileHardware] Notification channel initialized: ' + MobileHardwareService.ADHAN_CHANNEL_ID);
    } catch (err) {
      console.warn('Failed to create notification channel:', err);
    }
  }

  /**
   * Checks whether notification permission is currently granted
   */
  async checkNotificationPermission(): Promise<boolean> {
    if (this.isNativeMobile()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        return status.display === 'granted';
      } catch {
        return false;
      }
    }

    if (typeof Notification !== 'undefined') {
      return Notification.permission === 'granted';
    }

    return false;
  }

  /**
   * Requests Android 13+ / iOS notification permissions natively
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (this.isNativeMobile()) {
      try {
        const status = await LocalNotifications.requestPermissions();
        const granted = status.display === 'granted';
        if (granted) {
          await this.initNotificationChannel();
        }
        return granted;
      } catch (err) {
        console.warn('Native notification permission error:', err);
      }
    }

    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Schedules precise Waqt Adhan notifications via Capacitor LocalNotifications
   * Uses Android AlarmManager (allowWhileIdle: true) to fire in real time even when device is asleep.
   */
  async schedulePrayerAlarms(prayers: PrayerAlarmItem[]): Promise<void> {
    if (!this.isNativeMobile()) return;

    try {
      await this.initNotificationChannel();

      // Cancel previous scheduled alarms
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }

      const now = Date.now();
      const upcoming = prayers.filter((p) => p.time.getTime() > now);

      if (upcoming.length === 0) return;

      const notifications = upcoming.map((p) => ({
        id: p.id,
        title: p.titleBn,
        body: p.bodyBn,
        largeBody: p.bodyBn,
        schedule: { at: p.time, allowWhileIdle: true },
        channelId: MobileHardwareService.ADHAN_CHANNEL_ID,
        sound: 'adhan.wav',
        smallIcon: 'ic_stat_quran',
        iconColor: '#10b981',
        extra: {
          waqtName: p.name,
          timeStr: p.time.toISOString(),
        },
      }));

      await LocalNotifications.schedule({ notifications });
      console.info(`[MobileHardware] Successfully scheduled ${notifications.length} prayer alarms in Android AlarmManager.`);
    } catch (err) {
      console.warn('Error scheduling prayer alarms:', err);
    }
  }

  /**
   * Cancels all scheduled prayer alarms (e.g. when notifications are turned off)
   */
  async cancelAllPrayerAlarms(): Promise<void> {
    if (!this.isNativeMobile()) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
        console.info('[MobileHardware] All prayer alarms cancelled.');
      }
    } catch (err) {
      console.warn('Failed to cancel prayer alarms:', err);
    }
  }

  /**
   * Triggers an immediate test notification with Adhan audio to verify notifications on phone
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    extra?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.isNativeMobile()) return;
    try {
      await this.initNotificationChannel();
      const testId = Math.floor(Math.random() * 90000) + 10000;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: testId,
            title,
            body,
            largeBody: body,
            schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
            channelId: MobileHardwareService.ADHAN_CHANNEL_ID,
            sound: 'adhan.wav',
            smallIcon: 'ic_stat_quran',
            iconColor: '#10b981',
            extra: extra ?? {},
          },
        ],
      });
      console.info('[MobileHardware] Immediate test notification scheduled');
    } catch (err) {
      console.warn('Failed to send immediate notification:', err);
    }
  }

  /**
   * Listens for user tapping a prayer notification to open the app and trigger Adhan modal
   */
  initNotificationListener(onTap: (waqtName?: string) => void): void {
    if (!this.isNativeMobile()) return;
    try {
      void LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const extra = notification.notification?.extra;
        onTap(extra?.waqtName);
      });
    } catch (err) {
      console.warn('Failed to register notification action listener:', err);
    }
  }

  // =========================================================================
  // 5. MOBILE HALAL SHIELD & PRIVATE DNS LAUNCHER
  // =========================================================================

  /**
   * DNS hostnames for Private DNS configuration
   */
  readonly privateDnsHostnames = [
    {
      id: 'cloudflare',
      name: 'Cloudflare Family (1.1.1.3)',
      hostname: 'family.cloudflare-dns.com',
      desc: '100% blocks adult websites and malicious domains automatically across all browsers.',
    },
    {
      id: 'adguard',
      name: 'AdGuard Family Protection',
      hostname: 'dns-family.adguard.com',
      desc: 'Blocks adult content and intrusive ads across all apps and browsers.',
    },
  ];

  /**
   * Opens Android Network & Internet Settings where Private DNS is located
   */
  openAndroidDnsSettings(): void {
    if (typeof window === 'undefined') return;

    if (this.isNativeMobile() && this.isAndroid()) {
      try {
        window.location.href = 'intent:#Intent;action=android.settings.NETWORK_OPERATOR_SETTINGS;end';
        return;
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Copies Private DNS hostname to clipboard with 1 tap
   */
  async copyDnsHostname(hostname: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(hostname);
        await this.hapticTap();
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }
}

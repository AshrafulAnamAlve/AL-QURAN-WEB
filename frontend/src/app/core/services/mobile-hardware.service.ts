import { Injectable, signal } from '@angular/core';

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
  /** True when running inside Capacitor Android or iOS shell */
  readonly isNativeMobile = signal<boolean>(this.checkNativeMobile());

  /** True on Android platform */
  readonly isAndroid = signal<boolean>(this.checkAndroid());

  /** True on iOS platform */
  readonly isIos = signal<boolean>(this.checkIos());

  constructor() {
    this.initPlatformFlags();
  }

  private checkNativeMobile(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.Capacitor && typeof win.Capacitor.isNativePlatform === 'function' && win.Capacitor.isNativePlatform());
  }

  private checkAndroid(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /android/i.test(navigator.userAgent);
  }

  private checkIos(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private initPlatformFlags(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.isNativeMobile.set(this.checkNativeMobile());
      });
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
      const win = window as any;
      if (win.Capacitor?.Plugins?.Haptics) {
        await win.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' });
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
      const win = window as any;
      if (win.Capacitor?.Plugins?.Haptics) {
        await win.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' });
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
      const win = window as any;
      if (win.Capacitor?.Plugins?.Haptics) {
        await win.Capacitor.Plugins.Haptics.impact({ style: 'HEAVY' });
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
  // 4. EXACT WAQT NOTIFICATIONS & ADHAN ALARMS
  // =========================================================================

  /**
   * Requests Android 13+ / iOS notification permissions
   */
  async requestNotificationPermission(): Promise<boolean> {
    const win = window as any;
    if (win.Capacitor?.Plugins?.LocalNotifications) {
      try {
        const status = await win.Capacitor.Plugins.LocalNotifications.requestPermissions();
        return status.display === 'granted';
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
   */
  async schedulePrayerAlarms(prayers: PrayerAlarmItem[]): Promise<void> {
    const win = window as any;
    if (!win.Capacitor?.Plugins?.LocalNotifications) return;

    try {
      // Cancel previous scheduled prayer alarms (IDs 1001-1010)
      await win.Capacitor.Plugins.LocalNotifications.cancel({
        notifications: prayers.map((p) => ({ id: p.id })),
      });

      const now = new Date().getTime();
      const upcoming = prayers.filter((p) => p.time.getTime() > now);

      if (upcoming.length === 0) return;

      const notifications = upcoming.map((p) => ({
        id: p.id,
        title: p.titleBn,
        body: p.bodyBn,
        schedule: { at: p.time, allowWhileIdle: true },
        sound: 'adhan.wav',
        smallIcon: 'ic_stat_quran',
        iconColor: '#10b981',
        extra: {
          waqtName: p.name,
          timeStr: p.time.toISOString(),
        },
      }));

      await win.Capacitor.Plugins.LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.warn('Error scheduling prayer alarms:', err);
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
    
    // Deep link or instruction prompt
    const win = window as any;
    if (win.Capacitor?.Plugins?.App) {
      try {
        // Trigger Android settings intent if available
        win.location.href = 'intent:#Intent;action=android.settings.NETWORK_OPERATOR_SETTINGS;end';
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

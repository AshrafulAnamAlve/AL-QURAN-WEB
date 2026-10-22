import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AudioPlayerService } from './audio-player';
import { LanguageService } from './language';
import { PrayerTimesService } from './prayer';

export interface DesktopAppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
}

declare global {
  interface Window {
    desktopApi?: {
      platform: string;
      isDesktop: boolean;
      notify: (title: string, body: string, icon?: string) => void;
      updatePrayerStatus: (waqtName: string, countdownText: string) => void;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      quit: () => void;
      getAppInfo: () => Promise<DesktopAppInfo>;
      onNavigate: (callback: (route: string) => void) => void;
      onToggleAdhanMute: (callback: (muted: boolean) => void) => void;
      setAdhanMuted: (muted: boolean) => void;
      onNotificationClick: (callback: () => void) => void;
      onMediaControl: (callback: (action: 'play-pause' | 'next' | 'prev') => void) => void;
      // Background Adhan & Prayer Alerts
      setAutostart: (enabled: boolean) => Promise<boolean>;
      getAutostart: () => Promise<boolean>;
      notifyAdhanState: (isPlaying: boolean) => void;
      onStopAdhan: (callback: () => void) => void;
      onTogglePrayerAlerts: (callback: (enabled: boolean) => void) => void;
      onToggleAutoAdhan: (callback: (enabled: boolean) => void) => void;
      setPrayerAlertsEnabled: (enabled: boolean) => void;
      setAutoAdhanEnabled: (enabled: boolean) => void;
      // System-wide Halal Blocker Shield
      getShieldStatus: () => Promise<{ enabled: boolean; dnsServers: string[]; error?: string }>;
      setShield: (enabled: boolean) => Promise<{ success: boolean; enabled: boolean; error?: string }>;
      onToggleShieldFromTray: (callback: () => void) => void;
    };
  }
}

export const DESKTOP_DOWNLOAD_LINKS = {
  releasePage: 'https://github.com/AshrafulAnamAlve/AL-QURAN-WEB/releases/latest',
  portableExe: 'https://github.com/AshrafulAnamAlve/AL-QURAN-WEB/releases/latest/download/Al-Quran-Portable-1.1.0.exe',
  setupExe: 'https://github.com/AshrafulAnamAlve/AL-QURAN-WEB/releases/latest/download/Al-Quran-Setup-1.1.0.exe',
};

export interface DesktopShortcut {
  key: string;
  descriptionBn: string;
  descriptionEn: string;
  category: 'audio' | 'navigation' | 'general';
}

export const DESKTOP_SHORTCUTS: DesktopShortcut[] = [
  {
    key: 'Media Play/Pause or Space',
    descriptionBn: 'কুরআন তিলাওয়াত শুরু বা বন্ধ করুন',
    descriptionEn: 'Play or pause Quran recitation',
    category: 'audio',
  },
  {
    key: 'Media Next Track',
    descriptionBn: 'পরবর্তী আয়াতে যান',
    descriptionEn: 'Jump to next ayah',
    category: 'audio',
  },
  {
    key: 'Media Previous Track',
    descriptionBn: 'পূর্ববর্তী আয়াতে ফিরে যান',
    descriptionEn: 'Jump to previous ayah',
    category: 'audio',
  },
  {
    key: 'M',
    descriptionBn: 'আজান সাউন্ড মিউট বা আনমিউট করুন',
    descriptionEn: 'Mute or unmute Adhan sound',
    category: 'audio',
  },
  {
    key: 'Ctrl + K or /',
    descriptionBn: 'সার্চ ও অনুসন্ধান প্যানেল খুলুন',
    descriptionEn: 'Open instant search dialog',
    category: 'navigation',
  },
  {
    key: 'Esc',
    descriptionBn: 'যেকোনো সক্রিয় মোডাল বা পপআপ বন্ধ করুন',
    descriptionEn: 'Dismiss active dialog or modal',
    category: 'general',
  },
];

@Injectable({ providedIn: 'root' })
export class DesktopService {
  private readonly prayerService = inject(PrayerTimesService);
  private readonly lang = inject(LanguageService);
  private readonly router = inject(Router, { optional: true });
  private readonly audioPlayer = inject(AudioPlayerService, { optional: true });

  readonly isDesktop = (): boolean => {
    return typeof window !== 'undefined' && !!window.desktopApi?.isDesktop;
  };

  readonly platform = (): string => {
    return typeof window !== 'undefined' && window.desktopApi?.platform
      ? window.desktopApi.platform
      : 'web';
  };

  /** Controls display of the Desktop App download and shortcuts modal on the website */
  readonly showDownloadModal = signal<boolean>(false);
  readonly modalTab = signal<'download' | 'shortcuts'>('download');

  readonly downloadLinks = DESKTOP_DOWNLOAD_LINKS;
  readonly shortcuts = DESKTOP_SHORTCUTS;

  openDownloadModal(tab: 'download' | 'shortcuts' = 'download'): void {
    this.modalTab.set(tab);
    this.showDownloadModal.set(true);
  }

  closeDownloadModal(): void {
    this.showDownloadModal.set(false);
  }

  constructor() {
    this.setupDesktopStyles();
    this.setupTrayPrayerSync();
    this.setupTrayNavigation();
    this.setupMediaControl();
    this.setupShieldSync();
  }

  private setupShieldSync(): void {
    if (!this.isDesktop()) return;

    // Check initial DNS shield status
    this.checkShieldStatus();

    // Listen for tray menu toggle clicks
    if (window.desktopApi?.onToggleShieldFromTray) {
      window.desktopApi.onToggleShieldFromTray(() => {
        this.toggleShield();
      });
    }
  }

  private setupDesktopStyles(): void {
    if (this.isDesktop() && typeof document !== 'undefined') {
      document.body.classList.add('is-desktop');
    }
  }

  private setupTrayPrayerSync(): void {
    if (!this.isDesktop()) return;

    // Reactively stream next prayer countdown to the Desktop System Tray
    effect(() => {
      const next = this.prayerService.nextPrayer();
      if (next && window.desktopApi) {
        const waqt = this.lang.isBn() ? next.prayer.banglaName : next.prayer.name;
        const countdown = next.formattedCountdown;
        window.desktopApi.updatePrayerStatus(waqt, countdown);
      }
    });
  }

  private setupTrayNavigation(): void {
    if (!this.isDesktop() || !window.desktopApi?.onNavigate) return;

    window.desktopApi.onNavigate((route: string) => {
      if (this.router) {
        this.router.navigate([route]);
      }
    });
  }

  private setupMediaControl(): void {
    if (!this.isDesktop() || !window.desktopApi?.onMediaControl) return;

    window.desktopApi.onMediaControl((action) => {
      if (!this.audioPlayer) return;
      if (action === 'play-pause') {
        this.audioPlayer.toggle();
      } else if (action === 'next') {
        this.audioPlayer.next();
      } else if (action === 'prev') {
        this.audioPlayer.previous();
      }
    });
  }

  /** Bi-directional sync: Notify system tray about Adhan mute state */
  setTrayAdhanMuted(muted: boolean): void {
    if (this.isDesktop() && window.desktopApi?.setAdhanMuted) {
      window.desktopApi.setAdhanMuted(muted);
    }
  }

  /** Subscribe to Adhan mute toggle initiated from system tray context menu */
  onToggleAdhanMute(callback: (muted: boolean) => void): void {
    if (this.isDesktop() && window.desktopApi?.onToggleAdhanMute) {
      window.desktopApi.onToggleAdhanMute(callback);
    }
  }

  /** Subscribe to native desktop notification click events */
  onNotificationClick(callback: () => void): void {
    if (this.isDesktop() && window.desktopApi?.onNotificationClick) {
      window.desktopApi.onNotificationClick(callback);
    }
  }

  /** Informs desktop tray about active Adhan playing state */
  notifyAdhanPlaying(isPlaying: boolean): void {
    if (this.isDesktop() && window.desktopApi?.notifyAdhanState) {
      window.desktopApi.notifyAdhanState(isPlaying);
    }
  }

  /** Subscribe to Stop Adhan requested from desktop system tray */
  onStopAdhan(callback: () => void): void {
    if (this.isDesktop() && window.desktopApi?.onStopAdhan) {
      window.desktopApi.onStopAdhan(callback);
    }
  }

  /** Subscribe to Prayer Alerts toggle requested from desktop system tray */
  onTogglePrayerAlerts(callback: (enabled: boolean) => void): void {
    if (this.isDesktop() && window.desktopApi?.onTogglePrayerAlerts) {
      window.desktopApi.onTogglePrayerAlerts(callback);
    }
  }

  /** Subscribe to Auto Adhan toggle requested from desktop system tray */
  onToggleAutoAdhan(callback: (enabled: boolean) => void): void {
    if (this.isDesktop() && window.desktopApi?.onToggleAutoAdhan) {
      window.desktopApi.onToggleAutoAdhan(callback);
    }
  }

  /** Sync prayer alerts enabled state to desktop tray */
  setPrayerAlertsEnabled(enabled: boolean): void {
    if (this.isDesktop() && window.desktopApi?.setPrayerAlertsEnabled) {
      window.desktopApi.setPrayerAlertsEnabled(enabled);
    }
  }

  /** Sync auto adhan enabled state to desktop tray */
  setAutoAdhanEnabled(enabled: boolean): void {
    if (this.isDesktop() && window.desktopApi?.setAutoAdhanEnabled) {
      window.desktopApi.setAutoAdhanEnabled(enabled);
    }
  }

  /** Get Windows startup autostart state */
  async getAutostart(): Promise<boolean> {
    if (this.isDesktop() && window.desktopApi?.getAutostart) {
      return window.desktopApi.getAutostart();
    }
    return false;
  }

  /** Set Windows startup autostart state */
  async setAutostart(enabled: boolean): Promise<boolean> {
    if (this.isDesktop() && window.desktopApi?.setAutostart) {
      return window.desktopApi.setAutostart(enabled);
    }
    return false;
  }

  /** Triggers a native OS notification banner */
  sendNotification(title: string, body: string, icon?: string): void {
    if (this.isDesktop() && window.desktopApi) {
      window.desktopApi.notify(title, body, icon);
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
      } catch {
        // Ignored
      }
    }
  }

  // System-wide Halal Blocker Shield
  readonly isShieldActive = signal<boolean>(false);
  readonly isShieldLoading = signal<boolean>(false);
  readonly shieldError = signal<string | null>(null);

  /** Check current system-wide shield status on Windows */
  async checkShieldStatus(): Promise<boolean> {
    if (this.isDesktop() && window.desktopApi?.getShieldStatus) {
      try {
        const res = await window.desktopApi.getShieldStatus();
        this.isShieldActive.set(res.enabled);
        return res.enabled;
      } catch (err) {
        console.warn('[DesktopService] Could not check shield status:', err);
      }
    }
    return false;
  }

  /** Enable or disable system-wide shield on Windows */
  async toggleShield(targetState?: boolean): Promise<boolean> {
    if (!this.isDesktop() || !window.desktopApi?.setShield) {
      return false;
    }

    const next = typeof targetState === 'boolean' ? targetState : !this.isShieldActive();
    this.isShieldLoading.set(true);
    this.shieldError.set(null);

    try {
      const res = await window.desktopApi.setShield(next);
      this.isShieldActive.set(res.enabled);
      if (!res.success && res.error) {
        this.shieldError.set(res.error);
      }
      return res.enabled;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.shieldError.set(msg);
      return this.isShieldActive();
    } finally {
      this.isShieldLoading.set(false);
    }
  }

  minimize(): void {
    window.desktopApi?.minimize();
  }

  maximize(): void {
    window.desktopApi?.maximize();
  }

  close(): void {
    window.desktopApi?.close();
  }

  quit(): void {
    window.desktopApi?.quit();
  }

  async getAppInfo(): Promise<DesktopAppInfo | null> {
    if (this.isDesktop() && window.desktopApi) {
      return window.desktopApi.getAppInfo();
    }
    return null;
  }
}

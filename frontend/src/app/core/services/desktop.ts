import { Injectable, computed, effect, inject, signal } from '@angular/core';
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
    };
  }
}

@Injectable({ providedIn: 'root' })
export class DesktopService {
  private readonly prayerService = inject(PrayerTimesService);
  private readonly lang = inject(LanguageService);

  readonly isDesktop = (): boolean => {
    return typeof window !== 'undefined' && !!window.desktopApi?.isDesktop;
  };

  readonly platform = (): string => {
    return typeof window !== 'undefined' && window.desktopApi?.platform
      ? window.desktopApi.platform
      : 'web';
  };

  constructor() {
    this.setupTrayPrayerSync();
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

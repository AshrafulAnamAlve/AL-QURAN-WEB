import { Injectable, computed, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { LoggerService } from './logger';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly logger = inject(LoggerService);
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  // --- Network State ---
  private readonly _isOnline = signal<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  readonly isOnline = this._isOnline.asReadonly();
  readonly isOffline = computed(() => !this._isOnline());

  // --- Install State ---
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private readonly _canInstall = signal<boolean>(false);
  readonly canInstall = this._canInstall.asReadonly();

  private readonly _isInstalled = signal<boolean>(false);
  readonly isInstalled = this._isInstalled.asReadonly();

  // --- Update State ---
  private readonly _hasUpdate = signal<boolean>(false);
  readonly hasUpdate = this._hasUpdate.asReadonly();

  constructor() {
    this.initNetworkListeners();
    this.initInstallListeners();
    this.initUpdateListeners();
  }

  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this._isOnline.set(true);
      this.logger.info('Network status: online');
    });

    window.addEventListener('offline', () => {
      this._isOnline.set(false);
      this.logger.warn('Network status: offline');
    });
  }

  private initInstallListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent automatic prompt to allow customized, accessible trigger
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this._canInstall.set(true);
      this.logger.info('PWA install prompt ready');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this._canInstall.set(false);
      this._isInstalled.set(true);
      this.logger.info('PWA installed successfully');
    });

    // Check if running in standalone mode (already installed)
    if (
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      this._isInstalled.set(true);
    }
  }

  private initUpdateListeners(): void {
    if (!this.swUpdate?.isEnabled) return;

    this.swUpdate.versionUpdates.subscribe({
      next: (evt) => {
        if (evt.type === 'VERSION_READY') {
          this._hasUpdate.set(true);
          this.logger.info('New application version ready');
        }
      },
    });
  }

  /**
   * Triggers the PWA install prompt. Returns true if user accepted.
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this._canInstall.set(false);
      return choice.outcome === 'accepted';
    } catch (err) {
      this.logger.warn('PWA install prompt error', err);
      return false;
    }
  }

  /**
   * Reloads the application to apply a pending service worker update.
   */
  async activateUpdate(): Promise<void> {
    if (this.swUpdate?.isEnabled && this._hasUpdate()) {
      await this.swUpdate.activateUpdate();
      window.location.reload();
    }
  }
}

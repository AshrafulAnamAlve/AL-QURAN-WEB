import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopApi {
  platform: NodeJS.Platform;
  isDesktop: boolean;
  notify: (title: string, body: string, icon?: string) => void;
  updatePrayerStatus: (waqtName: string, countdownText: string) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  quit: () => void;
  getAppInfo: () => Promise<{
    version: string;
    name: string;
    platform: string;
    arch: string;
    isPackaged: boolean;
  }>;
  onNavigate: (callback: (route: string) => void) => void;
  onToggleAdhanMute: (callback: (muted: boolean) => void) => void;
  setAdhanMuted: (muted: boolean) => void;
  onNotificationClick: (callback: () => void) => void;
  onMediaControl: (callback: (action: 'play-pause' | 'next' | 'prev') => void) => void;
  // Prayer & Background Adhan methods
  setAutostart: (enabled: boolean) => Promise<boolean>;
  getAutostart: () => Promise<boolean>;
  notifyAdhanState: (isPlaying: boolean) => void;
  onStopAdhan: (callback: () => void) => void;
  onTogglePrayerAlerts: (callback: (enabled: boolean) => void) => void;
  onToggleAutoAdhan: (callback: (enabled: boolean) => void) => void;
  setPrayerAlertsEnabled: (enabled: boolean) => void;
  setAutoAdhanEnabled: (enabled: boolean) => void;
}

const desktopApi: DesktopApi = {
  platform: process.platform,
  isDesktop: true,
  notify: (title: string, body: string, icon?: string) => {
    ipcRenderer.send('desktop:notify', { title, body, icon });
  },
  updatePrayerStatus: (waqtName: string, countdownText: string) => {
    ipcRenderer.send('desktop:update-prayer', { waqtName, countdownText });
  },
  minimize: () => {
    ipcRenderer.send('desktop:minimize');
  },
  maximize: () => {
    ipcRenderer.send('desktop:maximize');
  },
  close: () => {
    ipcRenderer.send('desktop:close');
  },
  quit: () => {
    ipcRenderer.send('desktop:quit');
  },
  getAppInfo: () => {
    return ipcRenderer.invoke('desktop:get-app-info');
  },
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('desktop:navigate', (_event, route) => callback(route));
  },
  onToggleAdhanMute: (callback: (muted: boolean) => void) => {
    ipcRenderer.on('desktop:toggle-adhan-mute', (_event, muted) => callback(muted));
  },
  setAdhanMuted: (muted: boolean) => {
    ipcRenderer.send('desktop:set-adhan-mute', muted);
  },
  onNotificationClick: (callback: () => void) => {
    ipcRenderer.on('desktop:notification-clicked', () => callback());
  },
  onMediaControl: (callback: (action: 'play-pause' | 'next' | 'prev') => void) => {
    ipcRenderer.on('desktop:media-control', (_event, action) => callback(action));
  },
  setAutostart: (enabled: boolean) => {
    return ipcRenderer.invoke('desktop:set-autostart', enabled);
  },
  getAutostart: () => {
    return ipcRenderer.invoke('desktop:get-autostart');
  },
  notifyAdhanState: (isPlaying: boolean) => {
    ipcRenderer.send('desktop:notify-adhan-state', isPlaying);
  },
  onStopAdhan: (callback: () => void) => {
    ipcRenderer.on('desktop:stop-adhan', () => callback());
  },
  onTogglePrayerAlerts: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('desktop:toggle-prayer-alerts', (_event, enabled) => callback(enabled));
  },
  onToggleAutoAdhan: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('desktop:toggle-auto-adhan', (_event, enabled) => callback(enabled));
  },
  setPrayerAlertsEnabled: (enabled: boolean) => {
    ipcRenderer.send('desktop:set-prayer-alerts', enabled);
  },
  setAutoAdhanEnabled: (enabled: boolean) => {
    ipcRenderer.send('desktop:set-auto-adhan', enabled);
  },
};

// Expose secure API to Angular renderer
contextBridge.exposeInMainWorld('desktopApi', desktopApi);

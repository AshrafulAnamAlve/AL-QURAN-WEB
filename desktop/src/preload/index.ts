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
};

// Expose secure API to Angular renderer
contextBridge.exposeInMainWorld('desktopApi', desktopApi);

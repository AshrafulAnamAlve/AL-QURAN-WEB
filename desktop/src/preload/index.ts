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
};

// Expose secure API to Angular renderer
contextBridge.exposeInMainWorld('desktopApi', desktopApi);

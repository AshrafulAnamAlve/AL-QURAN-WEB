import { contextBridge, ipcRenderer } from 'electron';

// Expose secure desktop APIs to Angular renderer
contextBridge.exposeInMainWorld('desktopApi', {
  platform: process.platform,
  isDesktop: true,
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('desktop:notify', { title, body });
  },
  onPrayerCountdownUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('desktop:prayer-update', (_event, data) => callback(data));
  },
});

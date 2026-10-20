import { app, ipcMain, Notification } from 'electron';
import * as path from 'path';
import { setAdhanMutedState, updateTrayPrayerInfo } from './tray';
import { getMainWindow, setIsQuitting } from './window';

export function registerIpcHandlers(): void {
  // Show native desktop notification (Adhan / Task reminder)
  ipcMain.on('desktop:notify', (_event, { title, body, icon }) => {
    if (Notification.isSupported()) {
      const defaultIcon = path.join(__dirname, '../../assets/icons/icon.png');
      const iconPath = icon && path.isAbsolute(icon) ? icon : defaultIcon;

      const notification = new Notification({
        title: title || 'Al-Quran',
        body: body || '',
        icon: iconPath,
        silent: false,
      });

      notification.on('click', () => {
        const win = getMainWindow();
        if (win) {
          if (!win.isVisible()) win.show();
          win.focus();
          win.webContents.send('desktop:notification-clicked');
        }
      });

      notification.show();
    }
  });

  // Keep system tray mute toggle in sync with Angular settings
  ipcMain.on('desktop:set-adhan-mute', (_event, muted: boolean) => {
    setAdhanMutedState(Boolean(muted));
  });

  // Update tray tooltip & status from Angular PrayerService
  ipcMain.on('desktop:update-prayer', (_event, { waqtName, countdownText }) => {
    if (waqtName && countdownText) {
      updateTrayPrayerInfo(`${waqtName}: বাকি ${countdownText}`);
    }
  });

  // Window control commands
  ipcMain.on('desktop:minimize', () => {
    const win = getMainWindow();
    win?.minimize();
  });

  ipcMain.on('desktop:maximize', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('desktop:close', () => {
    const win = getMainWindow();
    win?.close(); // Triggers close listener in window.ts (hides to tray)
  });

  ipcMain.on('desktop:quit', () => {
    setIsQuitting(true);
    app.quit();
  });

  // Diagnostic / App info
  ipcMain.handle('desktop:get-app-info', () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
    };
  });
}

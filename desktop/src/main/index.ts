import { app, BrowserWindow } from 'electron';
import { registerIpcHandlers } from './ipc';
import { createTray } from './tray';
import { createMainWindow, getMainWindow, setIsQuitting } from './window';

// Single instance lock to prevent duplicate app launches
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus existing window if user tries to open a second instance
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers();
    createMainWindow();
    createTray();

    app.on('activate', () => {
      const win = getMainWindow();
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      } else {
        win?.show();
        win?.focus();
      }
    });
  });

  app.on('before-quit', () => {
    setIsQuitting(true);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

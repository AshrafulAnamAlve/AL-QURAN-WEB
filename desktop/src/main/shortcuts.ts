import { app, globalShortcut } from 'electron';
import { getMainWindow } from './window';

export function registerGlobalMediaShortcuts(): void {
  try {
    // Media Play/Pause key
    globalShortcut.register('MediaPlayPause', () => {
      const win = getMainWindow();
      win?.webContents.send('desktop:media-control', 'play-pause');
    });

    // Media Next Track key
    globalShortcut.register('MediaNextTrack', () => {
      const win = getMainWindow();
      win?.webContents.send('desktop:media-control', 'next');
    });

    // Media Previous Track key
    globalShortcut.register('MediaPreviousTrack', () => {
      const win = getMainWindow();
      win?.webContents.send('desktop:media-control', 'prev');
    });
  } catch (err) {
    console.warn('[Desktop] Could not register global media shortcuts:', err);
  }

  // Safely release global shortcuts when application is quitting
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

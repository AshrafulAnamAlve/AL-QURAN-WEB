import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import { WindowStateManager } from './window-state';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let windowStateManager: WindowStateManager | null = null;

export function setIsQuitting(val: boolean): void {
  isQuitting = val;
}

export function getIsQuitting(): boolean {
  return isQuitting;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createMainWindow(): BrowserWindow {
  const isDev = process.env['NODE_ENV'] === 'development' || process.argv.includes('--dev');

  if (!windowStateManager) {
    windowStateManager = new WindowStateManager();
  }
  const state = windowStateManager.getState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 980,
    minHeight: 640,
    title: 'Al-Quran (কুরআন ও ইসলামিক টুলস)',
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    backgroundColor: '#0a1914', // Emerald dark theme
    show: false, // Show gracefully on ready-to-show
    autoHideMenuBar: true,
    titleBarStyle:
      process.platform === 'win32'
        ? 'hidden'
        : process.platform === 'darwin'
          ? 'hiddenInset'
          : 'default',
    titleBarOverlay:
      process.platform === 'win32'
        ? {
            color: '#071611',
            symbolColor: '#d4af37',
            height: 48,
          }
        : undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false, // Ensures unhindered background timers & prayer audio
    },
  });

  windowStateManager.manage(mainWindow);

  // Graceful show to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open external links in user's default browser instead of electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // In production, load the built Angular app
    const indexPath = path.join(__dirname, '../../../frontend/dist/frontend/browser/index.html');
    mainWindow.loadFile(indexPath).catch(() => {
      // Fallback relative path when packaged inside app.asar
      mainWindow?.loadFile(path.join(app.getAppPath(), 'dist/frontend/browser/index.html'));
    });
  }

  // Prevent app from closing completely on 'X' if minimized to tray is supported
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

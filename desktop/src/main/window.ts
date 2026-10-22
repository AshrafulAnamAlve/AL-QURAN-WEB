import { app, BrowserWindow, Notification, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { WindowStateManager } from './window-state';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let windowStateManager: WindowStateManager | null = null;
let hasShownCloseNotice = false;

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

    if (process.argv.includes('--run-self-test')) {
      setTimeout(async () => {
        try {
          const result = await mainWindow?.webContents.executeJavaScript(`
            (async () => {
              const root = document.querySelector('aq-root');
              const hasContent = root && root.innerHTML.length > 50;
              const hasNav = Boolean(document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('aq-header') || document.querySelector('main'));
              let shieldStatus = null;
              if (window.desktopApi && window.desktopApi.getShieldStatus) {
                try {
                  shieldStatus = await window.desktopApi.getShieldStatus();
                } catch (e) {
                  shieldStatus = { error: String(e) };
                }
              }
              return {
                title: document.title,
                hasContent,
                hasNav,
                shieldStatus
              };
            })()
          `);
          console.log('[SELF-TEST-SUCCESS]', JSON.stringify(result));
        } catch (e) {
          console.error('[SELF-TEST-ERROR]', e);
        } finally {
          setIsQuitting(true);
          app.quit();
        }
      }, 2000);
    }
  });

  // Open external links in user's default browser instead of electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Enable F12 key to toggle DevTools for inspection and debugging
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Fallback to ensure window is visible even if ready-to-show event takes too long
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 2500);

  let hasFallenBack = false;
  const loadBuiltFrontend = () => {
    if (!mainWindow || hasFallenBack) return;
    hasFallenBack = true;
    const candidatePaths = [
      path.join(__dirname, '../../../frontend/dist/frontend/browser/index.html'),
      path.join(app.getAppPath(), '../frontend/dist/frontend/browser/index.html'),
      path.join(app.getAppPath(), 'dist/frontend/browser/index.html'),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        mainWindow.loadFile(candidate).catch((err) => {
          console.error('[Window] Error loading file candidate:', candidate, err);
        });
        return;
      }
    }
    console.error('[Window] No index.html found in candidate paths:', candidatePaths);
  };

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.warn(`[Window] did-fail-load: ${validatedURL} (${errorCode}: ${errorDescription})`);
    if (validatedURL.includes('localhost:4200')) {
      console.warn('[Window] Dev server http://localhost:4200 is unavailable. Falling back to local built files...');
      loadBuiltFrontend();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200').catch(() => {
      console.warn('[Window] Could not connect to http://localhost:4200. Falling back to local built files...');
      loadBuiltFrontend();
    });
  } else {
    loadBuiltFrontend();
  }

  // Prevent app from closing completely on 'X' if minimized to tray is supported
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();

      if (!hasShownCloseNotice && Notification.isSupported()) {
        hasShownCloseNotice = true;
        const defaultIcon = path.join(__dirname, '../../assets/icons/icon.png');
        const notice = new Notification({
          title: 'Al-Quran (আল-কুরআন)',
          body: 'অ্যাপটি ব্যাকগ্রাউন্ডে সক্রিয় রয়েছে। নামাজের সময় নোটিফিকেশন আসবে এবং স্বয়ংক্রিয়ভাবে আজান বাজবে।',
          icon: defaultIcon,
          silent: true,
        });
        notice.show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

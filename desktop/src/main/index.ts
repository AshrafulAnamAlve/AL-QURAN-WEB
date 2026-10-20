import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const isDev = process.env['NODE_ENV'] === 'development';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Al-Quran',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built Angular app
    const indexPath = path.join(__dirname, '../../../frontend/dist/frontend/browser/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('close', (event) => {
    // Minimize to tray instead of quitting if tray exists
    if (tray && !(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  const icon = nativeImage.createEmpty(); // Will be replaced with real icon in Phase 20.3
  tray = new Tray(icon);
  tray.setToolTip('Al-Quran — কুরআন ও ইসলামিক টুলস');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Al-Quran (অ্যাপ খুলুন)',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Exit (বন্ধ করুন)',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

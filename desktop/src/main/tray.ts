import { app, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';
import { getMainWindow, setIsQuitting } from './window';

let tray: Tray | null = null;
let currentPrayerInfo = 'নামাজের সময়সূচি লোড হচ্ছে…';

export function getTray(): Tray | null {
  return tray;
}

export function updateTrayPrayerInfo(info: string): void {
  currentPrayerInfo = info;
  if (tray) {
    tray.setToolTip(`Al-Quran — ${info}`);
    rebuildTrayMenu();
  }
}

function rebuildTrayMenu(): void {
  if (!tray) return;

  const mainWindow = getMainWindow();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Al-Quran (আল-কুরআন)',
      enabled: false,
    },
    {
      label: currentPrayerInfo,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: mainWindow?.isVisible() ? 'Hide to Tray (লুকিয়ে রাখুন)' : 'Open Al-Quran (অ্যাপ খুলুন)',
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
        rebuildTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Exit Al-Quran (সম্পূর্ণ প্রস্থান)',
      click: () => {
        setIsQuitting(true);
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function createTray(): Tray {
  // Use a default embedded 16x16 icon or transparent icon for fallback
  const iconPath = path.join(__dirname, '../../assets/icons/tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    // Generate an in-memory 16x16 emerald icon
    const size = 16;
    const canvas = nativeImage.createEmpty();
    icon = canvas;
  }

  tray = new Tray(icon);
  tray.setToolTip('Al-Quran — কুরআন ও ইসলামিক টুলস');
  rebuildTrayMenu();

  tray.on('double-click', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
      rebuildTrayMenu();
    }
  });

  return tray;
}

import { app, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';
import { getMainWindow, setIsQuitting } from './window';

let tray: Tray | null = null;
let currentPrayerInfo = 'নামাজের সময়সূচি লোড হচ্ছে…';
let isAdhanMuted = false;

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

function navigateToRoute(route: string): void {
  const win = getMainWindow();
  if (win) {
    if (!win.isVisible()) {
      win.show();
    }
    win.focus();
    win.webContents.send('desktop:navigate', route);
  }
}

export function rebuildTrayMenu(): void {
  if (!tray) return;

  const mainWindow = getMainWindow();
  const isVisible = !!mainWindow?.isVisible();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Al-Quran (আল-কুরআন)',
      enabled: false,
    },
    {
      label: `🕌 ${currentPrayerInfo}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isVisible ? 'Hide to Tray (উইন্ডো লুকান)' : 'Open Al-Quran (উইন্ডো খুলুন)',
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
      label: '📖 পবিত্র কুরআনুল কারীম (Quran)',
      click: () => navigateToRoute('/quran'),
    },
    {
      label: '📜 সহিহ হাদিস শরীফ (Hadith)',
      click: () => navigateToRoute('/hadith'),
    },
    {
      label: '🛡️ রুকইয়াহ আশ-শারইয়াহ (Ruqyah)',
      click: () => navigateToRoute('/ruqyah'),
    },
    {
      label: '⏰ নামাজের সময়সূচি (Prayer Times)',
      click: () => navigateToRoute('/prayer'),
    },
    {
      label: '📿 ডিজিটাল তসবিহ (Tasbih)',
      click: () => navigateToRoute('/tasbih'),
    },
    { type: 'separator' },
    {
      label: isAdhanMuted ? '🔊 আযান আনমিউট করুন (Unmute Adhan)' : '🔇 আযান মিউট করুন (Mute Adhan)',
      click: () => {
        isAdhanMuted = !isAdhanMuted;
        mainWindow?.webContents.send('desktop:toggle-adhan-mute', isAdhanMuted);
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
  const iconPath = path.join(__dirname, '../../assets/icons/tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }

  // Optimize for high-DPI displays
  icon = icon.resize({ width: 16, height: 16 });

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

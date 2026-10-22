import { app, Menu, nativeImage, Tray } from 'electron';
import * as path from 'path';
import { getMainWindow, setIsQuitting } from './window';

let tray: Tray | null = null;
let currentPrayerInfo = 'নামাজের সময়সূচি লোড হচ্ছে…';
let isAdhanMuted = false;
let isAdhanPlaying = false;
let prayerAlertsEnabled = true;
let autoAdhanEnabled = true;
let isShieldEnabled = false;

export function getTray(): Tray | null {
  return tray;
}

export function setShieldTrayState(enabled: boolean): void {
  if (isShieldEnabled !== enabled) {
    isShieldEnabled = enabled;
    rebuildTrayMenu();
  }
}

export function updateTrayPrayerInfo(info: string): void {
  currentPrayerInfo = info;
  if (tray) {
    tray.setToolTip(`Al-Quran — ${info}`);
    rebuildTrayMenu();
  }
}

export function setAdhanMutedState(muted: boolean): void {
  if (isAdhanMuted !== muted) {
    isAdhanMuted = muted;
    rebuildTrayMenu();
  }
}

export function setAdhanPlayingState(playing: boolean): void {
  if (isAdhanPlaying !== playing) {
    isAdhanPlaying = playing;
    rebuildTrayMenu();
  }
}

export function setPrayerAlertsState(enabled: boolean): void {
  if (prayerAlertsEnabled !== enabled) {
    prayerAlertsEnabled = enabled;
    rebuildTrayMenu();
  }
}

export function setAutoAdhanState(enabled: boolean): void {
  if (autoAdhanEnabled !== enabled) {
    autoAdhanEnabled = enabled;
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
    // Stop Adhan quick button when actively playing
    ...(isAdhanPlaying
      ? [
          {
            label: '⏹️ আজান বন্ধ করুন (Stop Adhan)',
            click: () => {
              mainWindow?.webContents.send('desktop:stop-adhan');
            },
          },
          { type: 'separator' as const },
        ]
      : []),
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
      label: prayerAlertsEnabled ? '🔔 নামাজের অ্যালার্ট: চালু' : '🔕 নামাজের অ্যালার্ট: বন্ধ',
      type: 'checkbox',
      checked: prayerAlertsEnabled,
      click: () => {
        prayerAlertsEnabled = !prayerAlertsEnabled;
        mainWindow?.webContents.send('desktop:toggle-prayer-alerts', prayerAlertsEnabled);
        rebuildTrayMenu();
      },
    },
    {
      label: autoAdhanEnabled ? '🔊 ওয়াক্তে আজান বাজানো: চালু' : '🔇 ওয়াক্তে আজান বাজানো: বন্ধ',
      type: 'checkbox',
      checked: autoAdhanEnabled,
      click: () => {
        autoAdhanEnabled = !autoAdhanEnabled;
        mainWindow?.webContents.send('desktop:toggle-auto-adhan', autoAdhanEnabled);
        rebuildTrayMenu();
      },
    },
    {
      label: isAdhanMuted ? '🔊 আযান আনমিউট করুন (Unmute Adhan)' : '🔇 আযান মিউট করুন (Mute Adhan)',
      click: () => {
        isAdhanMuted = !isAdhanMuted;
        mainWindow?.webContents.send('desktop:toggle-adhan-mute', isAdhanMuted);
        rebuildTrayMenu();
      },
    },
    {
      label: isShieldEnabled ? '🛡️ হালাল শিল্ড (কম্পিউটার ব্লকার): চালু' : '🛡️ হালাল শিল্ড (কম্পিউটার ব্লকার): বন্ধ',
      type: 'checkbox',
      checked: isShieldEnabled,
      click: () => {
        mainWindow?.webContents.send('desktop:toggle-shield-from-tray');
      },
    },
    {
      label: '🚀 উইন্ডোজ স্টার্টআপে চালু রাখুন (Run on Startup)',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked, openAsHidden: true });
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

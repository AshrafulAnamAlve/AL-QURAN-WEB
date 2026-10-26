/**
 * Al-Quran & Halal Web Shield — Background Service Worker (Manifest V3)
 * Manages Dynamic Rulesets, Prayer Alarms, Desktop Notifications, Context Menu & Toolbar Badges
 */

const DEFAULT_SETTINGS = {
  shieldEnabled: true,
  blockReels: true,
  blockShorts: true,
  blockAdult: true,
  blockAds: true,
  blockSafeSearch: true,
  reelsBlockedCount: 0,
  adultBlockedCount: 0,
  adsBlockedCount: 0,
  tasbihCount: 0,
  prayerAlertsEnabled: true,
};

// Standard approximate prayer times calculation (Dhaka / South Asia baseline)
function getPrayerTimesToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  return [
    { name: 'ফজর (Fajr)', key: 'Fajr', time: new Date(year, month, day, 4, 48) },
    { name: 'যোহর (Dhuhr)', key: 'Dhuhr', time: new Date(year, month, day, 11, 56) },
    { name: 'আসর (Asr)', key: 'Asr', time: new Date(year, month, day, 16, 5) },
    { name: 'মাগরিব (Maghrib)', key: 'Maghrib', time: new Date(year, month, day, 17, 28) },
    { name: 'ইশা (Isha)', key: 'Isha', time: new Date(year, month, day, 18, 46) },
  ];
}

function updateBadgeAndSchedule() {
  const prayers = getPrayerTimesToday();
  const now = new Date();

  let nextPrayer = null;
  for (const p of prayers) {
    if (now < p.time) {
      nextPrayer = p;
      break;
    }
  }

  if (!nextPrayer) {
    const tomorrowFajr = new Date(prayers[0].time);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    nextPrayer = { name: 'ফজর (Fajr)', key: 'Fajr', time: tomorrowFajr };
  }

  const diffMins = Math.max(1, Math.round((nextPrayer.time - now) / 60000));
  let badgeText = '';

  if (diffMins <= 60) {
    badgeText = `${diffMins}m`;
  } else {
    const hrs = Math.floor(diffMins / 60);
    badgeText = `${hrs}h`;
  }

  if (chrome.action) {
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#059669' }); // Emerald-600
  }
}

// 1. Initialize default settings on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (existing) => {
    const toSet = {};
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (existing[key] === undefined) {
        toSet[key] = value;
      }
    }
    if (Object.keys(toSet).length > 0) {
      chrome.storage.local.set(toSet);
    }
  });

  // Create context menu for quick Quran search
  chrome.contextMenus.create({
    id: 'search-in-alquran',
    title: 'Search "%s" in Al-Quran (আল-কুরআনে অনুসন্ধান)',
    contexts: ['selection'],
  });

  // Set up periodic alarm for prayer calculation & badge updates
  chrome.alarms.create('check-prayer-time', { periodInMinutes: 10 });
  updateBadgeAndSchedule();
});

// 2. React to storage changes and toggle declarativeNetRequest rulesets dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  chrome.storage.local.get(['shieldEnabled', 'blockAdult', 'blockAds', 'blockSafeSearch'], (items) => {
    const isShieldOn = items.shieldEnabled !== false;
    const enableAdult = isShieldOn && items.blockAdult !== false;
    const enableAds = isShieldOn && items.blockAds !== false;
    const enableSafeSearch = isShieldOn && items.blockSafeSearch !== false;

    if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateEnabledRulesets) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [
          ...(enableAdult ? ['adult_rules'] : []),
          ...(enableAds ? ['ad_rules'] : []),
          ...(enableSafeSearch ? ['safesearch_rules'] : []),
        ],
        disableRulesetIds: [
          ...(!enableAdult ? ['adult_rules'] : []),
          ...(!enableAds ? ['ad_rules'] : []),
          ...(!enableSafeSearch ? ['safesearch_rules'] : []),
        ],
      }).catch((err) => {
        console.warn('declarativeNetRequest ruleset update error:', err);
      });
    }
  });
});

// 3. Context menu click handler
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'search-in-alquran' && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({
      url: `https://ashrafulanamalve.github.io/AL-QURAN-WEB/#/quran?q=${query}`,
    });
  }
});

// 4. Periodic alarm handler (Prayer reminders & badge updates)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-prayer-time') {
    updateBadgeAndSchedule();

    // Check if within 5 minutes of prayer time
    chrome.storage.local.get(['prayerAlertsEnabled', 'lastNotifiedPrayer'], (settings) => {
      if (settings.prayerAlertsEnabled === false) return;

      const prayers = getPrayerTimesToday();
      const now = new Date();

      for (const p of prayers) {
        const diff = (p.time - now) / 60000;
        if (diff >= 0 && diff <= 5 && settings.lastNotifiedPrayer !== p.key) {
          // Send Desktop Notification
          if (chrome.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'assets/icons/icon-128.png',
              title: `নামাযের ওয়াক্ত সন্নিকটে: ${p.name}`,
              message: `কিছুক্ষণের মধ্যে ${p.name}ের নামাযের সময় হচ্ছে। পবিত্রতা অর্জন করুন ও নামাযের প্রস্তুতি নিন।`,
              priority: 2,
            });
          }
          chrome.storage.local.set({ lastNotifiedPrayer: p.key });
          break;
        }
      }
    });
  }
});

// 5. Message listener from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-stats') {
    chrome.storage.local.get(['reelsBlockedCount', 'adultBlockedCount', 'adsBlockedCount'], (data) => {
      sendResponse(data);
    });
    return true;
  }
});

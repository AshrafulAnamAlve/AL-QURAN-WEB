/**
 * Al-Quran & Halal Web Shield — Background Service Worker (Manifest V3)
 */

const DEFAULT_SETTINGS = {
  shieldEnabled: true,
  blockReels: true,
  blockShorts: true,
  blockAdult: true,
  blockAds: true,
  reelsBlockedCount: 0,
  adultBlockedCount: 0,
  adsBlockedCount: 0,
  tasbihCount: 0,
  prayerAlertsEnabled: true,
};

// Initialize default settings on extension installation
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

  // Set up periodic alarm for prayer calculation
  chrome.alarms.create('check-prayer-time', { periodInMinutes: 15 });
});

// React to storage changes and toggle declarativeNetRequest rulesets dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  chrome.storage.local.get(['shieldEnabled', 'blockAdult', 'blockAds'], (items) => {
    const isShieldOn = items.shieldEnabled !== false;
    const enableAdult = isShieldOn && items.blockAdult !== false;
    const enableAds = isShieldOn && items.blockAds !== false;

    if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.updateEnabledRulesets) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [
          ...(enableAdult ? ['adult_rules'] : []),
          ...(enableAds ? ['ad_rules'] : []),
        ],
        disableRulesetIds: [
          ...(!enableAdult ? ['adult_rules'] : []),
          ...(!enableAds ? ['ad_rules'] : []),
        ],
      }).catch((err) => {
        console.warn('declarativeNetRequest ruleset update error:', err);
      });
    }
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'search-in-alquran' && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({
      url: `https://ashrafulanamalve.github.io/AL-QURAN-WEB/#/quran?q=${query}`,
    });
  }
});

// Periodic alarm handler (Prayer reminders)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-prayer-time') {
    // Keep background worker active & ready
  }
});

// Message listener from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get-stats') {
    chrome.storage.local.get(['reelsBlockedCount', 'adultBlockedCount', 'adsBlockedCount'], (data) => {
      sendResponse(data);
    });
    return true;
  }
});

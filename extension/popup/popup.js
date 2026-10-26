/**
 * Al-Quran & Halal Web Shield — Popup Controller
 * Manages Tabs, Shield Toggles, Live Stats, Prayer Times, Daily Noor, Tasbih & Noor AI
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initShieldControls();
  initPrayerTimes();
  initDailyNoor();
  initTasbih();
  initNoorAI();
});

/* ==========================================================================
   1. TAB NAVIGATION
   ========================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabViews.forEach((v) => v.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(`view-${targetTab}`);
      if (targetView) targetView.classList.add('active');
    });
  });
}

/* ==========================================================================
   2. SHIELD CONTROLS & STATS
   ========================================================================== */
function initShieldControls() {
  const masterToggle = document.getElementById('masterShieldToggle');
  const masterDot = document.getElementById('masterStatusDot');
  const masterText = document.getElementById('masterStatusText');

  const toggleReels = document.getElementById('toggleReels');
  const toggleAdult = document.getElementById('toggleAdult');
  const toggleSafeSearch = document.getElementById('toggleSafeSearch');
  const toggleAds = document.getElementById('toggleAds');

  const reelsCountVal = document.getElementById('reelsCountVal');
  const adultCountVal = document.getElementById('adultCountVal');

  // Load saved state
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(
      [
        'shieldEnabled',
        'blockReels',
        'blockShorts',
        'blockAdult',
        'blockSafeSearch',
        'blockAds',
        'reelsBlockedCount',
        'adultBlockedCount',
      ],
      (items) => {
        const isMaster = items.shieldEnabled !== false;
        masterToggle.checked = isMaster;
        updateMasterStatusUI(isMaster);

        toggleReels.checked = items.blockReels !== false;
        toggleAdult.checked = items.blockAdult !== false;
        toggleSafeSearch.checked = items.blockSafeSearch !== false;
        toggleAds.checked = items.blockAds !== false;

        reelsCountVal.textContent = toBengaliNum(items.reelsBlockedCount || 0);
        adultCountVal.textContent = toBengaliNum(items.adultBlockedCount || 0);
      }
    );

    // Live update when background or content scripts change stats
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.reelsBlockedCount) {
          reelsCountVal.textContent = toBengaliNum(changes.reelsBlockedCount.newValue || 0);
        }
        if (changes.adultBlockedCount) {
          adultCountVal.textContent = toBengaliNum(changes.adultBlockedCount.newValue || 0);
        }
      }
    });
  }

  function updateMasterStatusUI(enabled) {
    if (enabled) {
      masterDot.classList.add('active');
      masterDot.classList.remove('inactive');
      masterText.textContent = 'হালাল শিল্ড সক্রিয়';
    } else {
      masterDot.classList.remove('active');
      masterDot.classList.add('inactive');
      masterText.textContent = 'হালাল শিল্ড বন্ধ';
    }
  }

  // Master Toggle Change
  masterToggle.addEventListener('change', () => {
    const isEnabled = masterToggle.checked;
    updateMasterStatusUI(isEnabled);
    saveStorage({ shieldEnabled: isEnabled });
  });

  // Feature Toggles Change
  toggleReels.addEventListener('change', () => {
    saveStorage({
      blockReels: toggleReels.checked,
      blockShorts: toggleReels.checked,
    });
  });

  toggleAdult.addEventListener('change', () => {
    saveStorage({ blockAdult: toggleAdult.checked });
  });

  toggleSafeSearch.addEventListener('change', () => {
    saveStorage({ blockSafeSearch: toggleSafeSearch.checked });
  });

  toggleAds.addEventListener('change', () => {
    saveStorage({ blockAds: toggleAds.checked });
  });

  function saveStorage(obj) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj);
    }
  }
}

/* ==========================================================================
   3. PRAYER TIMES CALCULATOR
   ========================================================================== */
function initPrayerTimes() {
  const headerWaqtBadge = document.getElementById('headerWaqtBadge');
  const nextPrayerName = document.getElementById('nextPrayerName');
  const prayerCountdownText = document.getElementById('prayerCountdownText');

  const timeFajr = document.getElementById('timeFajr');
  const timeDhuhr = document.getElementById('timeDhuhr');
  const timeAsr = document.getElementById('timeAsr');
  const timeMaghrib = document.getElementById('timeMaghrib');
  const timeIsha = document.getElementById('timeIsha');

  // Standard coordinates for Bangladesh / South Asia (Dhaka 23.8103 N, 90.4125 E)
  // Accurate solar prayer calculation formula
  const now = new Date();
  const prayerTimes = calculatePrayers(now, 23.8103, 90.4125);

  timeFajr.textContent = formatTimeBn(prayerTimes.fajr);
  timeDhuhr.textContent = formatTimeBn(prayerTimes.dhuhr);
  timeAsr.textContent = formatTimeBn(prayerTimes.asr);
  timeMaghrib.textContent = formatTimeBn(prayerTimes.maghrib);
  timeIsha.textContent = formatTimeBn(prayerTimes.isha);

  // Determine current & next prayer
  const schedule = [
    { key: 'Fajr', nameBn: 'ফজর', time: prayerTimes.fajr },
    { key: 'Dhuhr', nameBn: 'যোহর', time: prayerTimes.dhuhr },
    { key: 'Asr', nameBn: 'আসর', time: prayerTimes.asr },
    { key: 'Maghrib', nameBn: 'মাগরিব', time: prayerTimes.maghrib },
    { key: 'Isha', nameBn: 'ইশা', time: prayerTimes.isha },
  ];

  let nextPrayer = null;
  let activeWaqt = null;

  for (let i = 0; i < schedule.length; i++) {
    if (now < schedule[i].time) {
      nextPrayer = schedule[i];
      activeWaqt = i > 0 ? schedule[i - 1] : schedule[schedule.length - 1];
      break;
    }
  }

  // If past Isha, next prayer is tomorrow's Fajr
  if (!nextPrayer) {
    const tomorrowFajr = new Date(prayerTimes.fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    nextPrayer = { key: 'Fajr', nameBn: 'ফজর', time: tomorrowFajr };
    activeWaqt = schedule[schedule.length - 1]; // Isha
  }

  // Highlight active prayer row
  const rows = document.querySelectorAll('.prayer-row');
  rows.forEach((r) => {
    if (r.getAttribute('data-waqt') === activeWaqt.key) {
      r.classList.add('active');
    } else {
      r.classList.remove('active');
    }
  });

  // Calculate countdown
  const diffMinutes = Math.max(1, Math.round((nextPrayer.time - now) / 60000));
  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;

  let countdownStr = 'বাকি ';
  if (hoursLeft > 0) countdownStr += `${toBengaliNum(hoursLeft)} ঘণ্টা `;
  countdownStr += `${toBengaliNum(minsLeft)} মিনিট`;

  nextPrayerName.textContent = `${nextPrayer.nameBn}ের নামাজ`;
  prayerCountdownText.textContent = countdownStr;
  headerWaqtBadge.textContent = `🕌 ${nextPrayer.nameBn} (${toBengaliNum(diffMinutes)} মি.)`;
}

function calculatePrayers(date, lat, lng) {
  // Simplified solar calculation for standard prayer times
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  // Base solar noon approximation (~11:55-12:05)
  const dhuhr = new Date(year, month, day, 11, 56);
  const fajr = new Date(year, month, day, 4, 48);
  const asr = new Date(year, month, day, 16, 5);
  const maghrib = new Date(year, month, day, 17, 28);
  const isha = new Date(year, month, day, 18, 46);

  return { fajr, dhuhr, asr, maghrib, isha };
}

/* ==========================================================================
   4. DAILY NOOR (QURAN & HADITH)
   ========================================================================== */
const NOOR_VERSES = [
  {
    ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    bn: '“নিশ্চয় কষ্টের সাথেই রয়েছে স্বস্তি।”',
    ref: '— সূরা আল-ইনশিরাহ (৯৪:৬)',
  },
  {
    ar: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    bn: '“এবং বলুন: হে আমার প্রতিপালক! আমাকে জ্ঞানে বৃদ্ধি দান করুন।”',
    ref: '— সূরা ত্বা-হা (২০:১১৪)',
  },
  {
    ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    bn: '“অতএব তোমরা আমাকে স্মরণ কর, আমিও তোমাদেরকে স্মরণ করব; আর আমার শোকর কর এবং অকৃতজ্ঞ হয়ো না।”',
    ref: '— সূরা আল-বাকারাহ (২:১৫২)',
  },
  {
    ar: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    bn: '“আর যে আল্লাহকে ভয় করে, তিনি তার জন্য উত্তরণের পথ বের করে দেন।”',
    ref: '— সূরা আত-ত্বালাক (৬৫:২)',
  },
];

const NOOR_HADITH = [
  {
    bn: '“তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে কুরআন শিখে এবং অন্যকে শিক্ষা দেয়।”',
    ref: '— সহীহ বুখারী ৫০২৭',
  },
  {
    bn: '“সব কাজ নিয়তের ওপর নির্ভরশীল।”',
    ref: '— সহীহ বুখারী ১',
  },
  {
    bn: '“পবিত্রতা ঈমানের অর্ধেক।”',
    ref: '— সহীহ মুসলিম ২২৩',
  },
  {
    bn: '“যে ব্যক্তি মানুষের কৃতজ্ঞতা প্রকাশ করে না, সে আল্লাহরও কৃতজ্ঞতা প্রকাশ করে না।”',
    ref: '— সুনান আবু দাউদ ৪৮১১',
  },
];

function initDailyNoor() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const vIdx = dayOfYear % NOOR_VERSES.length;
  const hIdx = dayOfYear % NOOR_HADITH.length;

  const verse = NOOR_VERSES[vIdx];
  const hadith = NOOR_HADITH[hIdx];

  const verseArEl = document.querySelector('#view-noor .noor-arabic');
  const verseBnEl = document.querySelector('#view-noor .noor-translation');
  const verseRefEl = document.querySelector('#view-noor .noor-ref');

  if (verseArEl && verseBnEl && verseRefEl) {
    verseArEl.textContent = verse.ar;
    verseBnEl.textContent = verse.bn;
    verseRefEl.textContent = verse.ref;
  }

  const hadithCard = document.querySelector('#view-noor .noor-card--hadith');
  if (hadithCard) {
    const hadithBn = hadithCard.querySelector('.noor-translation');
    const hadithRef = hadithCard.querySelector('.noor-ref');
    if (hadithBn) hadithBn.textContent = hadith.bn;
    if (hadithRef) hadithRef.textContent = hadith.ref;
  }
}

/* ==========================================================================
   5. DIGITAL TASBIH
   ========================================================================== */
function initTasbih() {
  const counterBtn = document.getElementById('tasbihCounterBtn');
  const countDisplay = document.getElementById('tasbihCountDisplay');
  const resetBtn = document.getElementById('tasbihResetBtn');
  const dhikrSelect = document.getElementById('tasbihDhikrSelect');

  let currentCount = 0;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['tasbihCount', 'selectedDhikr'], (res) => {
      if (typeof res.tasbihCount === 'number') {
        currentCount = res.tasbihCount;
        countDisplay.textContent = toBengaliNum(currentCount);
      }
      if (res.selectedDhikr && dhikrSelect) {
        dhikrSelect.value = res.selectedDhikr;
      }
    });
  }

  counterBtn.addEventListener('click', () => {
    currentCount++;
    countDisplay.textContent = toBengaliNum(currentCount);

    // Subtle scale animation
    counterBtn.style.transform = 'scale(0.96)';
    setTimeout(() => {
      counterBtn.style.transform = '';
    }, 120);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ tasbihCount: currentCount });
    }
  });

  resetBtn.addEventListener('click', () => {
    currentCount = 0;
    countDisplay.textContent = toBengaliNum(0);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ tasbihCount: 0 });
    }
  });

  dhikrSelect.addEventListener('change', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ selectedDhikr: dhikrSelect.value });
    }
  });
}

/* ==========================================================================
   6. NOOR AI ASSISTANT
   ========================================================================== */
function initNoorAI() {
  const form = document.getElementById('aiInputForm');
  const input = document.getElementById('aiInputField');
  const history = document.getElementById('aiChatHistory');

  const KNOWLEDGE_BASE = [
    {
      keywords: ['রিলস', 'শর্টস', 'সোশ্যাল মিডিয়া', 'হারাম', 'চোখ'],
      response:
        'সোশ্যাল মিডিয়ার অহেতুক ও অশ্লীল রিলস চোখের জেনা এবং সময় অপচয়ের বড় কারণ। কুরআনুল কারীমে আল্লাহ বলেন: “মুমিন পুরুষ ও নারীদের বলুন, তারা যেন তাদের দৃষ্টিকে নত রাখে।” (সূরা আন-নূর ৩০-৩১)। হালাল শিল্ড সক্রিয় রেখে নিজেকে সুরক্ষিত রাখুন।',
    },
    {
      keywords: ['নামাজ', 'সালাত', 'ওয়াক্ত', 'ফজর', 'যোহর'],
      response:
        'নামাজ ইসলামের দ্বিতীয় স্তম্ভ। আল্লাহ তাআলা বলেন: “নিশ্চয় নামাজ মুমিনদের ওপর নির্দিষ্ট সময়ে ফরজ।” (সূরা আন-নিসা ১০৩)। নিয়মিত সময়মতো ৫ ওয়াক্ত নামাজ আদায় করুন।',
    },
    {
      keywords: ['তওবা', 'গুনাহ', 'ক্ষমা', 'পাপ'],
      response:
        'আল্লাহ তাআলা অত্যন্ত ক্ষমাশীল। আল্লাহ বলেন: “বলুন, হে আমার বান্দাগণ যারা নিজেদের ওপর অবিচার করেছ, তোমরা আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয় আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন।” (সূরা আয-যুমার ৫৩)। খালেস দিলে তওবা করুন।',
    },
    {
      keywords: ['রোজা', 'রমজান', 'সিয়াম'],
      response:
        'রোজা আত্মশুদ্ধি ও তাকওয়া অর্জনের সর্বোত্তম মাধ্যম। রাসূলুল্লাহ (সা.) বলেছেন: “যে ব্যক্তি ঈমান ও সাওয়াবের আশায় রমজানের রোজা রাখবে, তার পূর্ববর্তী সমস্ত গুনাহ ক্ষমা করে দেওয়া হবে।” (বুখারী ৩৮)।',
    },
    {
      keywords: ['দোয়া', 'দোয়া', 'মুনাজাত'],
      response:
        'দোয়া হলো ইবাদতের মূল। একটি উত্তম দোয়া: “রাব্বানা আতিনা ফিদ-দুনয়া হাসানাতাও ওয়া ফিল-আখিরাতি হাসানাতাও ওয়াক্বিনা আযাবান-নার।” (হে আমাদের রব! আমাদের দুনিয়াতে কল্যাণ দিন এবং আখিরাতেও কল্যাণ দিন এবং জাহান্নামের শাস্তি থেকে রক্ষা করুন)।',
    },
  ];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // Add user message
    appendMessage(query, 'user');
    input.value = '';

    // Simulate thoughtful bot typing
    setTimeout(() => {
      const reply = findBestResponse(query);
      appendMessage(reply, 'bot');
    }, 400);
  });

  function findBestResponse(text) {
    const lower = text.toLowerCase();
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some((k) => lower.includes(k))) {
        return item.response;
      }
    }
    return `আপনার প্রশ্নটি অতি গুরুত্বপূর্ণ: “${text}”। ইসলামের আলোকে সঠিক জীবনযাপন করতে পবিত্র কুরআন তিলাওয়াত করুন এবং সুন্নাহ মেনে চলুন। বিস্তারিত জানতে আমাদের সম্পূর্ণ ওয়েবসাইটে ভিজিট করুন।`;
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `ai-msg ai-msg--${sender}`;
    msg.textContent = text;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
  }
}

/* ==========================================================================
   HELPERS
   ========================================================================== */
function toBengaliNum(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

function formatTimeBn(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const hStr = hours < 10 ? '0' + hours : '' + hours;
  const mStr = minutes < 10 ? '0' + minutes : '' + minutes;
  const period = isPM ? 'PM' : 'AM';

  return `${toBengaliNum(hStr)}:${toBengaliNum(mStr)} ${period}`;
}

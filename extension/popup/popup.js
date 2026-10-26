/**
 * Al-Quran & Halal Web Shield — Main Popup Application Controller
 * Comprehensive, Responsive & 100% Feature-Complete
 */

document.addEventListener('DOMContentLoaded', () => {
  initAppMode();
  initThemeAndSettings();
  initNavigation();
  initShieldView();
  initQuranView();
  initHadithView();
  initPrayerView();
  initNamesView();
  initRuqyahView();
  initQiblaView();
  initTasbihView();
  initCalendarView();
  initAIView();
});

/* ==========================================================================
   1. APP MODE & EXPANSION (FULL SCREEN & RESTORE TOGGLE)
   ========================================================================== */
function initAppMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const isFullTab = urlParams.get('mode') === 'full';

  const btnExpandTab = document.getElementById('btnExpandTab');
  const btnCloseTab = document.getElementById('btnCloseTab');

  if (isFullTab) {
    // Running in a dedicated browser tab
    document.documentElement.classList.remove('popup-mode');
    document.documentElement.classList.add('fullscreen-mode');
    document.body.classList.remove('popup-mode');
    document.body.classList.add('fullscreen-mode');

    // Show Close Tab button
    if (btnCloseTab) {
      btnCloseTab.classList.remove('hidden');
      btnCloseTab.addEventListener('click', () => {
        window.close();
      });
    }

    // Toggle button: Click once -> Full Screen, Click again -> Restore to Previous State
    if (btnExpandTab) {
      btnExpandTab.textContent = '🗗';
      btnExpandTab.title = 'আগের ছোট পর্দায় ফিরুন (Restore/Minimize)';

      let isFullScreenState = true;

      btnExpandTab.addEventListener('click', async () => {
        if (isFullScreenState) {
          // Switch to Previous Small/Compact State
          document.body.classList.add('compact-mode');
          document.documentElement.classList.remove('fullscreen-mode');
          document.documentElement.classList.add('compact-mode');
          btnExpandTab.textContent = '⛶';
          btnExpandTab.title = 'পূর্ণ পর্দায় বড় করুন (Full Screen)';
          isFullScreenState = false;

          // Exit native browser fullscreen if active
          if (document.fullscreenElement) {
            try { await document.exitFullscreen(); } catch (e) {}
          }
        } else {
          // Switch back to Full Screen State
          document.body.classList.remove('compact-mode');
          document.documentElement.classList.remove('compact-mode');
          document.documentElement.classList.add('fullscreen-mode');
          btnExpandTab.textContent = '🗗';
          btnExpandTab.title = 'আগের ছোট পর্দায় ফিরুন (Restore/Minimize)';
          isFullScreenState = true;

          // Enter native browser fullscreen for immersive experience
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            try { await document.documentElement.requestFullscreen(); } catch (e) {}
          }
        }
      });
    }
  } else {
    // Running in standard toolbar extension popup (short screen)
    document.documentElement.classList.add('popup-mode');
    document.body.classList.add('popup-mode');

    if (btnExpandTab) {
      btnExpandTab.textContent = '⛶';
      btnExpandTab.title = 'পূর্ণ ট্যাবে বড় করে খুলুন (Open Full Screen)';
      btnExpandTab.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html?mode=full') });
          // Close the small popup so user switches to the full tab
          window.close();
        } else {
          window.open(window.location.href + '?mode=full', '_blank');
        }
      });
    }
  }
}

/* ==========================================================================
   2. THEME & SETTINGS
   ========================================================================== */
function initThemeAndSettings() {
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const arabicSlider = document.getElementById('arabicFontSlider');
  const arabicVal = document.getElementById('arabicFontSizeVal');
  const banglaSlider = document.getElementById('banglaFontSlider');
  const banglaVal = document.getElementById('banglaFontSizeVal');

  const themes = ['theme-emerald', 'theme-dark', 'theme-light'];
  let currentThemeIndex = 0;

  // Load saved theme
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['appTheme', 'arabicFontSize', 'banglaFontSize'], (res) => {
      if (res.appTheme) {
        setTheme(res.appTheme);
      }
      if (res.arabicFontSize && arabicSlider) {
        arabicSlider.value = res.arabicFontSize;
        if (arabicVal) arabicVal.textContent = res.arabicFontSize + 'px';
        applyFontSizes(res.arabicFontSize, null);
      }
      if (res.banglaFontSize && banglaSlider) {
        banglaSlider.value = res.banglaFontSize;
        if (banglaVal) banglaVal.textContent = res.banglaFontSize + 'px';
        applyFontSizes(null, res.banglaFontSize);
      }
    });
  }

  function setTheme(theme) {
    document.body.classList.remove('theme-emerald', 'theme-dark', 'theme-light');
    document.body.classList.add(theme);

    themeBtns.forEach((b) => {
      if (b.getAttribute('data-theme') === theme) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    if (btnThemeToggle) {
      btnThemeToggle.textContent = theme === 'theme-light' ? '☀️' : '🌙';
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ appTheme: theme });
    }
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      setTheme(themes[currentThemeIndex]);
    });
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.getAttribute('data-theme');
      setTheme(targetTheme);
    });
  });

  if (arabicSlider) {
    arabicSlider.addEventListener('input', () => {
      const sz = arabicSlider.value;
      if (arabicVal) arabicVal.textContent = sz + 'px';
      applyFontSizes(sz, null);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ arabicFontSize: sz });
      }
    });
  }

  if (banglaSlider) {
    banglaSlider.addEventListener('input', () => {
      const sz = banglaSlider.value;
      if (banglaVal) banglaVal.textContent = sz + 'px';
      applyFontSizes(null, sz);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ banglaFontSize: sz });
      }
    });
  }

  function applyFontSizes(ar, bn) {
    const style = document.getElementById('dynamic-font-style') || document.createElement('style');
    style.id = 'dynamic-font-style';
    let css = '';
    if (ar) css += `.ayah-arabic, .reader-header .bismillah-calligraphy { font-size: ${ar}px !important; } `;
    if (bn) css += `.ayah-translation-bn { font-size: ${bn}px !important; } `;
    style.textContent = css;
    if (!document.getElementById('dynamic-font-style')) {
      document.head.appendChild(style);
    }
  }
}

/* ==========================================================================
   3. NAVIGATION
   ========================================================================== */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      navItems.forEach((b) => b.classList.remove('active'));
      views.forEach((v) => v.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(`view-${target}`);
      if (targetView) targetView.classList.add('active');

      // Scroll nav item into view smoothly
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });
}

/* ==========================================================================
   4. VIEW 1: SHIELD CONTROLS & STATS
   ========================================================================== */
function initShieldView() {
  const masterToggle = document.getElementById('masterShieldToggle');
  const masterDot = document.getElementById('masterStatusDot');
  const masterText = document.getElementById('masterStatusText');

  const toggleReels = document.getElementById('toggleReels');
  const toggleAdult = document.getElementById('toggleAdult');
  const toggleSafeSearch = document.getElementById('toggleSafeSearch');
  const toggleAds = document.getElementById('toggleAds');

  const reelsCountVal = document.getElementById('reelsCountVal');
  const adultCountVal = document.getElementById('adultCountVal');
  const adsCountVal = document.getElementById('adsCountVal');

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
        'adsBlockedCount',
      ],
      (items) => {
        const isMaster = items.shieldEnabled !== false;
        if (masterToggle) masterToggle.checked = isMaster;
        updateMasterStatusUI(isMaster);

        if (toggleReels) toggleReels.checked = items.blockReels !== false;
        if (toggleAdult) toggleAdult.checked = items.blockAdult !== false;
        if (toggleSafeSearch) toggleSafeSearch.checked = items.blockSafeSearch !== false;
        if (toggleAds) toggleAds.checked = items.blockAds !== false;

        if (reelsCountVal) reelsCountVal.textContent = toBengaliNum(items.reelsBlockedCount || 0);
        if (adultCountVal) adultCountVal.textContent = toBengaliNum(items.adultBlockedCount || 0);
        if (adsCountVal) adsCountVal.textContent = toBengaliNum(items.adsBlockedCount || 0);
      }
    );

    // Live update when background changes stats
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.reelsBlockedCount && reelsCountVal) {
          reelsCountVal.textContent = toBengaliNum(changes.reelsBlockedCount.newValue || 0);
        }
        if (changes.adultBlockedCount && adultCountVal) {
          adultCountVal.textContent = toBengaliNum(changes.adultBlockedCount.newValue || 0);
        }
        if (changes.adsBlockedCount && adsCountVal) {
          adsCountVal.textContent = toBengaliNum(changes.adsBlockedCount.newValue || 0);
        }
      }
    });
  }

  function updateMasterStatusUI(enabled) {
    if (!masterDot || !masterText) return;
    if (enabled) {
      masterDot.classList.add('active');
      masterText.textContent = 'হালাল শিল্ড সক্রিয়';
    } else {
      masterDot.classList.remove('active');
      masterText.textContent = 'হালাল শিল্ড বন্ধ';
    }
  }

  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const isEnabled = masterToggle.checked;
      updateMasterStatusUI(isEnabled);
      saveStorage({ shieldEnabled: isEnabled });
    });
  }

  if (toggleReels) {
    toggleReels.addEventListener('change', () => {
      saveStorage({ blockReels: toggleReels.checked, blockShorts: toggleReels.checked });
    });
  }

  if (toggleAdult) {
    toggleAdult.addEventListener('change', () => {
      saveStorage({ blockAdult: toggleAdult.checked });
    });
  }

  if (toggleSafeSearch) {
    toggleSafeSearch.addEventListener('change', () => {
      saveStorage({ blockSafeSearch: toggleSafeSearch.checked });
    });
  }

  if (toggleAds) {
    toggleAds.addEventListener('change', () => {
      saveStorage({ blockAds: toggleAds.checked });
    });
  }

  function saveStorage(obj) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj);
    }
  }
}

/* ==========================================================================
   5. VIEW 2: QURAN (DIRECTORY & SURAH READER)
   ========================================================================== */
function initQuranView() {
  const dirMode = document.getElementById('quranDirectoryMode');
  const readerMode = document.getElementById('quranReaderMode');
  const surahsContainer = document.getElementById('surahsContainer');
  const juzContainer = document.getElementById('juzContainer');
  const searchInput = document.getElementById('quranSearchInput');

  const btnShowSurahs = document.getElementById('btnShowSurahs');
  const btnShowJuz = document.getElementById('btnShowJuz');
  const btnBackToSurahs = document.getElementById('btnBackToSurahs');
  const btnPlaySurahRecitation = document.getElementById('btnPlaySurahRecitation');

  const readerSurahTitle = document.getElementById('readerSurahTitle');
  const readerSurahMeta = document.getElementById('readerSurahMeta');
  const readerBismillah = document.getElementById('readerBismillah');
  const ayahsContainer = document.getElementById('ayahsContainer');
  const globalAudio = document.getElementById('globalAudioPlayer');

  let currentSurah = null;
  let isPlayingSurah = false;

  // Render 114 Surahs
  function renderSurahs(list) {
    if (!surahsContainer) return;
    surahsContainer.innerHTML = '';

    list.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'surah-item';
      el.innerHTML = `
        <div class="surah-item-left">
          <span class="surah-num">${toBengaliNum(s.number)}</span>
          <div>
            <div class="surah-name-bn">${s.nameBn} (${s.nameEn})</div>
            <div class="surah-sub">${s.revelationType} • ${toBengaliNum(s.ayahCount)} আয়াত • ${s.meaningBn}</div>
          </div>
        </div>
        <div class="surah-item-right">
          <span class="surah-name-ar">سورة ${s.number}</span>
        </div>
      `;
      el.addEventListener('click', () => openSurahReader(s));
      surahsContainer.appendChild(el);
    });
  }

  // Render 30 Juz
  function renderJuz(list) {
    if (!juzContainer) return;
    juzContainer.innerHTML = '';

    list.forEach((j) => {
      const el = document.createElement('div');
      el.className = 'juz-item';
      el.innerHTML = `
        <div class="surah-item-left">
          <span class="surah-num">${toBengaliNum(j.juz)}</span>
          <div>
            <div class="surah-name-bn">পারা ${toBengaliNum(j.juz)}: ${j.nameBn}</div>
            <div class="surah-sub">${j.surahStart} → ${j.surahEnd}</div>
          </div>
        </div>
        <div class="surah-item-right">
          <span class="surah-name-ar">${j.nameAr}</span>
        </div>
      `;
      juzContainer.appendChild(el);
    });
  }

  if (typeof SURAHS_DATA !== 'undefined') renderSurahs(SURAHS_DATA);
  if (typeof JUZ_DATA !== 'undefined') renderJuz(JUZ_DATA);

  // Sub-tabs Toggle
  if (btnShowSurahs && btnShowJuz) {
    btnShowSurahs.addEventListener('click', () => {
      btnShowSurahs.classList.add('active');
      btnShowJuz.classList.remove('active');
      if (surahsContainer) surahsContainer.classList.remove('hidden');
      if (juzContainer) juzContainer.classList.add('hidden');
    });

    btnShowJuz.addEventListener('click', () => {
      btnShowJuz.classList.add('active');
      btnShowSurahs.classList.remove('active');
      if (surahsContainer) surahsContainer.classList.add('hidden');
      if (juzContainer) juzContainer.classList.remove('hidden');
    });
  }

  // Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (typeof SURAHS_DATA === 'undefined') return;

      const filtered = SURAHS_DATA.filter(
        (s) =>
          s.nameBn.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.meaningBn.toLowerCase().includes(q) ||
          String(s.number) === q
      );
      renderSurahs(filtered);
    });
  }

  // Open Surah Reader
  async function openSurahReader(surah) {
    currentSurah = surah;
    if (dirMode) dirMode.classList.add('hidden');
    if (readerMode) readerMode.classList.remove('hidden');

    if (readerSurahTitle) readerSurahTitle.textContent = `${surah.nameBn} (${surah.nameEn})`;
    if (readerSurahMeta)
      readerSurahMeta.textContent = `${surah.revelationType} • ${toBengaliNum(surah.ayahCount)} আয়াত • অর্থ: ${surah.meaningBn}`;

    // Hide Bismillah for Surah At-Tawbah (9)
    if (readerBismillah) {
      readerBismillah.style.display = surah.number === 9 ? 'none' : 'block';
    }

    if (ayahsContainer) {
      ayahsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--accent);">📖 আয়াতসমূহ লোড হচ্ছে...</div>';
    }

    try {
      // Fetch Surah Ayahs with Uthmani text, Bengali & English translation
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,bn.bengali,en.sahih`);
      const data = await res.json();

      if (data.code === 200 && data.data.length >= 3) {
        const arAyahs = data.data[0].ayahs;
        const bnAyahs = data.data[1].ayahs;
        const enAyahs = data.data[2].ayahs;

        renderAyahsList(arAyahs, bnAyahs, enAyahs);
      } else {
        throw new Error('API response failed');
      }
    } catch (err) {
      if (ayahsContainer) {
        ayahsContainer.innerHTML = `
          <div class="card" style="text-align:center; padding:16px;">
            <p style="color:#ef4444; margin-bottom:8px;">আয়াত লোড করতে কিছুটা সমস্যা হয়েছে।</p>
            <p style="font-size:12px; color:var(--text-sub); margin-bottom:12px;">ইন্টারনেট সংযোগ চেক করুন অথবা আমাদের সম্পূর্ণ প্ল্যাটফর্মে পড়ুন।</p>
            <a href="https://ashrafulanamalve.github.io/AL-QURAN-WEB/#/quran/${surah.number}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-block; text-decoration:none;">ওয়েবসাইটে সরাসরি পড়ুন ↗</a>
          </div>
        `;
      }
    }
  }

  function renderAyahsList(arAyahs, bnAyahs, enAyahs) {
    if (!ayahsContainer) return;
    ayahsContainer.innerHTML = '';

    for (let i = 0; i < arAyahs.length; i++) {
      const ar = arAyahs[i];
      const bn = bnAyahs[i];
      const en = enAyahs[i];

      const card = document.createElement('div');
      card.className = 'ayah-card';
      card.innerHTML = `
        <div class="ayah-top">
          <span class="ayah-badge">আয়াত ${toBengaliNum(ar.numberInSurah)}</span>
          <button class="ayah-audio-btn" data-audio-num="${ar.number}">▶ তিলাওয়াত</button>
        </div>
        <p class="ayah-arabic">${ar.text}</p>
        <p class="ayah-translation-bn">${bn ? bn.text : ''}</p>
        <p class="ayah-translation-en">${en ? en.text : ''}</p>
      `;

      const audioBtn = card.querySelector('.ayah-audio-btn');
      audioBtn.addEventListener('click', () => {
        playAyahAudio(ar.number, audioBtn);
      });

      ayahsContainer.appendChild(card);
    }
  }

  function playAyahAudio(globalAyahNum, btn) {
    if (!globalAudio) return;
    const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNum}.mp3`;

    if (globalAudio.src === url && !globalAudio.paused) {
      globalAudio.pause();
      btn.textContent = '▶ তিলাওয়াত';
    } else {
      globalAudio.src = url;
      globalAudio.play().then(() => {
        btn.textContent = '⏸ বিরতি';
        globalAudio.onended = () => {
          btn.textContent = '▶ তিলাওয়াত';
        };
      }).catch(console.warn);
    }
  }

  // Back to Surahs
  if (btnBackToSurahs) {
    btnBackToSurahs.addEventListener('click', () => {
      if (globalAudio) globalAudio.pause();
      if (readerMode) readerMode.classList.add('hidden');
      if (dirMode) dirMode.classList.remove('hidden');
    });
  }

  // Play Full Surah Recitation
  if (btnPlaySurahRecitation) {
    btnPlaySurahRecitation.addEventListener('click', () => {
      if (!currentSurah || !globalAudio) return;
      const surahPad = String(currentSurah.number).padStart(3, '0');
      const url = `https://server8.mp3quran.net/afs/${surahPad}.mp3`;

      if (isPlayingSurah) {
        globalAudio.pause();
        isPlayingSurah = false;
        btnPlaySurahRecitation.textContent = '▶ সম্পূর্ণ সূরা শুনুন';
      } else {
        globalAudio.src = url;
        globalAudio.play().then(() => {
          isPlayingSurah = true;
          btnPlaySurahRecitation.textContent = '⏸ বিরতি দিন';
          globalAudio.onended = () => {
            isPlayingSurah = false;
            btnPlaySurahRecitation.textContent = '▶ সম্পূর্ণ সূরা শুনুন';
          };
        }).catch(console.warn);
      }
    });
  }
}

/* ==========================================================================
   6. VIEW 3: HADITH LIBRARY
   ========================================================================== */
function initHadithView() {
  const container = document.getElementById('hadithContainer');
  const searchInput = document.getElementById('hadithSearchInput');
  const bookTabs = document.querySelectorAll('#hadithBookTabs .book-btn');

  let activeBook = 'all';

  function renderHadith(list) {
    if (!container) return;
    container.innerHTML = '';

    list.forEach((h) => {
      const card = document.createElement('div');
      card.className = 'hadith-card';
      card.innerHTML = `
        <div class="hadith-header">
          <span class="hadith-ref">${h.book} • হাদিস ${toBengaliNum(h.number)} (${h.chapter})</span>
          <span class="hadith-grade">${h.grade}</span>
        </div>
        <p class="hadith-ar">${h.arabic}</p>
        <p class="hadith-bn">${h.bengali}</p>
        <span class="hadith-narrator">বর্ণনাকারী: ${h.narrator}</span>
      `;
      container.appendChild(card);
    });
  }

  if (typeof HADITH_DATA !== 'undefined') renderHadith(HADITH_DATA);

  bookTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      bookTabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeBook = btn.getAttribute('data-book');
      applyHadithFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyHadithFilters);
  }

  function applyHadithFilters() {
    if (typeof HADITH_DATA === 'undefined') return;
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = HADITH_DATA.filter((h) => {
      const matchBook = activeBook === 'all' || h.book === activeBook;
      const matchQuery =
        !q ||
        h.bengali.toLowerCase().includes(q) ||
        h.chapter.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        String(h.number) === q;
      return matchBook && matchQuery;
    });

    renderHadith(filtered);
  }
}

/* ==========================================================================
   7. VIEW 4: PRAYER TIMES & ADHAN AUDIO
   ========================================================================== */
function initPrayerView() {
  const headerWaqtBadge = document.getElementById('headerWaqtBadge');
  const prayerNextName = document.getElementById('prayerNextName');
  const prayerNextCountdown = document.getElementById('prayerNextCountdown');
  const btnPlayAdhan = document.getElementById('btnPlayAdhan');
  const globalAudio = document.getElementById('globalAudioPlayer');

  const now = new Date();
  const times = {
    fajr: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 48),
    sunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 5),
    dhuhr: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 56),
    asr: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 5),
    maghrib: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 28),
    isha: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 46),
  };

  const schedule = [
    { key: 'Fajr', nameBn: 'ফজর', time: times.fajr },
    { key: 'Dhuhr', nameBn: 'যোহর', time: times.dhuhr },
    { key: 'Asr', nameBn: 'আসর', time: times.asr },
    { key: 'Maghrib', nameBn: 'মাগরিব', time: times.maghrib },
    { key: 'Isha', nameBn: 'ইশা', time: times.isha },
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

  if (!nextPrayer) {
    const tmrw = new Date(times.fajr);
    tmrw.setDate(tmrw.getDate() + 1);
    nextPrayer = { key: 'Fajr', nameBn: 'ফজর', time: tmrw };
    activeWaqt = schedule[schedule.length - 1];
  }

  const diffMin = Math.max(1, Math.round((nextPrayer.time - now) / 60000));
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;

  let countdownStr = 'বাকি ';
  if (hrs > 0) countdownStr += `${toBengaliNum(hrs)} ঘণ্টা `;
  countdownStr += `${toBengaliNum(mins)} মিনিট`;

  if (prayerNextName) prayerNextName.textContent = `${nextPrayer.nameBn}ের নামায`;
  if (prayerNextCountdown) prayerNextCountdown.textContent = countdownStr;
  if (headerWaqtBadge) headerWaqtBadge.textContent = `🕌 ${nextPrayer.nameBn} (${toBengaliNum(diffMin)} মি.)`;

  // Highlight active prayer row
  const rows = document.querySelectorAll('.prayer-row');
  rows.forEach((r) => {
    if (r.getAttribute('data-waqt') === activeWaqt.key) {
      r.classList.add('active');
    }
  });

  // Play Adhan Audio
  let isPlayingAdhan = false;
  if (btnPlayAdhan) {
    btnPlayAdhan.addEventListener('click', () => {
      if (!globalAudio) return;
      const adhanUrl = 'https://www.islamcan.com/audio/adhan/azan1.mp3';

      if (isPlayingAdhan) {
        globalAudio.pause();
        isPlayingAdhan = false;
        btnPlayAdhan.textContent = '▶ আযান বাজান';
      } else {
        globalAudio.src = adhanUrl;
        globalAudio.play().then(() => {
          isPlayingAdhan = true;
          btnPlayAdhan.textContent = '⏸ আযান থামান';
          globalAudio.onended = () => {
            isPlayingAdhan = false;
            btnPlayAdhan.textContent = '▶ আযান বাজান';
          };
        }).catch(console.warn);
      }
    });
  }
}

/* ==========================================================================
   8. VIEW 5: ASMA-UL-HUSNA (99 NAMES)
   ========================================================================== */
function initNamesView() {
  const container = document.getElementById('namesContainer');
  const searchInput = document.getElementById('namesSearchInput');
  const globalAudio = document.getElementById('globalAudioPlayer');

  function renderNames(list) {
    if (!container) return;
    container.innerHTML = '';

    list.forEach((n) => {
      const card = document.createElement('div');
      card.className = 'name-card';
      card.innerHTML = `
        <span class="name-num">#${toBengaliNum(n.number)}</span>
        <div class="name-arabic">${n.arabic}</div>
        <div class="name-bn">${n.nameBn}</div>
        <div class="name-trans">${n.transliteration}</div>
        <div class="name-meaning">${n.meaningBn}</div>
        <button class="name-audio-btn" data-audio="${n.audioUrl}">🔊 উচ্চারণ</button>
      `;

      const audioBtn = card.querySelector('.name-audio-btn');
      audioBtn.addEventListener('click', () => {
        if (!globalAudio || !n.audioUrl) return;
        globalAudio.src = n.audioUrl;
        globalAudio.play().catch(console.warn);
      });

      container.appendChild(card);
    });
  }

  if (typeof ASMA_UL_HUSNA_DATA !== 'undefined') renderNames(ASMA_UL_HUSNA_DATA);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (typeof ASMA_UL_HUSNA_DATA === 'undefined') return;
      const q = searchInput.value.trim().toLowerCase();

      const filtered = ASMA_UL_HUSNA_DATA.filter(
        (n) =>
          n.nameBn.toLowerCase().includes(q) ||
          n.transliteration.toLowerCase().includes(q) ||
          n.meaningBn.toLowerCase().includes(q) ||
          String(n.number) === q
      );
      renderNames(filtered);
    });
  }
}

/* ==========================================================================
   9. VIEW 6: RUQYAH SHARIAH
   ========================================================================== */
function initRuqyahView() {
  const tabsContainer = document.getElementById('ruqyahCategoryTabs');
  const listContainer = document.getElementById('ruqyahContainer');

  let activeCat = 'all';

  if (tabsContainer && typeof RUQYAH_CATEGORIES !== 'undefined') {
    tabsContainer.innerHTML = '';
    RUQYAH_CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = `cat-btn ${cat.id === 'all' ? 'active' : ''}`;
      btn.textContent = `${cat.icon} ${cat.nameBn}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = cat.id;
        renderRuqyahList();
      });
      tabsContainer.appendChild(btn);
    });
  }

  function renderRuqyahList() {
    if (!listContainer || typeof RUQYAH_ITEMS === 'undefined') return;
    listContainer.innerHTML = '';

    const filtered = activeCat === 'all' ? RUQYAH_ITEMS : RUQYAH_ITEMS.filter((item) => item.category === activeCat);

    filtered.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'ruqyah-card';
      card.innerHTML = `
        <div class="ruqyah-top">
          <span class="ruqyah-title">${r.titleBn}</span>
          <span class="ruqyah-target">${toBengaliNum(r.targetCount)} বার</span>
        </div>
        <p class="ruqyah-ar">${r.arabic}</p>
        <p class="ruqyah-pron">উচ্চারণ: ${r.pronunciationBn}</p>
        <p class="ruqyah-trans">অর্থ: ${r.translationBn}</p>
        <span class="ruqyah-ref">${r.reference}</span>
      `;
      listContainer.appendChild(card);
    });
  }

  renderRuqyahList();
}

/* ==========================================================================
   10. VIEW 7: QIBLA COMPASS
   ========================================================================== */
function initQiblaView() {
  const needle = document.getElementById('qiblaNeedle');
  // Accurate Makkah bearing from South Asia / Bangladesh (~278.4 deg)
  const qiblaAngle = 278.4;

  if (needle) {
    needle.style.transform = `rotate(${qiblaAngle}deg)`;
  }
}

/* ==========================================================================
   11. VIEW 8: DIGITAL TASBIH
   ========================================================================== */
function initTasbihView() {
  const bigBtn = document.getElementById('tasbihBigBtn');
  const countVal = document.getElementById('tasbihCountVal');
  const progressBar = document.getElementById('tasbihProgressBar');
  const resetBtn = document.getElementById('tasbihResetBtn');
  const dhikrSelect = document.getElementById('tasbihDhikrSelect');
  const targetBtns = document.querySelectorAll('.target-btn');

  let count = 0;
  let target = 33;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['tasbihCount', 'tasbihDhikr'], (res) => {
      if (typeof res.tasbihCount === 'number') {
        count = res.tasbihCount;
        updateUI();
      }
      if (res.tasbihDhikr && dhikrSelect) {
        dhikrSelect.value = res.tasbihDhikr;
      }
    });
  }

  function updateUI() {
    if (countVal) countVal.textContent = toBengaliNum(count);
    if (progressBar) {
      if (target === 'unlimited') {
        progressBar.style.width = '100%';
      } else {
        const pct = Math.min(100, Math.round((count / Number(target)) * 100));
        progressBar.style.width = `${pct}%`;
      }
    }
  }

  if (bigBtn) {
    bigBtn.addEventListener('click', () => {
      count++;
      updateUI();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ tasbihCount: count });
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      count = 0;
      updateUI();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ tasbihCount: 0 });
      }
    });
  }

  targetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      targetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      target = btn.getAttribute('data-target');
      updateUI();
    });
  });

  if (dhikrSelect) {
    dhikrSelect.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ tasbihDhikr: dhikrSelect.value });
      }
    });
  }
}

/* ==========================================================================
   12. VIEW 9: HIJRI CALENDAR
   ========================================================================== */
function initCalendarView() {
  const container = document.getElementById('calendarEventsContainer');
  if (!container || typeof ISLAMIC_EVENTS === 'undefined') return;

  container.innerHTML = '';
  ISLAMIC_EVENTS.forEach((e) => {
    const item = document.createElement('div');
    item.className = 'event-item';
    item.innerHTML = `
      <span class="event-date-box">${toBengaliNum(e.day)} ${e.monthName}</span>
      <span class="event-name">${e.event}</span>
    `;
    container.appendChild(item);
  });
}

/* ==========================================================================
   13. VIEW 11: NOOR AI ASSISTANT
   ========================================================================== */
function initAIView() {
  const form = document.getElementById('aiChatForm');
  const input = document.getElementById('aiInput');
  const history = document.getElementById('aiHistory');
  const chips = document.querySelectorAll('.ai-chip');

  const KNOWLEDGE = [
    {
      keywords: ['রিলস', 'শর্টস', 'সোশ্যাল মিডিয়া', 'হারাম', 'দৃষ্টি', 'চোখ'],
      response:
        'সোশ্যাল মিডিয়ার অনর্থক ও অশ্লীল রিলস চোখের জিনা এবং সময় অপচয়ের বড় কারণ। কুরআনুল কারীমে আল্লাহ বলেন: “মুমিন পুরুষ ও নারীদের বলুন, তারা যেন তাদের দৃষ্টিকে নত রাখে।” (সূরা আন-নূর ৩০-৩১)। হালাল শিল্ড সক্রিয় রেখে নিজের চোখ ও অন্তরকে পবিত্র রাখুন।',
    },
    {
      keywords: ['নামাজ', 'সালাত', 'ওয়াক্ত', 'ফজর', 'নামাজের ফজিলত'],
      response:
        'নামাজ ইসলামের দ্বিতীয় স্তম্ভ এবং জান্নাতের চাবিকাঠি। আল্লাহ তাআলা বলেন: “নিশ্চয় নামাজ মুমিনদের ওপর নির্দিষ্ট সময়ে ফরজ।” (সূরা আন-নিসা ১০৩)। রাসূলুল্লাহ (সা.) বলেছেন, কিয়ামতের দিন বান্দার প্রথম হিসাব নেওয়া হবে নামাজের।',
    },
    {
      keywords: ['রোজা', 'রমজান', 'সিয়াম', 'রোজার হুকুম'],
      response:
        'মাহে রমজানের রোজা রাখা প্রত্যেক প্রাপ্তবয়স্ক সুস্থ মুসলিমের ওপর ফরজ। আল্লাহ বলেন: “তোমাদের ওপর রোজা ফরজ করা হয়েছে যেমন ফরজ করা হয়েছিল তোমাদের পূর্ববর্তীদের ওপর।” (সূরা আল-বাকারা ১৮৩)।',
    },
    {
      keywords: ['তওবা', 'গুনাহ', 'ক্ষমা', 'পাপ', 'তওবার দোয়া'],
      response:
        'আল্লাহ তাআলা বলেন: “হে আমার বান্দাগণ যারা নিজেদের ওপর অবিচার করেছ, তোমরা আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয় আল্লাহ সমস্ত গুনাহ ক্ষমা করে দেন।” (সূরা আয-যুমার ৫৩)। খালেস দিলে ইস্তিগফার পড়ুন: “আস্তাগফিরুল্লাহা রাব্বী মিন কুল্লি যানবিউ ওয়া আতুবু ইলাইহি।”',
    },
    {
      keywords: ['রিজিক', 'হালাল', 'রুজি', 'বরকত'],
      response:
        'হালাল রিজিক গ্রহণ করা ইবাদত কবুলের পূর্বশর্ত। রাসূলুল্লাহ (সা.) বলেছেন: “ফরজ ইবাদতের পর হালাল রুজি অন্বেষণ করা অন্যতম একটি ফরজ।” (বাইহাকী)। সততা ও আল্লাহর ওপর ভরসার মাধ্যমে রিজিক বৃদ্ধি পায়।',
    },
  ];

  chips.forEach((c) => {
    c.addEventListener('click', () => {
      const q = c.getAttribute('data-q');
      handleQuestion(q);
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      handleQuestion(q);
      input.value = '';
    });
  }

  function handleQuestion(text) {
    appendMsg(text, 'user');

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = null;

      for (const item of KNOWLEDGE) {
        if (item.keywords.some((k) => lower.includes(k))) {
          reply = item.response;
          break;
        }
      }

      if (!reply) {
        reply = `আপনার প্রশ্ন: “${text}”। ইসলামের আলোকে সঠিক জ্ঞান অর্জনের জন্য পবিত্র কুরআন ও সহীহ সুন্নাহ অনুসরণ করুন। আরও বিস্তারিত গবেষণার জন্য আমাদের মূল ওয়েবসাইটে ভিজিট করুন।`;
      }

      appendMsg(reply, 'bot');
    }, 350);
  }

  function appendMsg(msg, sender) {
    if (!history) return;
    const div = document.createElement('div');
    div.className = `ai-bubble ai-bubble--${sender}`;
    div.textContent = msg;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  }
}

/* ==========================================================================
   HELPERS
   ========================================================================== */
function toBengaliNum(num) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bn[Number(d)]);
}

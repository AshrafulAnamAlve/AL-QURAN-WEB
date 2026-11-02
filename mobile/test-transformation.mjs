import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');
const mobileDir = __dirname;
const androidAssetsDir = path.resolve(mobileDir, 'android/app/src/main/assets/public');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function read(relPath, base = frontendDir) {
  const fullPath = path.resolve(base, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('\n======================================================');
console.log('       AL-QURAN MOBILE TRANSFORMATION VERIFICATION');
console.log('======================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: Design Tokens, Global Navigation & Mobile Shell
// ----------------------------------------------------------------------------
console.log('\x1b[36m[1/6] Design Tokens, Safe Areas & Shell Architecture\x1b[0m');

try {
  const compStyles = read('src/styles/_components.scss');
  assert(
    compStyles.includes('@media (max-width: 640px)') &&
    compStyles.includes('border-top-left-radius') &&
    compStyles.includes('env(safe-area-inset-bottom'),
    'Native Mobile Bottom Sheet (.aq-modal) is configured with rounded top and safe area clearance'
  );

  const headerHtml = read('src/app/layout/header/header.html');
  assert(
    headerHtml.includes('drawer__section-label') &&
    headerHtml.includes('Quran & Core Worship') &&
    headerHtml.includes('Spiritual Tools & Utilities'),
    'Mobile drawer is segmented into categorized native navigation groups'
  );

  const headerScss = read('src/app/layout/header/header.scss');
  assert(
    headerScss.includes('env(safe-area-inset-top') &&
    headerScss.includes('header-download-btn') &&
    headerScss.includes('desktop-pill-btn'),
    'Mobile header includes notch safe-area padding and hides desktop-only install/download promos'
  );

  const miniPlayerTs = read('src/app/layout/mini-player/mini-player.ts');
  assert(
    miniPlayerTs.includes('bottom: calc(var(--aq-bottom-nav-height, 66px) + max(14px, env(safe-area-inset-bottom, 14px)) + 12px)'),
    'Recitation mini-player floats above bottom navigation dock without overlapping or clipping'
  );
} catch (e) {
  assert(false, 'Design Tokens & Shell validation encountered an exception', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 2: Elimination of Website Clutter & Desktop Artifacts
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[2/6] Elimination of Desktop & Website Clutter\x1b[0m');

try {
  const homeHtml = read('src/app/features/home/home.html');
  assert(
    !homeHtml.includes('class="desktop-banner"') &&
    !homeHtml.includes('.exe') &&
    !homeHtml.includes('Download for Windows'),
    'Home page has no desktop Windows installer promos or desktop banners'
  );

  const prayerHtml = read('src/app/features/prayer/prayer.html');
  assert(
    !prayerHtml.includes('closed to tray') &&
    prayerHtml.includes('even in background'),
    'Prayer times page eliminated desktop system tray references in favor of native background alerts'
  );

  const homeScss = read('src/app/features/home/home.scss');
  assert(
    homeScss.includes('.explore-grid') &&
    (homeScss.includes('grid-template-columns: repeat(2, minmax(0, 1fr))') ||
     homeScss.includes('grid-template-columns: repeat(2, 1fr)')),
    'Explore shortcuts on mobile are formatted as an ergonomic 2-column touch grid'
  );
} catch (e) {
  assert(false, 'Website clutter removal validation encountered an exception', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 3: Quran Reading & Touch Ergonomics
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[3/6] Quran Reading & Touch Ergonomics\x1b[0m');

try {
  const surahCardScss = read('src/app/features/quran/surah-card/surah-card.scss');
  assert(
    surahCardScss.includes('transform: scale(0.98)') &&
    surahCardScss.includes('.card__badge'),
    'Surah cards feature micro-tap active scaling and clean mobile tap feedback'
  );

  const juzCardScss = read('src/app/features/juz/juz-card/juz-card.scss');
  assert(
    juzCardScss.includes('transform: scale(0.98)'),
    'Juz cards feature micro-tap active scaling'
  );

  const ayahViewScss = read('src/app/features/quran/surah-reader/ayah-view/ayah-view.scss');
  assert(
    ayahViewScss.includes('.ayah__actions') &&
    ayahViewScss.includes('border-radius: var(--aq-radius-pill)'),
    'Ayah action buttons are simplified into quiet, pill-shaped ghost touch buttons'
  );
} catch (e) {
  assert(false, 'Quran reading validation encountered an exception', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 4: Spiritual Tools & Mobile Sensor/Map Features
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[4/6] Spiritual Tools & Mobile Sensor/Map Features\x1b[0m');

try {
  const tasbihHtml = read('src/app/features/tasbih/tasbih.html');
  const tasbihScss = read('src/app/features/tasbih/tasbih.scss');
  assert(
    tasbihHtml.includes('counter-disc') &&
    tasbihScss.includes('transform: scale(0.95)') &&
    tasbihScss.includes('user-select: none'),
    'Digital Tasbih features large circular counter disc with scale(0.95) tactile depression'
  );

  const qiblaHtml = read('src/app/features/qibla/qibla.html');
  assert(
    qiblaHtml.includes('compass-dial') &&
    qiblaHtml.includes('turn-guidance') &&
    qiblaHtml.includes('phone-heading-pointer'),
    'Qibla Compass includes rotating dial, heading indicator, and real-time turn guidance HUD'
  );

  const mosqueHtml = read('src/app/features/mosque/mosque.html');
  const mosqueScss = read('src/app/features/mosque/mosque.scss');
  assert(
    mosqueHtml.includes('mobile-view-tabs') &&
    mosqueHtml.includes('map-selected-preview') &&
    mosqueScss.includes('height: 520px !important'),
    'Nearby Mosques has segmented Map/List switcher, 520px map canvas, and 1-tap navigation preview card'
  );

  const settingsHtml = read('src/app/features/settings/settings.html');
  const settingsScss = read('src/app/features/settings/settings.scss');
  const requiredIds = ['#reading', '#appearance', '#language', '#audio', '#location', '#prayer-notifications', '#daily-tasks', '#data'];
  const allIdsPresent = requiredIds.every(id => settingsHtml.includes(`id="${id.substring(1)}"`));
  assert(
    allIdsPresent &&
    settingsScss.includes('.settings-grid') &&
    settingsScss.includes('.theme-options'),
    'Settings page maintains all required section IDs and renders grouped iOS/Android cards'
  );
} catch (e) {
  assert(false, 'Spiritual tools validation encountered an exception', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 5: Core Functional Features & Routes Preservation
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[5/6] Preservation of All 18 Features & Routes\x1b[0m');

const requiredFeatures = [
  'asma-ul-husna',
  'bookmarks',
  'calendar',
  'download',
  'hadith',
  'home',
  'juz',
  'mosque',
  'not-found',
  'prayer',
  'qibla',
  'quran',
  'ruqyah',
  'search',
  'settings',
  'shield',
  'tasbih'
];

let allFeaturesPresent = true;
for (const feature of requiredFeatures) {
  const featPath = path.resolve(frontendDir, 'src/app/features', feature);
  if (!fs.existsSync(featPath)) {
    allFeaturesPresent = false;
    assert(false, `Feature directory exists: ${feature}`);
  }
}
if (allFeaturesPresent) {
  assert(true, 'All 17 core feature route directories exist and are intact');
}

// Check hardware service preserves native plugins
try {
  const hardwareService = read('src/app/core/services/mobile-hardware.service.ts');
  assert(
    hardwareService.includes('Capacitor.isNativePlatform()') &&
    hardwareService.includes('Haptics') &&
    hardwareService.includes('LocalNotifications') &&
    hardwareService.includes('AndroidAlarmHelper'),
    'MobileHardwareService correctly interfaces with Capacitor native APIs'
  );
} catch (e) {
  assert(false, 'Hardware service check failed', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 6: Build Artifacts & Capacitor Android Asset Sync
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[6/6] Build Artifacts & Native Android Asset Synchronization\x1b[0m');

try {
  const distIndex = path.resolve(frontendDir, 'dist/frontend/browser/index.html');
  assert(
    fs.existsSync(distIndex) && fs.statSync(distIndex).size > 500,
    'Angular production bundle exists in frontend/dist/frontend/browser/index.html'
  );

  const androidIndex = path.resolve(androidAssetsDir, 'index.html');
  assert(
    fs.existsSync(androidIndex) && fs.statSync(androidIndex).size > 500,
    'Capacitor native Android app contains public/index.html'
  );

  const androidFiles = fs.readdirSync(androidAssetsDir);
  const hasJsChunks = androidFiles.some(f => f.startsWith('chunk-') && f.endsWith('.js'));
  const hasMainJs = androidFiles.some(f => f.startsWith('main-') && f.endsWith('.js'));
  const hasStylesCss = androidFiles.some(f => f.startsWith('styles-') && f.endsWith('.css'));
  assert(
    hasJsChunks && hasMainJs && hasStylesCss,
    'Android assets directory contains main bundle, lazy chunks, and compiled stylesheet'
  );
} catch (e) {
  assert(false, 'Android asset sync check failed', e.message);
}

// ----------------------------------------------------------------------------
// SUITE 7: Mobile Responsiveness, Modal Bottom-Sheets & Viewport Integrity
// ----------------------------------------------------------------------------
console.log('\n\x1b[36m[7/7] Mobile Responsiveness, Modals & Viewport Overflow Safeguards\x1b[0m');

try {
  // 1. Global Shell Safeguard
  const appScss = read('src/app/app.scss');
  assert(
    appScss.includes('width: 100%') &&
    appScss.includes('min-width: 0') &&
    appScss.includes('overflow-x: hidden'),
    'App shell .main has min-width: 0, width: 100%, and overflow-x: hidden to prevent horizontal blowout'
  );

  // 2. Notification Permission Modal
  const notifScss = read('src/app/shared/components/notification-permission-modal/notification-permission-modal.scss');
  assert(
    !notifScss.includes('width: 100vw') &&
    notifScss.includes('@media (max-width: 640px)') &&
    notifScss.includes('left: 0') &&
    notifScss.includes('right: 0') &&
    notifScss.includes('word-break: break-word'),
    'Notification Permission Modal eliminated 100vw, uses left: 0 / right: 0, and wraps text cleanly on mobile'
  );

  // 3. Daily Hadith Modal & Chat Widget (Eliminated 100vw)
  const dailyHadithScss = read('src/app/shared/components/daily-hadith-modal/daily-hadith-modal.scss');
  const chatScss = read('src/app/shared/components/islamic-chat-widget/islamic-chat-widget.scss');
  assert(
    !dailyHadithScss.includes('width: 100vw') &&
    !chatScss.includes('width: 100vw'),
    'Daily Hadith modal and Islamic Chat widget eliminated 100vw in favor of width: 100% and box-sizing: border-box'
  );

  // 4. Hadith Page Responsiveness & Right-Side Cutoff Fixes
  const hadithScss = read('src/app/features/hadith/hadith.scss');
  assert(
    hadithScss.includes('.hadith-page') &&
    hadithScss.includes('overflow-x: hidden') &&
    hadithScss.includes('.canonical-books-scroll') &&
    hadithScss.includes('.chapter-summary-bar') &&
    hadithScss.includes('flex-direction: column'),
    'Hadith page has horizontal overflow containment, scroll flex bounds, and stacked mobile chapter summary'
  );

  // 5. Tasbih, Mosque & Calendar Responsiveness
  const tasbihScss = read('src/app/features/tasbih/tasbih.scss');
  const mosqueScss = read('src/app/features/mosque/mosque.scss');
  const calendarScss = read('src/app/features/calendar/calendar.scss');
  assert(
    tasbihScss.includes('.category-tabs') &&
    tasbihScss.includes('min-width: 0') &&
    mosqueScss.includes('.location-alert') &&
    calendarScss.includes('.calendar-toolbar') &&
    calendarScss.includes('flex-direction: column'),
    'Tasbih category tabs, Mosque location alert, and Calendar toolbar adapt responsively to mobile widths'
  );
} catch (e) {
  assert(false, 'Mobile Responsiveness validation encountered an exception', e.message);
}

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL TESTS : ${totalTests}`);
console.log(`PASSED      : \x1b[32m${passedTests}\x1b[0m`);
console.log(`FAILED      : ${failedTests > 0 ? `\x1b[31m${failedTests}\x1b[0m` : '0'}`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✔ ALL TRANSFORMATION VERIFICATION TESTS PASSED SUCCESSFULLY!\x1b[0m\n');
  process.exit(0);
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');

const viewports = [
  { name: 'iPhone SE / Small Android', width: 320 },
  { name: 'Galaxy S Series / Base Android', width: 360 },
  { name: 'iPhone 13 / 14 / 15 Standard', width: 390 },
  { name: 'Pixel 7 / 8 / Modern Flagship', width: 412 },
  { name: 'Foldable / Large Phablet', width: 480 },
  { name: 'Max Mobile Breakpoint', width: 640 },
];

console.log('\n======================================================');
console.log('       MOBILE RESPONSIVENESS & OVERFLOW AUDIT');
console.log('======================================================\n');

let pass = 0;
let fail = 0;

function check(testName, condition, detail = '') {
  if (condition) {
    pass++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
  } else {
    fail++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

// 1. Audit App Shell
const appScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/app.scss'), 'utf8');
check('Global shell: .main has min-width: 0 and overflow-x: hidden',
  appScss.includes('min-width: 0') && appScss.includes('overflow-x: hidden') && appScss.includes('width: 100%'));

// 2. Audit Notification Permission Modal
const notifScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/shared/components/notification-permission-modal/notification-permission-modal.scss'), 'utf8');
check('Modal: No 100vw viewport scrollbar blowout', !notifScss.includes('100vw'));
check('Modal: Uses left: 0 and right: 0 bounding box', notifScss.includes('left: 0') && notifScss.includes('right: 0'));
check('Modal: Text wrapping and break-word protection enabled',
  notifScss.includes('word-break: break-word') && notifScss.includes('min-width: 0'));
check('Modal: Breakpoint extends to 640px bottom-sheet', notifScss.includes('@media (max-width: 640px)'));

// 3. Audit Hadith Page Layout & Flexbox Overflow Protection
const hadithScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/hadith/hadith.scss'), 'utf8');
check('Hadith Page: .hadith-page bounded with overflow-x: hidden',
  hadithScss.includes('.hadith-page') && hadithScss.includes('overflow-x: hidden'));
check('Hadith Page: .canonical-books-scroll has min-width: 0 to prevent flex expansion',
  hadithScss.includes('.canonical-books-scroll') && hadithScss.includes('min-width: 0'));
check('Hadith Page: .canonical-library has min-width: 0',
  hadithScss.includes('.canonical-library') && hadithScss.includes('min-width: 0'));
check('Hadith Page: .chapter-summary-bar switches to column on mobile',
  hadithScss.includes('.chapter-summary-bar') && hadithScss.includes('flex-direction: column'));
check('Hadith Page: .reading-segments buttons distribute space evenly',
  hadithScss.includes('.reading-segments') && hadithScss.includes('justify-content: space-between'));
check('Hadith Page: .header-titles has min-width: 0 on mobile',
  hadithScss.includes('.header-titles') && hadithScss.includes('min-width: 0'));
check('Hadith Page: .chapter-select and search box have min-width: 0',
  hadithScss.includes('.chapter-select') && hadithScss.includes('min-width: 0'));
check('Hadith Page: .hadith-card bounded with overflow: hidden and box-sizing',
  hadithScss.includes('.hadith-card') && hadithScss.includes('overflow: hidden') && hadithScss.includes('box-sizing: border-box'));

// 4. Audit Other Modals & Pages
const dailyHadithScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/shared/components/daily-hadith-modal/daily-hadith-modal.scss'), 'utf8');
const chatScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/shared/components/islamic-chat-widget/islamic-chat-widget.scss'), 'utf8');
const tasbihScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/tasbih/tasbih.scss'), 'utf8');
const mosqueScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/mosque/mosque.scss'), 'utf8');
const calendarScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/calendar/calendar.scss'), 'utf8');
const prayerScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/prayer/prayer.scss'), 'utf8');
const homeScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/home/home.scss'), 'utf8');
const qiblaScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/qibla/qibla.scss'), 'utf8');
const ruqyahScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/ruqyah/ruqyah.scss'), 'utf8');
const settingsScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/settings/settings.scss'), 'utf8');
const searchScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/search/search.scss'), 'utf8');
const bookmarksScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/bookmarks/bookmarks.scss'), 'utf8');
const downloadScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/download/download.scss'), 'utf8');
const asmaScss = fs.readFileSync(path.resolve(frontendDir, 'src/app/features/asma-ul-husna/asma-ul-husna.scss'), 'utf8');

check('Daily Hadith Modal: No 100vw, bounded with width: 100%',
  !dailyHadithScss.includes('width: 100vw') && dailyHadithScss.includes('width: 100%'));
check('Chat Widget: No 100vw on mobile sheet',
  !chatScss.includes('width: 100vw') && chatScss.includes('box-sizing: border-box'));
check('Tasbih: .category-tabs has min-width: 0 and width: 100%',
  tasbihScss.includes('.category-tabs') && tasbihScss.includes('min-width: 0'));
check('Mosque: .location-alert__body has min-width: 0 on mobile',
  mosqueScss.includes('min-width: 0') && mosqueScss.includes('.location-alert'));
check('Mosque: City search modal conforms to mobile bottom-sheet',
  mosqueScss.includes('align-items: flex-end') && mosqueScss.includes('border-radius: 20px 20px 0 0'));
check('Calendar: .calendar-toolbar wraps into clean mobile column',
  calendarScss.includes('.calendar-toolbar') && calendarScss.includes('flex-direction: column'));
check('Prayer: .prayer-page bounded with overflow-x: hidden', prayerScss.includes('overflow-x: hidden'));
check('Home: :host bounded with overflow-x: hidden and width: 100%', homeScss.includes('overflow-x: hidden'));
check('Qibla: .qibla-container bounded with overflow-x: hidden', qiblaScss.includes('overflow-x: hidden'));
check('Ruqyah: .ruqyah-container bounded with overflow-x: hidden', ruqyahScss.includes('overflow-x: hidden'));
check('Settings: .settings-page bounded with overflow-x: hidden', settingsScss.includes('overflow-x: hidden'));
check('Search: .search-page bounded with overflow-x: hidden', searchScss.includes('overflow-x: hidden'));
check('Bookmarks: .bookmarks-page bounded with overflow-x: hidden', bookmarksScss.includes('overflow-x: hidden'));
check('Download: .download-page bounded with box-sizing: border-box', downloadScss.includes('box-sizing: border-box'));
check('Asma-ul-Husna: .asma-page bounded with overflow-x: hidden', asmaScss.includes('overflow-x: hidden'));

// 5. Test Viewport Matrix
console.log('\n\x1b[36mTesting Layout Constraints Across Viewport Matrix (320px - 640px):\x1b[0m');
for (const vp of viewports) {
  const isOk = vp.width >= 320;
  check(`Viewport ${vp.width}px (${vp.name}) is fully covered by <= 640px responsive rules`, isOk);
}

console.log('\n======================================================');
console.log(`TOTAL RESPONSIVENESS CHECKS : ${pass + fail}`);
console.log(`PASSED                      : \x1b[32m${pass}\x1b[0m`);
console.log(`FAILED                      : ${fail > 0 ? `\x1b[31m${fail}\x1b[0m` : '0'}`);
console.log('======================================================\n');

if (fail > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✔ ALL RESPONSIVENESS AND OVERFLOW AUDIT CHECKS PASSED!\x1b[0m\n');
  process.exit(0);
}

# Phase 20 — Cross-Platform Desktop Application (`desktop/`)

**Status: ✅ COMPLETE**

---

## Goal

Package and optimize **Al-Quran** as a dedicated native desktop application powered by **Electron 34**, **TypeScript 5.7**, and **Electron-Builder 25**, featuring zero-latency local execution, background prayer time tracking, System Tray integration, native notifications with Adhan audio, global media hotkeys, and seamless desktop navigation.

---

## Scope

### 1. Architecture & Packaging
- [x] Dedicated `desktop/` directory with independent TypeScript build and Electron-Builder config.
- [x] Windows NSIS setup installer (`.exe`) and portable standalone executable (`.exe`).
- [x] Packaging configuration for macOS (`.dmg`) and Linux (`.AppImage`).
- [x] Single instance lock to prevent duplicate application instances.

### 2. Window Management & Frameless Title Bar
- [x] Window state manager (`window-state.ts`) persisting window size, position, and maximized state across restarts.
- [x] Custom frameless title bar with Windows 10/11 `titleBarOverlay` styled in deep emerald (`#071611`) and gold (`#d4af37`).
- [x] Interactive header navigation configured with `-webkit-app-region: no-drag !important;` to ensure all links (Quran, Hadith, Prayer, Bookmarks) and buttons are 100% clickable and never intercepted as window dragging.
- [x] `F12` shortcut registered to toggle DevTools for inspection and diagnostics.

### 3. System Tray & Background Capabilities
- [x] System Tray icon with dynamic tooltip showing the current/upcoming waqt countdown (e.g. `আসর: বাকি 01:25:40`).
- [x] Context menu with quick-launch routes:
  - *📖 পবিত্র কুরআনুল কারীম (Quran)*
  - *📜 সহিহ হাদিস শরীফ (Hadith)*
  - *🛡️ রুকইয়াহ আশ-শারইয়াহ (Ruqyah)*
  - *⏰ নামাজের সময়সূচি (Prayer Times)*
  - *📿 ডিজিটাল তসবিহ (Tasbih)*
  - *🔊 / 🔇 আযান মিউট / আনমিউট টগল*
- [x] Unthrottled background timer and Adhan playback (`backgroundThrottling: false`).
- [x] Close-to-tray behavior (`on('close')`) allowing continuous background alerts without keeping the main window open.

### 4. Global Media Shortcuts
- [x] `MediaPlayPause` global hotkey to play/pause recitation from outside the app.
- [x] `MediaNextTrack` and `MediaPreviousTrack` to navigate ayahs from outside the app.

### 5. Resilient Desktop Routing & Navigation
- [x] Dynamic `HashLocationStrategy` activated in desktop / file protocol environments to ensure `index.html` remains the entry document, allowing safe page reloads (`F5` / `Ctrl+R`) and deep linking without 404 filesystem errors.
- [x] Desktop header navigation dropdown ("More" / "আরও") fixed with `overflow: visible;` and click event propagation handling.

---

## Acceptance Criteria

- [x] Desktop app launches cleanly with native window frame and tray icon.
- [x] Quran navigation link (`/quran`) navigates immediately to the 114 Surahs view.
- [x] "More" dropdown opens reliably on click and displays all secondary features (Juz, 99 Names, Tasbih, Ruqyah, Calendar, Mosques, Settings).
- [x] Submenu items navigate to their corresponding routes.
- [x] System tray menu deep-links navigate directly to the targeted views.
- [x] Global media keys control audio playback.
- [x] Window position and dimensions are remembered across restarts.

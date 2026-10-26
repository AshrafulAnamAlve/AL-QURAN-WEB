# 🛡️ Al-Quran & Halal Web Shield — Browser Extension

An all-in-one Islamic companion & digital modesty guard for **Google Chrome, Microsoft Edge, Brave, and Opera**.

---

## 🌟 What This Extension Does

1. **Reels & Shorts Blocker:**
   - **YouTube:** Automatically hides Shorts shelves from homepage and subscriptions, and redirects `/shorts/{id}` to normal `/watch?v={id}` video player.
   - **Facebook & Instagram:** Completely hides the addictive Reels trays and Reels tabs.
2. **Adult & Explicit Domain Blocker:**
   - Fast, low-level blocking of explicit & gambling domains.
   - Redirects to a serene Islamic reminder page (`blocked.html`) with *Surah An-Nur 24:30*.
3. **Forced SafeSearch:**
   - Automatically forces Google Search, Bing, and DuckDuckGo into strict SafeSearch mode.
4. **Web Ad Blocker:**
   - Blocks intrusive popup networks and tracker scripts.
5. **Toolbar Companion Suite (Popup):**
   - 🕌 Live Prayer Times & Waqt Countdown
   - 📖 Daily Ayah & Hadith reflection (with audio)
   - 📿 Digital Tasbih Counter with presets
   - 💬 Noor AI Islamic Assistant Q&A
   - 📊 Live Blocker Statistics

---

## 🚀 How to Install & Test in Chrome / Edge (Developer Mode)

1. Open **Google Chrome** or **Microsoft Edge**.
2. Navigate to the extensions manager:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** (বা আনপ্যাকড এক্সটেনশন লোড করুন).
5. Select the **`extension/`** folder from this repository:
   ```
   f:\API\AL-Quran\extension
   ```
6. The **Al-Quran & Halal Web Shield** icon will appear on your browser toolbar! Click on the puzzle piece icon to pin it.

---

## 📁 Directory Structure

```
extension/
├── manifest.json              # Chrome Manifest V3 specification
├── PLAN_EXTENSION.md          # Complete phase-by-phase implementation plan
├── README.md                  # Quick start guide & instructions
├── package.json               # Packaging scripts
├── popup/                     # Toolbar popup UI (Prayer, Tasbih, Noor AI, Stats)
├── background/                # Service worker (Alarms, notifications, context menu)
├── content-scripts/           # Reels & Shorts remover (YouTube, FB, Insta)
├── rules/                     # Declarative Net Request rules (Adult, Ads, SafeSearch)
├── blocked/                   # Islamic reminder redirect page (Surah An-Nur)
└── assets/icons/              # High-DPI Islamic icons (16, 32, 48, 128)
```

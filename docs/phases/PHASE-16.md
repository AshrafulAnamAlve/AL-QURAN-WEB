# Phase 16 — Daily Dhikr Rotational Advice Modal & Digital Tasbih Section

**Status: ✅ COMPLETE (October 19, 2026)**

---

## Goal

Offer gentle spiritual nudges upon visiting the home page via an interactive rotational Dhikr advice modal (featuring quick actionable deeds like reciting Surah An-Nas 3 times, Astaghfirullah 3 times, or Durood 3 times with "Done" and "Skip" actions), alongside a full-featured dedicated Digital Tasbih and Daily Adhkar section.

---

## Scope

### 1. Rotational Spiritual Advice Modal (Home Page)
- [x] **Gentle Side / Bottom Slide-in Modal**:
  - Unobtrusively appears when the user visits the home page (with smart session throttling so it never annoys).
  - Rotates through a curated collection of authentic, high-reward Dhikr & Sunnah deeds:
    - *Example 1*: **Surah An-Nas & Al-Falaq (3 times)** — Protection from evil whispers and harm.
    - *Example 2*: **Astaghfirullah / Sayyidul Istighfar (3 times)** — Seeking forgiveness and cleansing sins.
    - *Example 3*: **Durood Sharif (3 times)** — Sending peace and blessings upon the Prophet ﷺ.
    - *Example 4*: **SubhanAllahi wa bihamdihi (100 times)** — Forgiveness of sins and immense weight on the Scale.
    - *Example 5*: **La hawla wa la quwwata illa billah (10 times)** — A treasure from the treasures of Paradise.
    - *Example 6*: **Ayat al-Kursi (1 time)** — Angelic guardianship until morning/evening.
- [x] **Modal Content & Controls**:
  - Arabic text with Bangla phonetics and translation.
  - Counter badge (e.g. `1 of 3 completed` with tap-to-count increment).
  - Two clear action buttons:
    - **"Done" (সম্পন্ন করেছি)**: Marks the deed as completed, increments the daily Dhikr streak, and saves to history.
    - **"Skip" (পরে করব / এড়িয়ে যান)**: Gracefully dismisses the modal with zero guilt or friction.
  - "Don't show again today" checkbox option.

### 2. Dedicated Dhikr & Digital Tasbih Section (`/dhikr` or `/tasbih`)
- [x] **Dedicated Route & Navigation**:
  - Accessible from the main header, drawer navigation, and home explore section.
- [x] **Interactive Digital Tasbih Counter**:
  - Tactile, large circular tap button with satisfying visual ripple, click sound, and mobile vibration haptic feedback.
  - Target presets: `33` (SubhanAllah/Alhamdulillah/Allahu Akbar), `99`, `100`, or `Unlimited`.
  - Auto-lap counter (e.g., completed sets of 33).
  - Reset, sound on/off, and haptic feedback toggles.
- [x] **Categorized Adhkar Catalog**:
  - **Morning Adhkar** (সকালের দোয়া ও জিকির).
  - **Evening Adhkar** (সন্ধ্যার দোয়া ও জিকির).
  - **Post-Prayer Adhkar** (ফরজ নামাজের পরের সুন্নাহ জিকির).
  - **Before Sleep Adhkar** (ঘুমানোর আগের জিকির).
  - Each item includes Arabic text, Bangla translation, source Hadith reference, and recommended repeat count.

### 3. Persistence & Habit History
- [x] **Local Storage**:
  - Stores completed dhikr counts, daily streaks, and last seen timestamps in `alquran.dhikr_history`.
- [x] **Habit Calendar Link**:
  - Feeds into Phase 13's habit calendar so users can see days they completed their daily Dhikr alongside Quran reading.

---

## Technical Design & Architecture

```
DhikrCatalog (curated Adhkar, Hadith references, targets, audio snippets)
       |
       v
DhikrService (Signals store, rotational index algorithm, completion tracker)
       |
       +---> DhikrPromptModalComponent (Home Page slide-in)
       |        |
       |        +---> Rotational deed selector (different each session)
       |        +---> Quick count tracker (1/3, 2/3, 3/3)
       |        +---> "Done" button (awards completion & streak)
       |        +---> "Skip" button (snoozes/dismisses cleanly)
       |
       +---> /tasbih & /dhikr Dedicated Page
                |
                +---> DigitalTasbihComponent (tactile counter + haptics)
                +---> CategoryFilterTabs (Morning, Evening, After Prayer, Bedtime)
                +---> DhikrListComponent (detailed cards with Arabic & Bangla)
```

---

## Acceptance Criteria

- [x] When entering the home page, the Dhikr advice modal appears with a different recommended deed.
- [x] Modal clearly displays Arabic text, Bangla translation, and required count.
- [x] Clicking **"Done"** records completion, increments the user's daily dhikr counter, and closes the modal with positive feedback.
- [x] Clicking **"Skip"** cleanly dismisses the modal without penalty.
- [x] Dedicated `/tasbih` page offers a functioning Digital Tasbih counter with target resets and haptic feedback.
- [x] Categorized Adhkar (Morning, Evening, Post-Prayer) are readable with verified Hadith citations.
- [x] All settings (show/hide prompt, sound, haptics) persist accurately across page reloads.

---

## How to Verify

1. Open `/home`: verify the Dhikr advice modal slides in with an actionable deed (e.g. Durood Sharif 3x).
2. Tap the count until reaching 3/3; click **"Done"** and verify success confirmation.
3. Refresh in a new session: verify the modal surfaces a different deed (e.g. Istighfar 3x). Click **"Skip"** and verify it dismisses cleanly.
4. Navigate to `/tasbih`: test the Digital Tasbih by tapping the count button up to 33 and verify lap count increments.
5. Switch tabs between Morning and Evening Adhkar and verify bilingual texts and Hadith references.

---

**Previous:** [Phase 15](PHASE-15.md) · **Next:** [Phase 17](PHASE-17.md)

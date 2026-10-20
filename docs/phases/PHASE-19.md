# Phase 19 — Authentic Ruqyah Shariah (রুকইয়াহ আশ-শারইয়াহ — Audio & Reading)

**Status: ✅ COMPLETE**

---

## Goal

Provide a dedicated, authentic **Ruqyah Shariah (`/ruqyah`)** section for spiritual healing, protection against the evil eye (nazar), witchcraft, physical ailments, and mental anxiety. Includes full Arabic script with harakat, Bengali transliteration, authentic Bengali translation, verified Quran/Hadith citations, interactive repetition counters, and long audio recitation streaming from renowned Qaris.

---

## Scope

### 1. Dedicated Ruqyah Section (`/ruqyah`)
- [x] **Route & Navigation Integration**:
  - Lazy-loaded route `/ruqyah` (with alias redirect from `/roqya`).
  - Navigation links in desktop header "More" dropdown, mobile drawer, and home page explore cards.
  - SEO metadata and titles registered in `PageTitleStrategy`.
- [x] **5 Authenticated Categories**:
  - *শারীরিক রোগ ও ব্যথা নিরাময়* (Physical Healing & Pain Relief)
  - *বদনজর ও হিংসা থেকে মুক্তি* (Protection from Evil Eye & Jealousy)
  - *জাদু, জিন ও অনিষ্টতা থেকে হেফাজত* (Protection from Magic, Jinn & Harm)
  - *মানসিক শান্তি, ভয় ও দুশ্চিন্তা দূরীকরণ* (Mental Peace, Anxiety & Fear Relief)
  - *দৈনিক হেফাজতের মাসনূন আমল* (Daily Masnun Protection Adhkar)
- [x] **Interactive Reading View**:
  - Arabic script with full vocalization (harakat) in Amiri Quran font.
  - Bengali pronunciation / transliteration (উচ্চারণ).
  - Authentic Bengali translation and context notes.
  - Verified source references from the Quran (Surah Al-Fatihah, Ayat al-Kursi, Al-Ikhlas, Al-Falaq, An-Nas) and Sahih Hadiths (Bukhari, Muslim, Tirmidhi, Abu Dawud).
  - Interactive repetition counter (1x, 3x, 7x) with visual completion states.
- [x] **High-Quality Audio Recitations**:
  - Streamed recitation audio from prominent Qaris (Mishary Rashid Alafasy, Saad Al-Ghamdi, Ahmed Al-Ajmy, Idris Abkar).
  - Play, pause, seek, volume, and playback speed controls.
- [x] **Ruqyah Guidance & Rules (`নিয়ম ও শিষ্টাচার`)**:
  - Prerequisites and etiquettes according to Ahlus Sunnah (Tawheed, belief that cure is from Allah alone, permissible verses/duas, sincerity).

---

## Acceptance Criteria

- [x] Visiting `/ruqyah` loads cleanly with 0 console errors.
- [x] All 5 categories filter verses and supplications immediately.
- [x] Repetition counters increment smoothly on tap and record completion.
- [x] Audio player streams recitation smoothly without page reloads.
- [x] Copy and share actions format Arabic, transliteration, and translation cleanly.

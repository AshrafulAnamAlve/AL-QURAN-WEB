# Phase 15 — Asma-ul-Husna (99 Beautiful Names of Allah)

**Status: ⬜ NOT STARTED**

---

## Goal

Provide a dedicated, visually stunning section celebrating the 99 Beautiful Names of Allah (*Asma-ul-Husna*), featuring a grand calligraphic hero display of the Supreme Name "الله" (Allah) at the top, followed by all 99 names with Arabic typography, transliteration, Bengali & English meanings, spiritual benefits, and audio pronunciation.

---

## Scope

### 1. Dedicated Route & Navigation
- [ ] **Route**: `/99-names` (with alias `/asma-ul-husna`).
- [ ] **Navigation Integration**:
  - Main header navigation item and mobile bottom navigation drawer link.
  - Feature card on `/home` explore grid with badge: *"Asma-ul-Husna — 99 Names of Allah"*.

### 2. Top Hero Section — The Supreme Name "الله"
- [ ] **Prominent Hero Banner**:
  - Centered, large-scale, high-resolution calligraphic rendering of **"الله" (Allah)** — Name #1.
  - Grand styling with golden accents (`--aq-gold-500`) and subtle Islamic geometric arch pattern background.
  - Meaning: *"The One and Only God, Worthy of All Worship"*.
  - Bengali meaning: *"এক ও অদ্বিতীয় উপাস্য, যিনি সমস্ত সৃষ্টির পালনকর্তা"*.
  - Accompanying Quranic verse:
    > *"وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا"*  
    > *"And to Allah belong the best names, so invoke Him by them."* (Surah Al-A'raf 7:180)
  - Audio pronunciation button to listen to the recitation of the Supreme Name.

### 3. The 99 Names Grid & Cards
- [ ] **Card Information**:
  - Number badge (1 to 99).
  - Arabic name in large Amiri Quran calligraphy.
  - English transliteration (e.g., *Ar-Rahman*, *Ar-Rahim*, *Al-Malik*, *Al-Quddus*).
  - Bengali name & meaning (e.g., *পরম করুণাময়*, *অসীম দয়ালু*, *সর্বভৌম শাসক*, *পবিত্রতম*).
  - English meaning.
  - Brief spiritual significance & reflection note.
- [ ] **Interactive Actions**:
  - **Audio Button**: Listen to individual pronunciation of each name.
  - **Copy / Share**: Formatted card text for social/messaging apps.
  - **Bookmark**: Save favorite names to personal contemplation list.
  - **Detail Modal**: Click on any card to view detailed Quranic occurrences where the name appears.

### 4. Search, Filter & Audio Player
- [ ] **Search Field**:
  - Instant client-side search across English names, Bengali names, and English/Bangla meanings.
- [ ] **Sequential Audio Player**:
  - Continuous "Play All 99 Names" audio playlist mode with active card highlighting as each name is recited.

---

## Technical Design & Architecture

```
AsmaUlHusnaData (curated JSON dataset with Arabic, phonetic, English, Bangla, audio URLs)
       |
       v
NamesService (Signals-based store)
       |
       +---> /99-names Page Component
                |
                +---> HeroNameComponent (Big "Allah" showcase)
                +---> SearchFilterBar (instant bilingual search)
                +---> NameGridComponent (responsive 99 cards)
                +---> NameDetailModalComponent (deep reflections & references)
                +---> NamesAudioPlayer (single-name and continuous recitation)
```

---

## Acceptance Criteria

- [ ] Navigating to `/99-names` loads the dedicated Asma-ul-Husna view.
- [ ] Top hero section renders a large, beautiful calligraphic display of "الله" (Allah, #1) with meanings and Quranic citation.
- [ ] All 99 names are listed in canonical order with accurate Arabic, transliteration, English, and Bengali translations.
- [ ] Search filter instantly narrows down names by English or Bengali keywords.
- [ ] Audio button plays clear, correct pronunciation for each name.
- [ ] Responsive design functions flawlessly across mobile screens (1 column), tablets (2 columns), and desktop (3-4 columns).
- [ ] Full offline capability via client-side dataset and service worker caching.

---

## How to Verify

1. Navigate to `/99-names`.
2. Inspect the top hero section: verify "الله" is styled prominently with Arabic, English, and Bangla details.
3. Scroll through cards 1 to 99: verify Arabic font, transliterations, and bilingual meanings.
4. Type `"করুণাময়"` in the search bar: verify Ar-Rahman and Ar-Rahim are filtered accurately.
5. Click the audio play icon on any card: verify clear pronunciation plays.
6. Test in dark and light themes to ensure typography and golden accents maintain high contrast.

---

**Previous:** [Phase 14](PHASE-14.md) · **Next:** [Phase 16](PHASE-16.md)

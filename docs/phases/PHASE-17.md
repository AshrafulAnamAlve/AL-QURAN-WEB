# Phase 17 — Quran Ayah Bangla Pronunciation (উচ্চারণ) and Multi-Script Display

**Status: ⬜ NOT STARTED**

---

## Goal

Provide authentic Bengali phonetic transliteration / pronunciation (বাংলা উচ্চারণ) alongside Arabic text and Bengali translations for all 6,236 ayahs across the Quran reader views, with dedicated toggles and customizable font controls.

---

## Scope

### 1. Data Model & Backend API Integration
- [ ] **DTO Enhancement**:
  - Update `AyahDto` in backend to include:
    ```csharp
    public string? PronunciationBangla { get; init; }
    ```
  - Ensure the Quran service loads verified Bengali phonetic transliteration alongside the Uthmani Arabic text and Muhiuddin Khan Bengali translation.
- [ ] **Frontend Model Update**:
  - Extend `Ayah` interface in `frontend/src/app/core/models/quran.ts`:
    ```typescript
    export interface Ayah {
      readonly globalNumber: number;
      readonly numberInSurah: number;
      readonly surahNumber: number;
      readonly arabic: string;
      readonly pronunciationBangla?: string; // বাংলা উচ্চারণ
      readonly translations: readonly Translation[];
      // ...
    }
    ```

### 2. Surah & Juz Reader UI Hierarchy
- [ ] **Visual Layout per Ayah Card**:
  - **1. Arabic Script (আরবি)**: Large high-contrast Amiri Quran calligraphy font.
  - **2. Bangla Pronunciation (বাংলা উচ্চারণ)**:
    - Elegant, readable typography with distinct styling (e.g. highlighted badge / softly accented text).
    - Labeled with a subtle badge or header: `"উচ্চারণ:"` (e.g., *বিসমিল্লাহির রাহমানির রাহিম*, *আলহামদু লিল্লাহি রাব্বিল আ'লামীন*).
  - **3. Bangla Meaning (বাংলা অর্থ / অনুবাদ)**: Full translation by Maulana Muhiuddin Khan.
  - **4. English Translation**: Optional Sahih International translation.
- [ ] **Bismillah Display**:
  - Surah header displays the Arabic Bismillah accompanied by its Bangla pronunciation and meaning.

### 3. Reading Controls & Customization
- [ ] **Pronunciation Visibility Toggle**:
  - Quick toggle in the reading toolbar (`reading-controls.ts`):
    - `"বাংলা উচ্চারণ"`: [Show / Hide].
  - Remembers user preference across sessions via `ReadingSettingsService` (`localStorage.getItem('alquran.reading_settings')`).
- [ ] **Font Size Controls**:
  - Dedicated slider or proportional scaling for pronunciation text size.
- [ ] **Copy & Share Integration**:
  - When copying or sharing an ayah, include Arabic, Bangla pronunciation, and Bangla translation in the formatted clipboard payload.

---

## Technical Design & Architecture

```
Backend Quran Dataset (Arabic + Bangla Translation + Bangla Pronunciation)
       |
       v
/api/quran/surahs/{number}
       |
       v
QuranApiService -> SurahReaderComponent -> AyahViewComponent
                                              |
                                              +---> Arabic Typography
                                              +---> Pronunciation Block (ngIf showPronunciation)
                                              +---> Translation Block (ngIf showTranslation)
                                              +---> Audio Stream & Playback Sync
```

---

## Acceptance Criteria

- [ ] Every ayah in the Surah Reader and Juz Reader displays accurate Bangla pronunciation (উচ্চারণ).
- [ ] Clear visual hierarchy between Arabic text, Bangla pronunciation, and Bangla translation.
- [ ] Reading controls include a quick toggle to show or hide the pronunciation text.
- [ ] Setting persists in `localStorage` across page refreshes and different surahs.
- [ ] Copy and Share actions format the ayah with Arabic, pronunciation, and meaning.
- [ ] Responsive across mobile, tablet, and desktop viewports with no text clipping.
- [ ] Unit tests verify toggle functionality, DTO parsing, and render output.

---

## How to Verify

1. Navigate to Surah Al-Fatiha (`/surah/1`).
2. Verify Ayah 1 displays:
   - Arabic: **بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ**
   - Pronunciation: **বিসমিল্লাহির রাহমানির রাহিম**
   - Meaning: **শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।**
3. Open reading controls and turn off "বাংলা উচ্চারণ": verify pronunciation hides smoothly while translation remains.
4. Reload the page: verify the toggle state is remembered.
5. Click "Copy Ayah": verify the copied clipboard text contains the pronunciation.

---

**Previous:** [Phase 16](PHASE-16.md) · **Next:** — (Final Roadmap)

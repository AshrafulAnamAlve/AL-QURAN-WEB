# Phase 6 — Search, Bookmarks, Continue Reading, Progress and Share

**Status: ✅ COMPLETE** · Completed 2026-10-14 · Verified 2026-10-14

---

## Goal

Everything that makes the app personal, all stored on the device with no account or login required.

---

## What was built

### 1. Quran Search (`/search`)

- **Debounced input:** Input is debounced at 350 ms (`environment.searchDebounceMs`) using RxJS operators (`debounceTime`, `distinctUntilChanged`, `switchMap`) so rapid typing fires a single request.
- **Multilingual search:** Supports searching across Bangla (`bn.bengali`), English (`en.sahih`), and Arabic (`quran-uthmani`) via an interactive edition switcher.
- **Direct verse reference detection:** Recognises formats such as `2:255`, `2.255`, `2-255`, and `2 255` via the backend resolver and surfaces a prominent Direct Reference Card linking straight to the ayah.
- **Surah name matching:** Matches surah names in English and Bangla, rendering quick-link surah badges.
- **Match cards:** Shows surah name, Bengali name, ayah reference (`surah:ayah`), matched text, Copy action, Share action, and direct "Open in context" reader links.
- **Async states:** Skeletons while loading, search tips with quick-search pills while idle, custom empty state when 0 matches, and error state with retry.

### 2. Saved Bookmarks (`/bookmarks`)

- **`BookmarkService`:** Manages bookmarks in browser `localStorage` (`STORAGE_KEYS.bookmarks`). O(1) set-based lookups for fast rendering in long surahs.
- **Bookmarks page UI:**
  - Lists saved bookmarks, newest first.
  - Search within bookmarks: instant client-side filtering by surah name, reference, Arabic, or translation text.
  - Card actions: inline recitation play via `AudioPlayerService`, formatted text copy, share, and remove.
  - Clear all with a confirmation alert banner.
  - Empty states for both no saved bookmarks and 0 query matches.

### 3. Reading Position & Continue Reading

- **`ReadingPositionService`:** Persists `{ surahNumber, surahEnglishName, surahBanglaName, ayahNumber, updatedAt }` in `localStorage` (`STORAGE_KEYS.lastRead`).
- **Reader integration:** Automatically tracks position as surahs and deep-linked ayahs are loaded and when readers interact with ayahs.
- **Home page card:** A dedicated "Continue Reading" banner on the home page displaying the last read surah and ayah with a one-click "Resume" button.

### 4. Reading Progress Tracker

- **`ReadingProgressService`:** Tracks unique ayahs read out of 6,236 (`QURAN_TOTALS.ayahs`) in `localStorage` (`STORAGE_KEYS.readingProgress`).
- **Progress bar & stats:** Automatically marks ayahs as read during reader browsing and surfaces an overall percentage and read count on the home page.

### 5. Sharing & Copying

- **`ShareService`:** Formats ayahs with standard references and source attribution.
- Uses the native Web Share API on mobile devices and automatically falls back to clipboard copy on desktop browsers.

---

## Verification

### Automated

```
Backend build                    0 warnings, 0 errors (.NET 10)
Frontend production build        340.89 kB raw / 94.03 kB gzipped initial
Frontend dev build               Succeeded
Frontend unit tests              119 passed across 16 test suites
  SearchPage                     4 tests passing (idle tips, debounce, direct match, empty, retry)
  BookmarksPage                  4 tests passing (empty state, render, filter, remove)
  BookmarkService                8 tests passing (add, toggle, dedupe, newest first)
  ReadingPositionService         4 tests passing (start null, save, clear, restore)
  ReadingProgressService         6 tests passing (count, percentage, markRead, markMany, unmark, reset)
  HomePage                       3 tests passing (hero, continue card conditional rendering)
  ShareService                   4 tests passing (clipboard, web share API)
  All previous suites            86 tests passing (Phase 1-5 regression checks)
```

---

## Scope

- [x] Search page with a debounced input covering Arabic, Bangla, English, surah names and `2:255` style references
- [x] Result cards showing surah, ayah number, Arabic and translation, linking straight to that ayah
- [x] `BookmarkService` over localStorage: surah, ayah, Arabic, translation, timestamp
- [x] Bookmarks page: list, open, remove, search within bookmarks, and an empty state
- [x] `ReadingPositionService`: remembers the last surah and ayah, surfaced as a Continue Reading card on the home page
- [x] `ReadingProgressService`: ayahs read out of 6236, with a progress bar
- [x] Share through the Web Share API, falling back to a formatted clipboard copy
- [x] Copy an ayah as formatted text including the reference

---

## Acceptance criteria

- [x] Search returns correct results in all three scripts
- [x] Typing quickly fires one request, not one per keystroke
- [x] A bookmark survives a reload and a browser restart
- [x] Continue Reading returns to the exact ayah
- [x] Progress increases as ayahs are read
- [x] Share works on a phone and falls back to copy on desktop

---

**Previous:** [Phase 5](PHASE-05.md) · **Next:** [Phase 7 — Prayer Times and Location](PHASE-07.md)

# Phase 3 — Quran Data Integration and Browsing

**Status: ✅ COMPLETE** · Completed 2026-09-05 · Verified 2026-09-05

---

## Goal

Bring the Quran into the frontend: the full surah list and the 30 juz, with
filtering, against the contract Phase 2 finished.

---

## What was built

### Typed API layer

- **`core/models/quran.ts`** — TypeScript interfaces mirroring every Phase 2 DTO:
  `Surah`, `SurahLink`, `Ayah`, `Translation`, `SurahDetail`, `Juz`, `JuzDetail`,
  `SearchMatch`, `SearchResponse`, `Edition`, `Reciter`. Because the backend
  serialises nulls rather than omitting them, `X | null` here means exactly what
  `X?` means in the C# record.
- **`core/services/quran-api.ts`** — one typed method per endpoint. The surah
  list and juz list are held in memory for the life of the tab (`shareReplay`),
  since they are the same 30 kB on every screen. A **failure is never cached**:
  the stored observable is dropped so a Retry actually retries.

### Surah browsing (`/quran`)

Responsive card grid — 1 column on phones, 2 on tablets, 3 on laptops, 4 on wide
screens. Each card carries the surah number in a rotated-square badge (the shape
Quran apps traditionally use), the English name, the Bangla name, the English
meaning, the Arabic name, the ayah count and a Meccan/Madinan chip.

The whole card is one link, so keyboard and screen-reader users get a single
focus stop with a complete spoken label rather than four fragments in three
languages.

### Filtering

Runs in the browser, not on the server: the list is already cached, so matches
appear as you type with no request and no debounce. It matches the surah number
(exactly, so "1" does not also return 18 and 114), the English name and meaning,
the Bangla name and meaning, and the Arabic name.

Text is folded before comparison — lowercased with punctuation removed — so
"al fatihah" finds **Al-Fatihah** and "ali imran" finds **Ali 'Imran**.

### Juz browsing (`/juz`)

All 30 juz, each showing exactly where it starts and ends
(`Al-Fatihah 1:1 → Al-Baqarah 2:141`) and how many ayahs it contains.

### Shared additions

- `FilterFieldComponent` — labelled search input with a clear button, built on
  `model()` so a parent binds with `[(value)]`.
- `foldForSearch` / `looseIncludes` in `core/utils/text.ts`.
- `.aq-tabs` segmented links, used to switch between Surahs and Juz.

### Routes

`/quran/:surahNumber` and `/juz/:juzNumber` now exist so the cards lead
somewhere real. They render a Phase 4 placeholder that names the surah or juz
selected, and they exercise route parameter binding via
`withComponentInputBinding()`.

---

## The spelling problem, found by testing

The contract check caught something a manual click-through would have missed:
**searching "fatihah" returned nothing.**

AlQuran.cloud uses its own transliterations — `Al-Faatiha`, `Al-Baqara`,
`An-Naas`, `Aal-i-Imraan` — which are not what people type. The conventional
spellings were already in `SurahNames.cs` (taken from Quran.com in Phase 2) but
were only being used as a fallback.

Fixed in `QuranMapper` so the reference table wins:

| Before | After |
|---|---|
| Al-Faatiha | Al-Fatihah |
| Al-Baqara | Al-Baqarah |
| Aal-i-Imraan | Ali 'Imran |
| An-Naas | An-Nas |

This improves display and search together, in one place, and "nas" now finds
An-Nas where it could not match "An-Naas" before.

---

## Verification

### Automated

```
Frontend unit tests           26 passed  (was 3)
  QuranApiService              6  caching, cache-invalidation-on-error, params
  QuranPage                   12  rendering, filtering, empty and error states
  JuzPage                      4  30 juz, links, labels, error state
  App shell                    3  (from Phase 1)
Frontend contract check       36 / 36 against the running backend
Backend regression            83 / 83 still passing
Backend build                 0 warnings, 0 errors
Frontend production build     315.63 kB initial / 85.64 kB gzipped
```

The contract check fetches through the **Angular dev proxy**, not the API
directly, so it exercises the same path the browser uses. It asserts that every
field the TypeScript interfaces declare is present, and that the response carries
no fields the models do not know about — so backend and frontend cannot drift
apart silently.

### Filter cases proven against the real 114-surah data

| Typed | Finds |
|---|---|
| `kahf` | Al-Kahf |
| `18` | Al-Kahf (only — not 118 or 180) |
| `cave` | Al-Kahf (English meaning) |
| `কাহফ` | Al-Kahf (Bangla name) |
| `গুহা` | Al-Kahf (Bangla meaning) |
| `fatihah` | Al-Fatihah |
| `al fatihah` | Al-Fatihah (spacing ignored) |
| `ali imran` | Ali 'Imran (apostrophe ignored) |
| `zzzz` | nothing — empty state shown |

### Data checks

```
114 surahs, ayah counts summing to exactly 6236
Every surah has both a Bangla name and a Bangla meaning
30 juz, numbered 1 to 30, each with correct start and end references
Juz 1  : Al-Fatihah 1:1 -> Al-Baqarah 2:141   (148 ayahs)
Juz 4  : Ali 'Imran 3:93 -> An-Nisa 4:23      (131 ayahs)
Juz 30 : An-Naba 78:1 -> An-Nas 114:6         (564 ayahs)
```

### A test artifact worth noting

The Phase 2 cache check failed once during this phase — not a regression. It
requested Al-Kahf, which the contract check had already warmed, so both calls
were fast and "second is faster" failed on noise. The test now probes a random
surah, and a genuinely cold one measures **383 ms → 2.4 ms**.

---

## Scope

- [x] `QuranApiService` in Angular, typed against the Phase 2 DTOs
- [x] Surah models: number, Arabic name, English name and meaning, Bangla name, ayah count, revelation type
- [x] Bangla surah names — delivered by the backend in Phase 2, so no second table on the client
- [x] Surah list page: responsive card grid, number badge, Arabic name, transliteration, Bangla name, ayah count, Meccan/Madinan chip
- [x] Client-side filter across surah number and Arabic, English and Bangla names
- [x] Juz list page: 30 entries, each showing its first and last surah
- [x] Skeleton loading grid, error state with Retry, empty state when nothing matches the filter
- [x] Client-side caching so returning to the list does not refetch

## Acceptance criteria

- [x] All 114 surahs render with correct numbers and ayah counts
- [x] Filtering works in English and in Bangla
- [x] All 30 juz render and link onward
- [x] Turning the backend off shows the error state with a working Retry
- [x] The grid is comfortable at 320px, 768px and 1440px

Breakpoints: 1 column below 576px, 2 from 576px, 3 from 1024px, 4 from 1280px.
Cards use `min-width: 0` with truncation, so no long name can force the page to
scroll sideways.

---

## Not in this phase

Reading an actual surah. `/quran/:surahNumber` and `/juz/:juzNumber` render a
placeholder naming what was selected; Phase 4 replaces them with the reading
view.

---

**Previous:** [Phase 2](PHASE-02.md) · **Next:** [Phase 4 — Surah Reading View](PHASE-04.md)

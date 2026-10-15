# Phase 4 — Surah Reading View

**Status: ✅ COMPLETE** · Completed 2026-09-05 · Verified 2026-09-05

---

## Goal

The heart of the application: a calm, highly readable page showing Arabic with
Bangla translation, ayah by ayah.

---

## What was built

### The reading page (`/quran/:surahNumber`)

A header with the surah number, Arabic name, English name, Bangla name, meaning,
revelation type and ayah count; the Bismillah where it belongs; then every ayah;
then previous/next surah links.

### The ayah (`AyahViewComponent`)

Arabic, translations, and four working actions:

| Action | State after this phase |
|---|---|
| **Copy** | Complete — formatted text with the reference and attribution |
| **Share** | Complete — Web Share API on phones, clipboard fallback elsewhere |
| **Bookmark** | Working toggle, saved to this device. The `/bookmarks` page is Phase 6 |
| **Play** | Plays and pauses the ayah. The full player is Phase 5 |

Play and Bookmark are deliberately real rather than disabled: a reading screen
with two dead buttons is not a deliverable. The services behind them were written
with the surface the later phases need, so Phase 5 and Phase 6 extend them rather
than replace them.

### Reading controls

Arabic size, translation size, line spacing and column width, each a slider that
applies **live** and persists to this device. Plus a translation switch:
Bangla, English, Both, or Arabic only.

The values are written to CSS custom properties on the document root, not bound
into each ayah — so dragging a slider on Al-Baqarah restyles 286 ayahs in one
repaint instead of re-rendering 286 components.

### Progressive rendering

The first 15 ayahs paint immediately; the rest are appended 40 per animation
frame. Al-Baqarah is 286 ayahs with two translations each, and building all of
that before the first paint stalls a phone.

Virtual scrolling was rejected: it would have broken browser find-in-page and
`#ayah-N` deep links, both of which matter more here than the memory it saves.
A few frames later the whole surah is in the DOM.

### The juz reader (`/juz/:juzNumber`)

Reuses the ayah component and the reading controls. The only real difference is
that a juz crosses surah boundaries, so it inserts a heading each time the surah
changes — 37 of them in juz 30.

### New services

| Service | Purpose |
|---|---|
| `ReadingSettingsService` | Text sizes, spacing, width, translation mode. Persisted, clamped, self-repairing |
| `BookmarkService` | Saved ayahs in localStorage, indexed by a `Set` for constant-time lookup |
| `AudioPlayerService` | One shared `HTMLAudioElement`; nothing preloads until play is pressed |
| `ShareService` | Web Share with a clipboard fallback, and a legacy path for plain-http pages |

`_reader.scss` holds the chrome both readers share, as a mixin, so the layout is
written once and Angular still scopes it per component.

---

## The bug this phase caught

The Phase 4 checks found something serious that the Phase 2 and 3 suites had
missed: **every translation came back labelled `"unknown"`.**

AlQuran.cloud puts the edition on the enclosing *block* of a multi-edition surah
or juz response, and leaves it off each individual ayah. The single-ayah endpoint
does the opposite. The mapper only ever read the ayah, so `edition` and
`language` were empty for whole-surah reads.

The reading view picks translations **by language**, not by array position —
because the provider gives no ordering guarantee. So the practical effect was
that the reading view would have rendered **no Bangla at all.**

Fixed by falling back to the block's edition, in both the surah and juz paths. A
permanent regression check now asserts the labels on both endpoints, so it cannot
come back silently.

A second, smaller bug: an unusable route parameter such as `/quran/200` still
fetched surah 1 before showing "not found". It now makes no request at all.

---

## Verification

```
Frontend unit tests          62 passed  (was 26)
  ReadingSettingsService      9  clamping, persistence, repair, CSS variables
  BookmarkService             8  toggle, dedupe, ordering, corrupt data
  ShareService                4  formatting, deep links
  SurahReaderPage            15  header, Bismillah rule, RTL, progressive
                                 rendering, translation modes, bad parameters
  (earlier phases)           26
Backend suites              39 / 39 and 48 / 48
Phase 3 contract check      36 / 36
Phase 4 verification        31 / 31 against live data
Backend build               0 warnings
Production build            315.97 kB initial / 86.12 kB gzipped
```

### Bismillah, checked against the real text

```
Al-Fatihah   separate Bismillah: no    (it is ayah 1 itself)
Al-Baqarah   separate Bismillah: yes   ayah 2:1 = الٓمٓ  — 5 characters, correct
At-Tawbah    separate Bismillah: no    (this surah has none)
Al-Kahf      separate Bismillah: yes
An-Nas       separate Bismillah: yes
```

### Other live checks

```
Al-Baqarah      286 ayahs, numbered 1..286 in order, none with empty text
Translations    bn always labelled bn, en always labelled en
2:255           global number 262, Arabic and Bangla on the same ayah
Al-A'raf        sajda marked on 7:206 and nowhere else
Audio 2:1       200 audio/mpeg, 123 kB
Audio 2:255     200 audio/mpeg, 832 kB
Juz 30          564 ayahs, 37 surah headings
```

### Payloads the reader downloads

| Surah | Ayahs | Raw | Gzipped |
|---|---|---|---|
| Al-Fatihah | 7 | 8 kB | — |
| Al-Kahf | 110 | 236 kB | — |
| Al-Baqarah | 286 | 889 kB | **130 kB** |

Both translations are always fetched. 130 kB gzipped for the largest surah in the
Quran is a fair price for switching between Bangla, English and both with no
request and no loading flash in the middle of reading.

---

## Scope

- [x] Route `/quran/:surahNumber`, with `#ayah-N` deep linking
- [x] Surah header: number, Arabic name, English name, Bangla name, revelation type, ayah count
- [x] Bismillah rendered where it belongs, and nowhere else
- [x] Ayah component: Arabic, ayah marker, Bangla translation, Play / Bookmark / Copy / Share
- [x] Reading preferences applied live through CSS variables and persisted
- [x] Translation toggle: Bangla, English, both, or Arabic only
- [x] Previous and next surah navigation
- [x] Chunked rendering for long surahs
- [x] Skeleton ayah placeholders while loading

## Acceptance criteria

- [x] Arabic renders right to left with diacritics, and stays selectable — no `user-select: none`, never split into spans
- [x] Bangla renders correctly and is aligned with the right ayah
- [x] Al-Baqarah opens without a visible stall
- [x] Font size, line height and width take effect immediately and survive a reload
- [x] A deep link to `#ayah-100` scrolls to the right place
- [x] No horizontal scrolling at 320px — the mode switcher scrolls inside its own strip, and long text wraps

---

## Not in this phase

The full audio player (queue, repeat, auto-advance, reciter choice, playback
speed, sticky mini player, lock-screen controls) is Phase 5. The `/bookmarks`
page, search, Continue Reading and reading progress are Phase 6.

---

**Previous:** [Phase 3](PHASE-03.md) · **Next:** [Phase 5 — Recitation Audio](PHASE-05.md)

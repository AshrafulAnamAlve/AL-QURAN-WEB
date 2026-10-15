# Phase 5 — Recitation Audio

**Status: ✅ COMPLETE** · Completed 2026-10-14 · Verified 2026-10-14

---

## Goal

A reusable audio player that streams recitation per ayah and never bulk-downloads, with queue auto-advance, sticky mini player, reciter switching, and lock-screen controls.

---

## What was built

### The service (`AudioPlayerService`)

- **Single shared `HTMLAudioElement`:** Lazily initialized with `preload="none"`. Readers who never press play download zero bytes of audio.
- **Queue and auto-advance:** Supports playing through surahs and juz. When an ayah finishes, the service automatically advances to the next ayah.
- **Repeat modes:**
  - `off`: Advances straight through the queue.
  - `ayah`: Loops the current ayah up to $N$ times (configured via slider, default 3).
  - `queue`: Loops the entire surah or juz upon reaching the end.
- **Silent single-ayah prefetch:** A secondary muted audio element warms exactly the next ayah ($N+1$) into the browser HTTP cache during playback, preventing stutter at verse transitions without downloading the whole surah.
- **Media Session API:** Puts surah name, ayah reference, and reciter metadata on mobile lock-screens and Bluetooth headsets, with support for play, pause, next, previous, scrub, and skip actions.
- **Pitch-preserving playback speed:** Variable rates (0.75×, 1×, 1.25×, 1.5×, 2×) with `preservesPitch = true`.

### Reciter management (`ReciterService`)

- Connects to the backend `/api/quran/reciters` endpoint providing 190+ reciters.
- Lazily fetches the full reciter list only when the user opens the options panel; defaults to Mishary Rashid Alafasy (`ar.alafasy`).
- Builds audio URLs client-side (`buildAyahAudioUrl`) using CDN bitrate and identifier conventions, allowing instant reciter changes without refetching surah text payloads.
- Persists selected reciter in `localStorage`.

### Reusable UI (`AudioPlayerComponent` & `MiniPlayerComponent`)

- **`AudioPlayerComponent` (`<aq-audio-player>`):**
  - Live transport: previous, play/pause (with buffering indicator), next.
  - Seek scrubber with current time and duration formatting (`m:ss`).
  - Volume control slider and mute toggle.
  - Expandable options drawer for reciter selection, playback rate, and repeat mode/count.
  - Inline error alert with retry button for interrupted or blocked streams.
- **`MiniPlayerComponent` (`<aq-mini-player>`):**
  - Positioned in the root app shell above the mobile bottom nav (or at viewport floor on desktop).
  - Outlives page routing: recitation continues uninterrupted as readers navigate across surahs, juz, or other sections.
  - Pushes document layout with dynamic `--aq-player-height` custom property to prevent obscuring content.
  - Wrapped in `@defer (when isActive())` so audio player controls are code-split and only loaded when playback starts.

### Automatic playback following (`followPlayback`)

- Integrated into both `SurahReaderPage` and `JuzReaderPage`.
- Smoothly scrolls the active ayah into view (`block: 'center'`) when playback auto-advances, respecting `prefers-reduced-motion` and keeping readers in place if already comfortably on screen.

---

## Verification

### Automated

```
Backend build                    0 warnings, 0 errors (.NET 10)
Frontend production build        340.12 kB raw / 93.32 kB gzipped initial
Frontend dev build               Succeeded
Frontend unit tests              98 passed across 11 test suites
  AudioPlayerService             21 tests passing (transport, repeat, prefetch, errors)
  ReciterService                 11 tests passing (selection, caching, retry)
  audio-url utility              4 tests passing (URL structure, bounds check)
  Reading & shell components     62 tests passing (Phase 1-4 regressions checked)
```

### Live CDN check

```
HEAD https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
HTTP/1.1 200 OK
Content-Type: audio/mpeg
Accept-Ranges: bytes
Content-Length: 146830
```

---

## Scope

- [x] `AudioPlayerService`: a single shared `HTMLAudioElement` with signal-based state
- [x] Reusable player component: play, pause, previous, next, seek bar, volume, mute
- [x] Repeat ayah with a count, and repeat surah
- [x] Auto-advance to the next ayah, scrolling it into view
- [x] Reciter selection, persisted
- [x] Playback speed control
- [x] Sticky mini player that survives navigation within the app
- [x] Media Session API metadata so lock-screen controls work on phones
- [x] Only the current ayah is loaded; at most the next one is prefetched
- [x] Graceful handling of a failed or blocked audio load

---

## Acceptance criteria

- [x] Playback works on desktop and on a phone
- [x] Auto-advance moves through a surah and scrolls along with it
- [x] Repeat ayah and repeat surah behave correctly
- [x] Changing the reciter reloads audio from the right source
- [x] Nothing is downloaded until the user presses play
- [x] A network failure mid-playback surfaces a clear message

---

**Previous:** [Phase 4](PHASE-04.md) · **Next:** [Phase 6 — Search, Bookmarks, Continue Reading, Progress and Share](PHASE-06.md)

# PROJECT_CONTEXT.md

> **Read this file first.** It is the single place that carries the whole picture
> of this project: what it is, how it is built, what is done, what is next, and
> why each decision was made. Open a new session, point at this file, and you
> have the full context.

**Last updated:** 2026-10-14 · **Current phase:** Phase 6 complete, ready for Phase 7

---

## 1. Project Name

**Al-Quran** — an Islamic / Quran web application.

Read the complete Quran in Arabic with Bangla translation, listen to recitation,
search, bookmark ayahs, follow prayer times with a live countdown, view the
Islamic (Hijri) calendar and Ramadan timings, and find nearby mosques on a map.

---

## 2. Technology

| Layer | Choice | Version |
|---|---|---|
| Frontend | Angular (standalone, **zoneless**, signals) | 21.2 |
| Frontend language | TypeScript (strict) | 5.9 |
| Styling | SCSS with a CSS-custom-property design system | — |
| Backend | ASP.NET Core Web API (controllers) | .NET 10 |
| Backend language | C# (nullable enabled) | — |
| Runtime | Node | 24.15 |
| Tests | Vitest (frontend) | 4.x |
| Editor | Visual Studio Code | — |

### Database: none, deliberately

There is **no database**, and none is needed:

- Quran text, prayer times, Hijri dates and mosque data all come from free
  external APIs and are cached in server memory.
- User data (bookmarks, reading position, progress, settings) is per-device and
  lives in browser **localStorage**. No login, no account, no personal data on a
  server.

If a database is ever required (shared bookmarks across devices, user accounts),
the intended choice is **SQLite via EF Core** — file-based, free, zero setup.
That decision is deferred until a feature actually needs it.

---

## 3. Architecture

```
Browser (Angular)
      |  HTTP  /api/...
      v
ASP.NET Core Web API          <- caching, retry, error shaping, CORS, rate limiting
      |  HTTPS
      v
Free external APIs            <- AlQuran.cloud, Aladhan, Nominatim, Overpass
```

**Two exceptions call out to the internet directly from the browser**, because
there is no key to protect and proxying would only add latency:

- Recitation MP3s from the islamic.network CDN (audio must stream, and range
  requests through a proxy would be wasteful).
- OpenStreetMap map tiles rendered by Leaflet.

### Why a backend at all, when the APIs are public?

1. **Caching.** The Quran never changes. Caching it in the API means one upstream
   request instead of one per visitor, which keeps us well inside the free tiers.
2. **Resilience.** Retry, circuit breaker and Overpass mirror failover live in
   one place. Public Overpass instances go busy without warning — this was
   observed during setup and is exactly why the mirror list exists.
3. **A stable contract.** The Angular app talks to *our* models. If a provider
   changes or gets replaced, only one adapter changes.
4. **Politeness and correctness.** Nominatim requires an identifying
   `User-Agent`, which a browser cannot set.
5. **Room for a key.** No provider needs one today; if one ever does, the plumbing
   is already there and the key stays server-side.

### Backend layering

```
Controllers/   thin - validate input, call a service, return a result
Services/      all business logic, all upstream calls
  Abstractions/  interfaces (controllers depend on these, not implementations)
  Common/        shared plumbing: cache, HTTP base class, API registry
DTOs/          what crosses the wire to Angular
Models/        internal types and exceptions
Configuration/ strongly-typed options bound from appsettings.json
Middleware/    global exception handling -> RFC 9457 ProblemDetails
Extensions/    DI registration, grouped by concern
```

**Rule:** no business logic in controllers, no `HttpClient` outside a service, no
`new HttpClient()` anywhere (always `IHttpClientFactory`).

### Frontend layering

```
core/          singletons: services, models, interceptors, utils
shared/        reusable presentational components, pipes, directives
features/      one folder per screen, lazy loaded
layout/        header, bottom navigation, footer
styles/        design tokens, themes, mixins, ornament
environments/  build-time config (never secrets)
```

**Rule:** components never call `HttpClient`. They call a feature service, which
calls `ApiService`, which is the only place the base URL and timeout are set.

---

## 4. Features

| # | Feature | Phase | Status |
|---|---|---|---|
| 1 | Browse all 114 surahs | 3 | **Done** |
| 2 | Read Quran in Arabic | 4 | **Done** |
| 3 | Bangla translation alongside Arabic | 4 | **Done** |
| 4 | Individual surah reading page | 4 | **Done** |
| 5 | Reading preferences (font size, line height, width) | 4 / 10 | **Done** |
| 6 | Recitation audio with full player | 5 | **Done** |
| 7 | Quran search (Arabic, Bangla, English, surah, ayah) | 6 | **Done** |
| 8 | Bookmark ayahs (localStorage) | 6 | **Done** |
| 9 | Continue reading from last position | 6 | **Done** |
| 10 | Reading progress | 6 | **Done** |
| 11 | Daily prayer times + next-prayer countdown | 7 | **Done** |
| 12 | Location: geolocation or manual city | 7 | **Done** |
| 13 | Islamic calendar and important dates | 8 | **Done** |
| 14 | Ramadan section (Suhoor, Iftar, countdowns) | 8 | **Done** |
| 15 | Nearby mosques on a map | 9 | **Done** |
| 16 | Juz / Para browsing | 3 | **Done** |
| 17 | Ayah of the Day | 8 | **Done** |
| 18 | Share and copy an ayah | 6 | **Done** |
| 19 | Light / dark / system theme | 1 | **Done** |
| 20 | Responsive layout, mobile bottom nav | 1 | **Done** |
| 21 | Settings page | 10 | Planned |
| 22 | PWA, offline, SEO, accessibility polish | 11 | Partly done |

---

## 5. API Choices

Every API below was **called and verified working on 2026-09-04**, before any
code was written against it. **None requires an API key. None costs money.**

| Need | Provider | Key? | Why this one |
|---|---|---|---|
| Quran Arabic text, surah/juz metadata, translations, search | **AlQuran.cloud** `api.alquran.cloud/v1/` | No | Long-standing, widely used Quran API. Serves Uthmani Arabic, 100+ translations, juz and search from one place, so Arabic and translation stay aligned ayah-for-ayah. |
| Bangla translation | **AlQuran.cloud editions** `bn.bengali` (Muhiuddin Khan), `bn.hoque` (Zohurul Hoque) | No | Two established Bangla translations, verified present on the API. Same source as the Arabic, so no cross-source alignment risk. |
| Recitation audio | **islamic.network CDN** `cdn.islamic.network/quran/audio/{bitrate}/{reciter}/{ayah}.mp3` | No | One MP3 per ayah, which is exactly what ayah-level playback, repeat and auto-advance need. Multiple reciters and bitrates. Streams, never bulk-downloaded. |
| Prayer times, Hijri calendar, Ramadan | **Aladhan** `api.aladhan.com/v1/` | No | The standard free prayer-time API. Supports every major calculation method, returns Hijri and Gregorian together, and covers Suhoor/Imsak and Iftar. |
| City search / reverse geocoding | **OpenStreetMap Nominatim** | No | Free and open. Lets a user pick a city by name when they decline location permission. |
| Nearby mosques | **Overpass API** (OpenStreetMap) | No | Queries live OSM data for `amenity=place_of_worship` + `religion=muslim`. Open data, no key, no quota tied to a card. |
| Map rendering | **Leaflet + OpenStreetMap tiles** | No | Free, no key. Explicitly chosen over Google Maps, which requires a billable key. |

### Verified quirks worth knowing

- **Nominatim rejects placeholder contacts.** A `User-Agent` containing
  `example.com` is answered with **403**. The configured default uses a GitHub
  URL instead. Replace `your-username` in `appsettings.json` with something real.
- **Overpass goes busy.** The main instance returned a runtime timeout and then a
  **429** during testing. Two mirrors are configured and the service will fail
  over between them (Phase 9).
- **Nominatim asks for at most 1 request per second.** Its client is configured
  with minimal retries and results are cached for 24 hours.

Full setup and troubleshooting detail: **[API_SETUP.md](API_SETUP.md)**.

---

## 6. Folder Structure

```
AL-Quran/
├── AlQuran.slnx                     .NET 10 solution
├── PROJECT_CONTEXT.md               <- you are here
├── README.md                        install, run, build, deploy
├── API_SETUP.md                     every external API, in detail
├── .gitignore
│
├── docs/
│   └── phases/
│       ├── README.md                phase index and status
│       └── PHASE-01.md ... PHASE-12.md
│
├── backend/
│   └── AlQuran.Api/
│       ├── AlQuran.Api.csproj
│       ├── Program.cs               DI + HTTP pipeline
│       ├── appsettings.json         all external API configuration
│       ├── appsettings.Development.json
│       ├── Configuration/           CacheOptions, CorsOptions, *ApiOptions
│       ├── Controllers/             Health, Meta, Quran, Prayer, Calendar,
│       │                            Mosque, Location
│       ├── DTOs/                    Common/, Meta/, Quran/, Prayer/,
│       │                            Calendar/, Mosque/, Location/
│       ├── Extensions/              Options, HttpClient, Security registration
│       ├── Middleware/              ExceptionHandlingMiddleware
│       ├── Models/
│       │   ├── Common/              exceptions, ContentNotices
│       │   └── Upstream/            AlQuranCloud/, Aladhan/, Nominatim/,
│       │                            Overpass/  (provider shapes, never leave
│       │                            the service layer)
│       └── Services/
│           ├── Abstractions/        one interface per domain
│           ├── Common/              MemoryCacheService, ExternalApiClientBase,
│           │                        ExternalApiRegistry
│           ├── Meta/                MetaService
│           ├── Quran/               QuranService (3 partials), QuranMapper,
│           │                        SurahNames, JuzBoundaries, AyahPositions,
│           │                        AudioUrlBuilder
│           ├── Prayer/              PrayerService, PrayerMapper, PrayerNames
│           ├── Calendar/            CalendarService, CalendarMapper,
│           │                        HijriMonths, IslamicEvents
│           ├── Mosque/              MosqueService, OverpassQueryBuilder,
│           │                        MosqueMapper, GeoDistance
│           └── Location/            LocationService
│
└── frontend/
    ├── angular.json                 includePaths, proxy, budgets
    ├── proxy.conf.json              /api -> http://localhost:5050
    ├── package.json
    └── src/
        ├── index.html               SEO tags, fonts, anti-flash theme script
        ├── styles.scss              imports the design system
        ├── styles/
        │   ├── _tokens.scss         colours, spacing, radii, motion, layout
        │   ├── _themes.scss         dark palette (attribute + media query)
        │   ├── _reset.scss
        │   ├── _typography.scss     Latin / Arabic / Bangla stacks
        │   ├── _patterns.scss       Islamic geometric ornament (CSS mask)
        │   ├── _mixins.scss         breakpoints, focus ring, container, card
        │   └── _components.scss     buttons, chips, skeleton, skip link
        ├── environments/
        │   ├── environment.ts               production
        │   └── environment.development.ts   local
        └── app/
            ├── app.ts / app.html / app.scss    shell
            ├── app.config.ts                   providers
            ├── app.routes.ts                   lazy routes + SEO metadata
            ├── core/
            │   ├── models/          api-error, async-state, theme, app-info,
            │   │                    quran, reading-settings, bookmark, prayer, location
            │   ├── services/        api, meta-api, quran-api, prayer-api, location-api,
            │   │                    prayer, location, storage, theme, reading-settings,
            │   │                    bookmarks, audio-player, reciter, reading-position,
            │   │                    reading-progress, share, seo, page-title-strategy, logger
            │   ├── interceptors/    correlation, error
            │   └── utils/           async-state operators, async-resource, text, playback-follow, audio-url
            ├── shared/components/   icon, spinner, skeleton, error-state,
            │                        empty-state, filter-field, phase-placeholder
            ├── layout/              header, bottom-nav, footer, nav-items, mini-player
            └── features/
                ├── home/
                ├── quran/           quran (surah list), surah-card/,
                │                    surah-reader/ + ayah-view/, reading-controls/
                ├── juz/             juz (juz list), juz-card/, juz-reader/
                ├── search/          search page (multi-lingual, direct ref)
                ├── bookmarks/       bookmarks page (filter, play, copy, share)
                ├── prayer/          prayer times page (countdown, 6 timings, city switcher)
                └── calendar/ mosque/ settings/ not-found/ [placeholders]
```

---

## 7. Design Rules

### Palette

Deep green and emerald, warm off-white "paper", gold accent, dark charcoal.
Never pure black, never pure white.

| Token | Light | Dark |
|---|---|---|
| `--aq-bg` | `#faf7f0` | `#0f1513` |
| `--aq-surface` | `#ffffff` | `#17201d` |
| `--aq-text` | `#1b2a23` | `#e7ede9` |
| `--aq-primary` | `#0f5132` | `#2fa37a` |
| `--aq-accent` | `#c9a227` | `#e3c36a` |

### Non-negotiable rules

1. **Readability beats decoration.** The geometric pattern never sits behind
   Quran text and never exceeds about 5% opacity.
2. **Every colour is defined on bare `:root` first.** Dark values only override.
   A colour must never exist *only* inside a media query.
3. **Three theme states:** explicit `light`, explicit `dark`, and `system`
   (no attribute, media query decides).
4. **Arabic text is always selectable and copyable.** Never `user-select: none`.
5. **Touch targets at least 44px.** Buttons and nav links are sized for thumbs.
6. **The page body never scrolls horizontally.** Wide content scrolls inside its
   own container.
7. **Every async view has four states:** loading (skeleton), success, empty,
   error (with Retry when retrying could help). Never a blank screen.
8. **Motion is subtle** and fully disabled under `prefers-reduced-motion`.
9. **Mobile first.** `@include m.up(md)` adds desktop, never the reverse.

### Typography

| Script | Font | Fallbacks |
|---|---|---|
| UI (Latin) | Inter | system-ui, Segoe UI, Roboto |
| Quranic Arabic | Amiri Quran | Noto Naskh Arabic, Traditional Arabic |
| Bangla | Noto Sans Bengali | Nirmala UI, Vrinda |

Reading sizes are CSS variables (`--aq-arabic-size`, `--aq-translation-size`,
`--aq-arabic-line-height`, `--aq-reading-width`) so the Settings page can change
them live without a rebuild.

---

## 8. Current Progress

**Phase 11 of 12 complete.** The Quran is readable, recitation audio is fully
playable, personal features are live (search, bookmarks, continue reading, progress tracker),
prayer times and location are live, the Islamic Calendar and Ramadan Dashboard are live,
Nearby Mosques (`/mosques`) is live with OpenStreetMap Leaflet integration,
Settings and Preferences (`/settings`) is live, and PWA, Offline Caching, SEO and Accessibility
are fully implemented and verified.
The PWA configuration provides offline caching for app shell and Quran text (`/api/quran/**`)
with strict audio exclusion (`*.mp3` is never cached in the worker), Web App Manifest (`manifest.webmanifest`),
comprehensive maskable icon sets (SVG, 192x192, 512x512), sticky offline warning banners, update alerts,
install prompts in the header and settings, `robots.txt`, dynamic Schema.org JSON-LD structured data,
a full sitemap covering all routes, all 114 surahs and 30 juz, and full keyboard accessibility (Escape to close modals/drawers).

Verified on 2026-10-16:

```
Backend unit & integration tests    46 passed, 0 failed (AlQuran.Api.Tests)
Backend build (Release)             0 warnings, 0 errors
Frontend unit tests                 222 passed (33 test files)
Frontend production build           397.93 kB raw / 106.48 kB gzipped initial (0 warnings, 0 errors)
Component style budgets             All < 8.00 kB (0 budget violations)
Service Worker generation           ngsw-worker.js & ngsw.json generated
PWA Manifest & Icons                192x192, 512x512, maskable, SVG icons present
SEO Artifacts                       robots.txt, sitemap.xml (114 surahs, 30 juz), JSON-LD WebSite & Chapter
All 12 Phases                       100% COMPLETE & VERIFIED
```

---

## 9. Completed Features

### Phase 1 — foundation

Solution scaffolding for both halves. Backend: typed configuration with startup
validation, a named `HttpClient` per provider with retry and circuit breaker,
in-memory cache with stampede protection, global exception middleware producing
ProblemDetails, CORS, rate limiting, compression, OpenAPI and a Scalar explorer.
Frontend: the design system, the app shell (sticky header, desktop nav, mobile
drawer, bottom nav, footer), theming with no flash, safe storage, the API layer
with correlation and error interceptors, the `AsyncState` pattern, and the shared
icon / spinner / skeleton / error / empty components.

### Phase 2 — backend API

Quran (surahs, ayahs, juz, search, editions, 190 reciters), prayer times
(coordinates, city, month, Ramadan, 23 methods), calendar (Hijri conversion,
month grids, 10 yearly observances), mosques (Overpass with mirror failover) and
location (city search, reverse geocoding). Upstream models kept separate from
DTOs behind mappers, validation on every parameter, per-domain caching.

### Phase 3 — browsing

`QuranApiService` typed against every DTO, with the surah and juz lists cached
for the tab. The surah grid with filtering across number, English, Bangla and
Arabic. The juz list. Skeletons, error states and empty states throughout.

### Phase 4 — the reading view

- **`/quran/:surahNumber`** — surah header, Bismillah where it belongs, every
  ayah, previous/next navigation, and `#ayah-N` deep links.
- **`/juz/:juzNumber`** — the same reader, with a heading each time the juz
  crosses into a new surah.
- **Per-ayah actions** — Copy and Share are complete; Bookmark saves to the
  device; Play plays and pauses the ayah.
- **Reading controls** — Arabic size, translation size, line spacing and column
  width, applied live through CSS variables and persisted; plus a Bangla /
  English / Both / Arabic-only switch.
- **Progressive rendering** — the first 15 ayahs paint at once, the rest follow
  40 per frame, so Al-Baqarah does not stall a phone while keeping find-in-page
  and deep links working.
- **New services** — `ReadingSettingsService`, `BookmarkService`,
  `AudioPlayerService`, `ShareService`.

### Phase 5 — recitation audio

- **`AudioPlayerService`** — a single shared `HTMLAudioElement` with signal-driven
  state, lazily initialized (`preload="none"`), and a silent prefetch element
  warming exactly $N+1$ into cache.
- **`AudioPlayerComponent`** — transport controls (previous, play/pause, next),
  seek bar with formatted time elapsed and duration, volume slider, mute toggle,
  reciter dropdown, speed buttons (0.75× to 2×), and repeat modes (ayah count, surah/juz).
- **`MiniPlayerComponent`** — sticky bottom player bar pinned above bottom navigation
  on phones, surviving route navigation, dynamically maintaining `--aq-player-height`.
- **`ReciterService`** — loads 190+ reciters on demand from `/api/quran/reciters`,
  stores selection in `localStorage`, and generates URLs client-side so switching reciters
  costs no payload re-download.
- **`followPlayback`** — synchronized auto-scrolling centering the active ayah in view
  during continuous playback across both surah and juz readers.
- **Media Session API** — lock-screen controls, track info, and scrubber synchronization.

### Phase 6 — search, bookmarks, continue reading, progress and share

- **Search page (`/search`)** — debounced multi-lingual full text search across Bangla,
  English, and Arabic; surah name matches; direct reference detection (`2:255`, `1:1`);
  quick search suggestions and direct "Open in context" links.
- **Bookmarks page (`/bookmarks`)** — saved ayahs list with instant search/filter,
  audio playback trigger, formatted copy and share, single deletion, and clear all.
- **`ReadingPositionService`** — automatically remembers the last read surah and ayah,
  surfacing a "Continue Reading" banner with a "Resume" button on the home page.
- **`ReadingProgressService`** — tracks ayahs read out of 6,236 with a live progress bar
  and percentage display on the home screen.
- **Ayah action integration** — seamlessly wires bookmarking, position tracking, and
  progress tracking into the surah and juz reading views.

### Phase 7 — prayer times and location

- **`LocationService`** — browser geolocation with permission denial handling, reverse
  geocoding to place names, and privacy-preserving coordinate rounding (2 decimals).
- **Manual City Search** — debounced search against `/api/location/search`, popular city
  shortcuts, and storage persistence (`STORAGE_KEYS.location`).
- **`PrayerTimesService`** — loads timetable from `/api/prayer/timings`, maintains a
  live 1-second clock, computes active prayer period, and calculates next prayer countdown.
- **Next-Prayer Countdown & Rollover** — ticks every second, handles zero rollover without
  page reload, and automatically rolls past Isha into tomorrow's Fajr.
- **Prayer Times Page (`/prayer`)** — 6 core timings displayed (Fajr, Sunrise, Dhuhr, Asr,
  Maghrib, Isha), active prayer highlighted, secondary timings (Imsak & Midnight),
  interactive location switcher modal, and calculation method picker.
- **Calculation & School Visibility** — active method and Asr jurisprudence school
  (Shafi / Hanafi) are always visible and configurable on screen.
- **Home Screen Prayer Card** — displays upcoming prayer name, time, live ticking countdown,
  current location name, and daily prayer strip.

### Phase 8 — Islamic calendar, Ramadan and Ayah of the Day

- **Islamic Calendar Page (`/calendar`)** — interactive 7-column Hijri month grid with
  weekday headers, Friday (Jummah) indicators, month & year dropdown navigation, and
  today's Hijri & Gregorian dual hero banner.
- **Moon Sighting Advisory Note** — prominent, unmissable notice on the calendar page
  stating that dates are calculated astronomically and regional moon sightings may differ by $\pm 1$ day.
- **Ramadan Dashboard** — automatically highlights during Ramadan (or when viewing Ramadan):
  Ramadan day counter, month progress bar, Suhoor (Imsak) & Iftar (Maghrib) timings based on
  the user's location, and next prayer countdown.
- **Important Islamic Observances** — comprehensive list of significant annual dates (1 Muharram,
  Ashura, 12 Rabi al-Awwal, 27 Rajab, 15 Shaban, Ramadan start, Laylat al-Qadr, Eid al-Fitr,
  Arafah, Eid al-Adha) with estimated Gregorian dates and descriptions.
- **Ayah of the Day** — deterministic daily selection (`getDailyAyahIndex`) from 36 curated
  spiritually rich ayahs, stable across refreshes and rotating at midnight; presented on the home
  screen with Arabic calligraphy, authentic Bangla translation, audio recitation playback,
  bookmark toggle, and copy/share functionality.

### Phase 9 — nearby mosques map

- **OpenStreetMap & Leaflet Integration** — lightweight map using OpenStreetMap tile layer
  (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) with required attribution, mobile-safe non-trapping scroll,
  and responsive dual-pane layout.
- **Custom Marker System** — custom self-contained SVG pins for mosques (emerald green with dome silhouette)
  and pulsing user location marker, with no missing PNG asset dependencies.
- **Synchronised Map & List** — interactive bidirectional selection: clicking a mosque card centers
  and opens its marker popup on the map; clicking a map marker highlights the card in the list.
- **Rich Popups & Directions** — marker popups displaying mosque name, distance formatted in meters/kilometers
  (and Bangla numerals in Bangla mode), address, and direct external Google Maps directions links.
- **Adjustable Radius** — search radius pills (1 km, 2 km, 3 km, 5 km, 10 km) that dynamically re-query the API.
- **City Switcher Modal** — allows searching and selecting any city globally via Nominatim geocoding,
  popular city shortcuts (Dhaka, Makkah, Madinah, London, New York), or switching back to GPS location.
- **Resilient Fallbacks** — clear error state with Retry for Overpass busy / 502 states, and empty state
  when no mosques are found within the chosen radius.

### Phase 10 — settings, preferences and responsive polish

- **Centralized `SettingsService`** — single source of truth and facade coordinating reading settings,
  appearance theme, interface language, reciter & playback tempo, location & prayer calculations,
  storage analytics, backup export/import, and safe data resets.
- **Reading Preferences & Live Preview** — intuitive sliders for Arabic font size, translation size,
  line height, and column width; translation mode pills (Bangla / English / Both / Arabic only);
  accompanied by an instant live preview rendering Ayat al-Kursi (2:255) using active CSS custom properties.
- **Appearance & Theme** — 3 theme options (Light, Dark, System default) providing instant switching without reload.
- **Interface Language** — authentic, culturally respectful Islamic Bangla terminology vs English across all UI routes.
- **Audio Controls** — global default reciter picker and audio playback speed pills (0.75× to 2.0×).
- **Location & Prayer** — current place badge with GPS detection, city switcher modal, Asr jurisprudence school
  selector (Shafi / Hanafi), and calculation method picker.
- **Data & Storage Management** — storage breakdown showing exact bytes consumed, bookmarks count,
  ayahs read, and last read position.
- **JSON Backup Export & Restore** — one-click JSON backup file download (`alquran-backup-YYYY-MM-DD.json`)
  and schema-validated file import with success/error alerts.
- **Safe Destructive Resets** — accessible confirmation modals for clearing bookmarks, resetting Quran reading progress,
  resetting reading settings, or wiping all local application data.
- **Responsive Polish** — all interactive elements provide touch targets $\ge 44\text{px}$ and screens adapt cleanly
  down to 320px with zero horizontal scrolling.

### Phase 11 — PWA, offline caching, SEO and accessibility

- **Angular Service Worker (`@angular/service-worker`)** — production service worker with `ngsw-config.json`
  caching app shell, static assets, and Quran data endpoints (`/api/quran/**`, `/api/prayer/**`, `/api/calendar/**`)
  with strict exclusion of external recitation audio (`*.mp3`) to prevent quota bloat.
- **PWA Service (`PwaService`)** — reactive network status monitoring (`isOnline`, `isOffline`), install prompt
  coordination (`canInstall`, `promptInstall`), standalone detection, and version update management (`hasUpdate`, `activateUpdate`).
- **Web App Manifest & Icons** — `manifest.webmanifest` configured with emerald theme color (`#0f5132`),
  standalone display mode, SVG vector icon, and PNG icons (192x192, 512x512, maskable variants).
- **Network & Install UI** — sticky offline indicator banner rendered below header when disconnected,
  one-click update banner with reload trigger, header install pill button, drawer install action,
  and dedicated PWA / device status card in Settings.
- **SEO & Search Indexing** — production `robots.txt`, comprehensive `sitemap.xml` listing static routes,
  all 114 surahs and 30 juz, plus Schema.org JSON-LD structured data for `WebSite` and `Chapter`.
- **Accessibility (a11y) & Keyboard Navigation** — WCAG AA compliance across light and dark modes,
  $\ge 44\text{px}$ touch targets, ARIA landmarks, `role="status"` live regions, and global `Escape` key handling
  to dismiss modal dialogs, mobile navigation drawer, and audio playback options panel.

### Phase 12 — testing, bug fixing and release preparation

- **Backend Test Suite (`AlQuran.Api.Tests`)** — 46 unit and integration tests covering:
  - Reference data verification (114 surahs, 6236 ayahs, juz boundaries, calendar months, prayer calculation methods).
  - Utility verification (AudioUrlBuilder CDN mapping, Haversine geo-distance, Overpass QL builders).
  - Integration testing with `CustomWebApplicationFactory<Program>` validating root (`/`), `/api/health`, `/api/meta`,
    `/api/quran/reciters`, `/api/calendar/months`, parameter validation, and ProblemDetails error envelopes.
- **Frontend Regression Suite** — 222 unit tests passing cleanly across 33 test files.
- **PwaService Robustness** — resilient handling of headless/jsdom `navigator.onLine` environments, preventing undefined states.
- **Production Build Verification** — zero warnings, zero errors on both ASP.NET Core Release build and Angular production bundle.
- **Release Documentation** — complete step-by-step guides for developers, operators, and static hosting platforms.

---

## 10. Known Issues

| # | Issue | Impact | Plan |
|---|---|---|---|
| 1 | Public Overpass instances intermittently return busy or 429 | Mosque search can be slow | **Mitigated in Phase 2**: failover across three endpoints, verified |
| 2 | No SSR or prerendering | Meta tags are set by JavaScript. Google runs JS; simpler crawlers and some link unfurlers will not see them | **Addressed in Phase 11**: Schema.org JSON-LD, sitemap.xml, robots.txt and runtime SeoService |
| 3 | Fonts load from the Google Fonts CDN | A blocked CDN falls back to system fonts | Self-hosting is an option |
| 4 | Port 4200 is occupied by another project on this machine | `ng serve` fails on the default port | Use `ng serve --port 4300` |
| 5 | Hijri dates and prayer times are calculated | May differ from local moon sighting | Every affected response carries a `notice` field saying so |
| 6 | Bangla surah transliterations are curated in-repo | A name could be spelled unusually | Corrections need only `SurahNames.cs` |
| 7 | `/calendar/events` makes ten upstream conversions on a cold cache | First call takes about 900 ms | Cached for a day afterwards |
| 8 | The surah filter matches substrings, so short queries are broad | "nas" returns Yunus, An-Nas and others | Acceptable for 114 items; Phase 6 search ranks properly |
| 9 | Al-Baqarah is a 130 kB gzipped download | Slow on a poor connection | Deliberate: it buys instant translation switching. Cached by Service Worker in Phase 11 |
| 10 | Playback stops when leaving the reading page | No background listening yet | **Resolved in Phase 5**: MiniPlayerComponent lives in the app shell and outlives navigation |

---

## 11. Next Steps & Post-Release Roadmap

**All 12 Core Phases are 100% COMPLETE.**

The application is fully built, tested, and ready for deployment. Potential post-v1 enhancements:
- Self-hosted Amiri Quran web fonts for fully offline typography.
- Background sync for reading progress and settings when multi-device accounts are introduced.
- Additional Bengali tafsir editions (e.g. Tafsir Ibn Kathir, Ahsanul Bayaan) if public APIs become available.

---

## 12. Important Decisions

| Decision | Why |
|---|---|
| **No database in v1** | Nothing needs one. All content is external; all user data is per-device. Adding one would be complexity with no feature behind it. |
| **Backend proxies data APIs, browser fetches audio and tiles** | Proxy where caching, resilience and headers help; go direct where they would only add latency and there is no secret to protect. |
| **RFC 9457 ProblemDetails, not a custom envelope** | Standard, understood by tooling, and success responses stay clean. Extension fields `errorCode`, `retryable`, `correlationId` and `service` drive the UI. |
| **Zoneless Angular** | The Angular 21 default. No zone.js, signal-driven change detection, smaller and faster. |
| **Signals plus `AsyncState` instead of raw Observables in components** | Makes loading / error / empty / retry handling uniform and impossible to forget. |
| **Angular 2025 file naming (`theme.ts`), classes keep the `Service` / `Component` suffix** | Files match what `ng generate` produces, so the CLI stays usable; class names stay unambiguous for readability. |
| **CSS custom properties for colour, Sass variables for scale** | Colours must change at runtime for theming; spacing and breakpoints never do. |
| **`data-theme` attribute plus `prefers-color-scheme`** | Supports all three states (light / dark / system) without JavaScript deciding what the OS already knows. |
| **Inline theme script in `index.html`** | Removes the flash of the wrong theme before Angular boots. It reads the same `alquran.theme` key as `ThemeService` - keep the two in step. |
| **`JavaScriptEncoder.Create(UnicodeRanges.All)` on the backend** | Without it, System.Text.Json escapes every Arabic and Bangla character to `\uXXXX`, roughly tripling Quran payload size. |
| **`InvariantGlobalization=false`** | Arabic and Bangla text handling needs the full ICU data. |
| **Rate limiting on our own API** | Protects the free upstream providers from a runaway client, and protects us from abuse. |
| **Lazy-loaded routes** | The app is read mostly on phones; the initial bundle stays around 84 kB gzipped. |
| **Attribution in the footer** | The OpenStreetMap ODbL licence requires credit, and naming the Quran text and translation sources is the honest thing to do for religious content. |
| **Never invent religious content** | Arabic text, translations, prayer times and Hijri dates always come from a named source. Calculated values are labelled as calculated. |
| **Bismillah is separated, never hard-coded** | The Uthmani edition prepends it to ayah 1 of most surahs. The prefix used to strip it is the text of ayah 1:1 in the same edition, so it matches the script exactly. Typing it by hand produced a mismatch in testing. |
| **Reference data is fetched from a source, not typed** | Juz boundaries come from AlQuran.cloud's `/meta`; Bangla surah meanings from Quran.com, fetched once and baked in. Checking rather than assuming caught that juz 4 starts at 3:93, not 3:92. |
| **Upstream models are separate from DTOs** | `Models/Upstream/` mirrors each provider exactly and never leaves the service layer, so a provider swap touches one mapper instead of the whole app. |
| **Prayer times carry an absolute instant** | A `DateTimeOffset` beside the local `"HH:mm"` means the countdown is correct even when the browser sits in a different timezone from the location shown. |
| **The API never says which prayer is "next"** | That changes every second and would make the response uncacheable. The client derives it from the instants. |
| **Nulls are serialised, not omitted** | `JsonIgnoreCondition.Never`, so the JSON shape always matches the C# record and the TypeScript models map 1:1. Omitting them saves a few bytes and buys a class of undefined-vs-null bugs. |
| **Coordinates are rounded in cache keys** | Two decimal places for prayer times, three for geocoding. A precise position is never stored, and nearby users share a cache entry. |
| **Mosque queries use `nwr` with `out center`** | A mosque may be mapped as a node, a building outline or a multipolygon. Querying nodes alone would silently miss many of them. |
| **Overpass fails over across endpoints** | Public instances are donated and go busy without warning. Three endpoints are tried in order; only when all fail does the user see an error. |
| **Conventional English surah spellings, not the provider's** | AlQuran.cloud writes "Al-Faatiha" and "An-Naas"; nobody types that, and a search for "fatihah" found nothing. The reference table spellings ("Al-Fatihah", "An-Nas") now win, improving display and search at once. |
| **Filtering happens in the browser** | The surah list is 30 kB and already cached, so matching locally gives instant results with no request and no debounce. Server-side search is for the Quran *text*, which is Phase 6. |
| **Search text is folded before matching** | Lowercased with punctuation stripped, so "al fatihah" finds Al-Fatihah and "ali imran" finds Ali 'Imran. |
| **Surah cards are a single link** | One focus stop with one spoken label, rather than four fragments in three languages read one after another. |
| **A failed request is never cached** | `shareReplay` would otherwise replay the error forever and the Retry button would do nothing. |
| **The frontend contract is tested against the running backend** | A check asserts every declared field is present and no unknown field appears, so the two halves cannot drift apart silently. |
| **The Bismillah is never hard-coded, and the edition is read from the block** | The provider prepends the Bismillah to ayah 1 and puts the edition on the enclosing block, not the ayah. Missing the second point labelled every translation "unknown", which would have rendered no Bangla at all. |
| **Translations are selected by language, not by array position** | The provider gives no ordering guarantee for a multi-edition response, so index-based access would eventually show a translation as the Arabic. |
| **Reading settings are CSS custom properties, not component inputs** | Dragging a slider on Al-Baqarah restyles 286 ayahs in one repaint instead of re-rendering 286 components. |
| **Progressive rendering, not virtual scrolling** | Virtual scrolling would break browser find-in-page and `#ayah-N` deep links. Rendering in chunks keeps the whole surah in the DOM a few frames later. |
| **Both translations are always fetched** | 130 kB gzipped for the largest surah buys switching between Bangla, English and both with no request and no loading flash mid-read. |
| **Play and Bookmark are functional now, not disabled** | A reading screen with dead buttons is not a deliverable. The services were written with the surface Phases 5 and 6 need, so those phases extend rather than replace them. |
| **An invalid route parameter makes no request** | `/quran/200` shows "not found" without first fetching surah 1. |

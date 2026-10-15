# Phase 1 — Project Structure and Setup

**Status: ✅ COMPLETE** · Completed 2026-09-04 · Verified 2026-09-04

---

## Goal

Stand up both halves of the project with a real architecture — not a demo — so
every later phase drops features into a structure that already handles
configuration, errors, caching, theming, responsiveness and accessibility.

Also: confirm, by calling them, that every external API this project depends on
is free, reachable, and does not need a key.

---

## What was built

### Research and API verification (done before any code)

Each provider was called with `curl` and its response inspected:

| Provider | Checked | Result |
|---|---|---|
| AlQuran.cloud | surah list, Bangla editions, multi-edition surah, search, juz | Works, no key |
| islamic.network CDN | HEAD on an ayah MP3 | 200, `audio/mpeg`, 831 kB |
| Aladhan | timings, Gregorian→Hijri, Hijri calendar | Works, no key |
| Nominatim | city search | Works, no key, needs a real `User-Agent` |
| Overpass | mosque query around a coordinate + 2 mirrors | Works, main instance flaky under load |

Two findings changed the configuration:

1. **Nominatim answers 403** when the `User-Agent` contains `example.com`.
   Confirmed by testing three different agent strings. The default was changed to
   a GitHub URL.
2. **Overpass returned a runtime timeout and later a 429.** Two mirrors are
   configured so Phase 9 can fail over instead of giving up.

### Backend — `backend/AlQuran.Api` (.NET 10)

- `.slnx` solution with the API project registered.
- **Configuration**: one strongly-typed options class per provider, plus
  `CacheOptions` and `CorsOptions`, bound with `ValidateDataAnnotations()` and
  `ValidateOnStart()` — a typo in `appsettings.json` fails loudly at boot rather
  than as a null reference on the first request.
- **HTTP clients**: one named `HttpClient` per provider via `IHttpClientFactory`,
  each with its own base address, `User-Agent`, timeout and a Polly standard
  resilience pipeline (retry with jitter, circuit breaker, attempt and total
  timeout).
- **Caching**: `ICacheService` / `MemoryCacheService` over `IMemoryCache`, with a
  per-key semaphore so ten simultaneous requests for the same surah cause one
  upstream call, not ten. Bounded by `Cache:SizeLimit`.
- **Errors**: `ExceptionHandlingMiddleware` converts every exception into RFC 9457
  ProblemDetails carrying `errorCode`, `retryable`, `correlationId` and `service`.
  Stack traces appear in Development only.
- **Security**: CORS restricted to configured origins, IP rate limiting
  (300/min global, 30/min for expensive endpoints), response compression.
- **API surface**: `GET /api/health`, `GET /api/health/upstreams` (parallel live
  ping of all five providers), `GET /api/meta` (catalogue with `requiresApiKey`
  and `apiKeyConfigured` per provider).
- **Docs**: OpenAPI document at `/openapi/v1.json`, Scalar explorer at `/scalar`.

### Frontend — `frontend` (Angular 21, zoneless)

- **Design system** in `src/styles/`: colour, spacing, radius, motion and layout
  tokens; a dark palette applied through both `[data-theme='dark']` and
  `prefers-color-scheme`; a reset; three-script typography; an Islamic geometric
  ornament drawn as a CSS mask so it takes its colour from the theme; responsive,
  focus-ring, container and card mixins; global button, chip, skeleton and
  skip-link classes.
- **Shell**: sticky header with brand, desktop navigation, search and theme
  buttons and a mobile drawer; a four-item bottom navigation for phones; a footer
  carrying data attribution and the moon-sighting disclaimer.
- **Core services**: `StorageService` (namespaced, falls back to memory when
  localStorage throws), `ThemeService` (light / dark / system, persisted, with an
  inline script in `index.html` that prevents a flash of the wrong theme),
  `ApiService`, `MetaApiService`, `SeoService`, `PageTitleStrategy`,
  `LoggerService`.
- **HTTP layer**: a correlation interceptor that tags each request, and an error
  interceptor that normalises every failure — offline, timeout, ProblemDetails —
  into one `AppError` with a user-safe message and a `retryable` flag.
- **Async pattern**: `AsyncState<T>` plus `createAsyncResource()`, so every screen
  gets loading / success / error / retry for free.
- **Shared components**: icon (35 inline SVG icons), spinner, skeleton,
  error-state (with Retry and correlation id) and empty-state.
- **Routing**: ten lazy-loaded routes, each declaring its SEO metadata, plus a
  404 page.
- **Home page**: greeting, today's date, quick actions, and a live setup check
  that calls the backend and lists every provider with its latency — this is what
  proves the whole chain works from the browser.

### Documentation

`PROJECT_CONTEXT.md`, `README.md`, `API_SETUP.md`, and this phase folder.

---

## Verification

```
dotnet build AlQuran.slnx            Build succeeded. 0 Warning(s) 0 Error(s)
ng build --configuration development OK, 10 routes code-split
ng build --configuration production  309 kB initial / 84 kB gzipped
ng test --watch=false                3 passed
```

Runtime checks against the running pair:

```
GET  http://localhost:5050/                  200  service banner
GET  http://localhost:5050/api/health        200  {"status":"Healthy"}
GET  http://localhost:5050/api/meta          200  5 providers, requiresApiKey=false for all
GET  http://localhost:5050/api/health/upstreams
                                             200  Healthy - 5/5 reachable
GET  http://localhost:4300/api/health        200  through the Angular dev proxy
GET  http://localhost:4300/api/health/upstreams
                                             200  Healthy - 5/5 reachable
```

Latencies observed on the upstream check: AlQuran.cloud 297 ms, audio CDN 402 ms,
Aladhan 365 ms, Nominatim 204 ms, Overpass 1609 ms.

### Problems hit and fixed during the phase

| Problem | Fix |
|---|---|
| `Microsoft.OpenApi` 2.0.0 carried advisory GHSA-v5pm-xwqc-g5wc | Upgraded `Microsoft.AspNetCore.OpenApi` to 10.0.11, which pulls a patched 2.7.5. Pinning 3.x was tried and reverted — it breaks the .NET 10 OpenAPI source generator. |
| Polly rejects `MaxRetryAttempts = 0` | Floor of 1 everywhere; Overpass relies on mirror failover rather than retries. |
| Nominatim returned 403 | The default `User-Agent` contained `example.com`. Replaced. |
| `AddCors` built a second service provider | Reads the configuration section directly instead. |
| Icon registry lost the optional `filled` member under `as const` | Keys stay literal for `IconName`; values are widened to `IconDefinition`. |

---

## Acceptance criteria

- [x] Backend builds with no warnings and no errors
- [x] Frontend builds in both development and production configurations
- [x] Frontend tests pass
- [x] Backend runs and serves `/api/health`, `/api/meta`, `/api/health/upstreams`
- [x] Angular dev proxy reaches the backend
- [x] All five external APIs verified reachable from the backend
- [x] No API key required anywhere; no secret in frontend code
- [x] Light / dark / system theme works and persists, with no flash on load
- [x] Layout is responsive: desktop navigation, mobile drawer, bottom bar
- [x] Loading, error, retry and empty states exist as reusable components
- [x] Every route is lazy loaded and declares SEO metadata
- [x] `PROJECT_CONTEXT.md`, `README.md` and `API_SETUP.md` written

---

## Not in this phase

Quran data, the reading view, audio, search, bookmarks, prayer times, the
calendar, the mosque map, the settings screen and the service worker. The routes
for those sections exist and are navigable; each states which phase builds it.

---

**Next:** [Phase 2 — Backend API Architecture](PHASE-02.md)

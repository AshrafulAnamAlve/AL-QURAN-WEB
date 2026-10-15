# Phase 2 — Backend API Architecture

**Status: ✅ COMPLETE** · Completed 2026-09-05 · Verified 2026-09-05

---

## Goal

Build the backend domains that every frontend feature will call, each with a
controller, a service, DTOs and caching — so phases 3 onward are UI work against
a stable, tested contract.

---

## What was built

### Five domains

| Domain | Service | Controller | Upstream |
|---|---|---|---|
| Quran | `QuranService` (3 partials) | `QuranController` | AlQuran.cloud |
| Prayer | `PrayerService` | `PrayerController` | Aladhan |
| Calendar | `CalendarService` | `CalendarController` | Aladhan |
| Mosques | `MosqueService` | `MosqueController` | Overpass |
| Location | `LocationService` | `LocationController` | Nominatim |

`LocationService` was added beyond the original four: geocoding is needed by both
the prayer screen (pick a city) and the mosque map (search a place), and belongs
to neither, so it got its own service rather than being buried in one.

### Endpoints

```
GET /api/quran/surahs                   all 114 surahs
GET /api/quran/surahs/{n}               one surah + translations + audio URLs
GET /api/quran/surahs/{s}/ayahs/{a}     one ayah by reference
GET /api/quran/ayahs/{n}                one ayah by global number (1-6236)
GET /api/quran/juz                      all 30 juz with their ranges
GET /api/quran/juz/{n}                  one juz with every ayah
GET /api/quran/search                   text + surah name + "2:255" reference
GET /api/quran/editions                 translation editions
GET /api/quran/reciters                 190 reciters

GET /api/prayer/timings                 a day, by coordinates
GET /api/prayer/timings/by-city         a day, by city name
GET /api/prayer/calendar                a Gregorian month
GET /api/prayer/ramadan                 Suhoor and Iftar for a day
GET /api/prayer/methods                 23 calculation methods

GET /api/calendar/today                 today in both calendars
GET /api/calendar/to-hijri              Gregorian to Hijri
GET /api/calendar/to-gregorian          Hijri to Gregorian
GET /api/calendar/hijri/{year}/{month}  a Hijri month grid with events
GET /api/calendar/months                the twelve months (static)
GET /api/calendar/events                the Islamic events of a year

GET /api/mosques                        nearby mosques, nearest first
GET /api/location/search                city search
GET /api/location/reverse               coordinates to place name
```

### Layering

Upstream models (`Models/Upstream/`) mirror each provider exactly and never leave
the service layer. Mappers (`QuranMapper`, `CalendarMapper`, `PrayerMapper`,
`MosqueMapper`) convert them to DTOs. Controllers hold no logic beyond parameter
parsing.

### Reference data, taken from sources rather than typed from memory

| Data | Where it came from |
|---|---|
| Juz start references | AlQuran.cloud `/v1/meta`, `data.juzs.references` |
| Bangla surah meanings | Quran.com `/api/v4/chapters?language=bn`, fetched once and baked in |
| Bangla surah names | Curated transliteration table in `SurahNames.cs` |
| Totals (6236 ayahs, 114 surahs, 30 juz) | Cross-checked against `/v1/meta` |

Checking rather than assuming caught a real error: juz 4 begins at **3:93**, not
3:92 as it is commonly misremembered.

### Correctness work worth naming

- **Bismillah handling.** The Uthmani edition prepends the Bismillah to ayah 1 of
  every surah except At-Tawbah. Left alone, Al-Baqarah 2:1 would read as the
  Bismillah followed by *Alif Lam Mim*. The service separates it — and the prefix
  is **never hard-coded**: it is the text of ayah 1:1 in the same edition, so it
  matches the script character for character. Verified: 2:1 now returns `الٓمٓ`
  alone, 9:1 is untouched, and 27:30 (which contains the Bismillah mid-ayah) is
  untouched.
- **Sajda is polymorphic upstream** — `false` on most ayahs, an object on the 15
  sajda ayahs. Modelled as `JsonElement` and interpreted, rather than crashing.
- **Editions are matched by identifier, not by position.** The provider does not
  promise ordering, and trusting it would render a translation as the Arabic text.
- **Juz accepts only one edition per call** (asking for several returns 404), so
  editions are fetched separately and joined on the global ayah number by
  dictionary lookup, not by index — a short response cannot shift every later ayah.
- **Coordinates are rounded before use as a cache key**, so a precise position is
  never stored and nearby users share an entry.
- **Absolute instants.** Every prayer time carries a `DateTimeOffset` beside the
  local `"HH:mm"`, so a countdown stays correct when the visitor's browser is in a
  different timezone from the location being shown.
- **No "next prayer" in the response.** It changes every second and would make the
  payload uncacheable; the client derives it from the instants.

---

## Verification

Two test scripts exercised every endpoint against the live upstreams.
**83 of 83 checks passed.**

```
Quran, juz and search                                   35 / 35
Prayer, calendar, location, mosques, validation, cache  48 / 48
```

Selected results:

```
GET /quran/surahs               114 surahs, Bangla names and meanings present
GET /quran/surahs/2             286 ayahs; 2:1 = الٓمٓ (Bismillah correctly split out)
GET /quran/surahs/9             no Bismillah, as it should be
GET /quran/juz                  30 juz; ayah counts sum to exactly 6236
GET /quran/juz/30               564 ayahs across 37 surahs
GET /quran/ayahs/1160           7:206 correctly flagged as sajda
GET /quran/reciters             190 reciters
GET /prayer/timings             8 entries, tz Asia/Dhaka, instants at +06:00
GET /prayer/methods             23 methods, exactly one marked default
GET /calendar/events?year=1448  all 10 events resolved to Gregorian dates
GET /calendar/to-gregorian      1 Ramadan 1448 AH = 8 February 2027
GET /mosques                    10 results, sorted by distance, all within radius
```

**Validation:** all 13 bad-input cases returned 400 with a helpful message,
including a path-traversal attempt in the `translations` parameter
(`../etc/passwd`, rejected).

**Caching:** Al-Kahf cold 127 ms, warm **7 ms**.

**Mirror failover**, tested by pointing the primary at a dead endpoint:

```
overpass-api.de/api/this-endpoint-does-not-exist   failed   -> next
overpass-api.de/api/interpreter                    504      -> next
overpass.private.coffee/api/interpreter            answered
```

The middle failure was real rather than simulated: the main instance was genuinely
busy at that moment, so this exercised two levels of failover in live conditions.

**No regression:** the Phase 1 frontend still builds (309 kB / 84 kB gzipped),
its 3 tests pass, and the Angular dev proxy still reaches the API and reports all
five upstreams healthy.

### Bugs found and fixed during the phase

| Bug | Cause | Fix |
|---|---|---|
| Every Quran endpoint returned 502, "could not understand the response" | `Accept-Encoding: gzip` was set by hand but automatic decompression was never enabled, so gzipped bytes were parsed as JSON. Invisible in Phase 1 because the health check only read status codes, never a body. | Enabled `AutomaticDecompression` on the primary handler and removed the manual header |
| `bismillahArabic` was absent from the JSON instead of `null` | `JsonIgnoreCondition.WhenWritingNull`, set in Phase 1, drops null keys — so the JSON shape did not match the DTO | Switched to `Never`. Nulls are always written, so the TypeScript models map 1:1 to the C# records |

---

## Scope

- [x] `QuranService` + `QuranController`
- [x] `PrayerService` + `PrayerController`
- [x] `CalendarService` + `CalendarController`
- [x] `MosqueService` + `MosqueController`
- [x] `LocationService` + `LocationController` (added beyond the original plan)
- [x] Upstream response models kept separate from DTOs
- [x] Adapters mapping upstream models to DTOs
- [x] Per-domain cache keys and durations from `CacheOptions`
- [x] Input validation on every parameter
- [x] Rate limiting on search, geocoding and mosque endpoints

## Acceptance criteria

- [x] Every endpoint returns real data from the live upstream
- [x] Invalid input returns 400 with a helpful ProblemDetails message
- [x] An upstream failure returns 502 or 504, never 500
- [x] A repeated request is served from cache (127 ms to 7 ms)
- [x] Overpass fails over to a mirror when the primary is busy
- [x] The backend builds with no warnings

---

## Not in this phase

No frontend work. The Angular app still shows its Phase 1 placeholders and does
not call these endpoints yet. That begins in Phase 3.

---

**Previous:** [Phase 1](PHASE-01.md) · **Next:** [Phase 3 — Quran Data Integration and Browsing](PHASE-03.md)

# API_SETUP.md

Everything this project talks to on the internet, in detail.

**Summary: six external services. All free. None needs an API key. None needs an
account. There is nothing to sign up for.**

Every endpoint below was called and its response inspected on **2026-09-04**
before any code was written against it.

| # | Service | Used for | Key? | Free? |
|---|---|---|---|---|
| 1 | [AlQuran.cloud](#1-alqurancloud) | Quran text, translations, search, juz | No | Yes |
| 2 | [islamic.network CDN](#2-islamicnetwork-audio-cdn) | Recitation audio | No | Yes |
| 3 | [Aladhan](#3-aladhan) | Prayer times, Hijri calendar, Ramadan | No | Yes |
| 4 | [OpenStreetMap Nominatim](#4-openstreetmap-nominatim) | City search | No | Yes |
| 5 | [Overpass API](#5-overpass-api) | Nearby mosques | No | Yes |
| 6 | [OpenStreetMap tiles](#6-openstreetmap-tiles) | Map rendering | No | Yes |
| 7 | [Quran.com](#7-qurancom-build-time-only) | Bangla surah meanings (baked in) | No | Yes |

All configuration for services 1 to 5 lives in one place:

```
backend/AlQuran.Api/appsettings.json  →  "ExternalApis"
```

Service 6 is configured in `frontend/src/environments/environment.ts`, because
map tiles are fetched by the browser.

---

## 1. AlQuran.cloud

**Official website:** <https://alquran.cloud/api>
**Base URL:** `https://api.alquran.cloud/v1/`

### What it provides

- The complete Arabic Quran text (Uthmani script)
- Surah metadata: number, Arabic name, English name, meaning, ayah count,
  revelation type
- Over 100 translations, including two in Bangla
- Juz (para) divisions
- Keyword search across any edition

### Free?

Yes. Public, no key, no account, no billing.

### API key required?

No.

### Rate limits

None published. This project caches Quran responses for **7 days** in server
memory, so in practice the API is called once per surah per week regardless of
how many people are reading.

### How to register

Not required.

### How it is configured

```json
"QuranApi": {
  "DisplayName": "AlQuran.cloud",
  "BaseUrl": "https://api.alquran.cloud/v1/",
  "ApiKey": "",
  "TimeoutSeconds": 20,
  "Enabled": true,
  "ArabicEdition": "quran-uthmani",
  "BanglaEdition": "bn.bengali",
  "EnglishEdition": "en.sahih"
}
```

### The Bangla editions

Verified present on the API:

| Identifier | Translator | Bangla name |
|---|---|---|
| `bn.bengali` | Muhiuddin Khan | মুহিউদ্দীন খান |
| `bn.hoque` | Zohurul Hoque | জহুরুল হক |

`bn.bengali` (Muhiuddin Khan) is the default — it is the most widely used Bangla
translation of the Quran.

### Example request

Fetch Al-Fatihah with Arabic, Bangla, English and audio in a single call:

```
GET https://api.alquran.cloud/v1/surah/1/editions/quran-uthmani,bn.bengali,en.sahih,ar.alafasy
```

### Example response (trimmed)

```json
{
  "code": 200,
  "status": "OK",
  "data": [
    {
      "number": 1,
      "name": "سُورَةُ ٱلْفَاتِحَةِ",
      "englishName": "Al-Faatiha",
      "englishNameTranslation": "The Opening",
      "revelationType": "Meccan",
      "numberOfAyahs": 7,
      "ayahs": [
        {
          "number": 1,
          "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
          "numberInSurah": 1,
          "juz": 1,
          "page": 1,
          "sajda": false
        }
      ]
    }
  ]
}
```

Requesting several editions in one call is what keeps Arabic and translation
**perfectly aligned** — same source, same ayah ordering, no cross-source
mismatch risk.

### Other endpoints in use

| Endpoint | Returns |
|---|---|
| `/surah` | All 114 surahs |
| `/surah/{n}/{edition}` | One surah in one edition |
| `/ayah/{ref}/{edition}` | One ayah, e.g. `2:255` |
| `/juz/{n}/{edition}` | One juz |
| `/search/{term}/all/{edition}` | Keyword search |
| `/edition/language/bn` | Available Bangla editions |

### If it stops working

1. Check <https://api.alquran.cloud/v1/surah> directly in a browser.
2. Cached data keeps working for up to 7 days, so a short outage is invisible.
3. Alternative provider with the same shape of data:
   **Quran.com API v4** (`https://api.quran.com/api/v4/`) — also free, also no
   key. Swapping means writing one new adapter in `Services/Quran/`; nothing
   above the service layer changes.

---

## 2. islamic.network audio CDN

**Official website:** <https://islamic.network/quran/audio>
**Base URL:** `https://cdn.islamic.network/quran/audio/`

### What it provides

One MP3 per ayah, for the whole Quran, from multiple reciters at several
bitrates.

### Free?

Yes. Public CDN, no key.

### API key required?

No.

### Rate limits

None published. This project **streams** audio and loads only the ayah being
played, prefetching at most the next one. It never bulk-downloads.

### URL pattern

```
https://cdn.islamic.network/quran/audio/{bitrate}/{reciter}/{ayahNumber}.mp3
```

- `bitrate` — `32`, `64`, `128` or `192`
- `reciter` — an edition identifier such as `ar.alafasy`
- `ayahNumber` — the **global** ayah number, 1 to 6236 (not the number within
  the surah)

### Example request

```
GET https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3
```

### Example response

```
200 OK
Content-Type: audio/mpeg
Content-Length: 831865
```

(Ayah 262 globally is Ayat al-Kursi, 2:255.)

### Reciters

Identifiers come from AlQuran.cloud's audio editions, so the two services stay
in step. Common ones: `ar.alafasy` (Mishary Alafasy — the default),
`ar.abdurrahmaansudais`, `ar.husary`, `ar.minshawi`, `ar.abdulsamad`.

### Why the browser fetches this directly

Audio is large and needs range requests and seeking. Proxying it through our own
backend would add latency and bandwidth cost for no benefit — there is no key to
hide.

### If it stops working

1. Open one MP3 URL directly in a browser.
2. Alternative: **EveryAyah** (`https://everyayah.com/data/`), same idea, also
   free, different URL shape (`{surah:3}{ayah:3}.mp3`).
3. Only `QuranAudioOptions` and the URL builder change.

---

## 3. Aladhan

**Official website:** <https://aladhan.com/prayer-times-api>
**Base URL:** `https://api.aladhan.com/v1/`

### What it provides

- Daily prayer times for any coordinate or city
- Every widely used calculation method
- Gregorian ↔ Hijri conversion
- Hijri month calendars
- Imsak (Suhoor end) and Maghrib (Iftar) times for Ramadan

### Free?

Yes. Public, no key, no account.

### API key required?

No.

### Rate limits

None published. This project caches prayer times for **12 hours** per
location-and-day, so one location costs at most two upstream calls a day.

### How it is configured

```json
"PrayerApi": {
  "DisplayName": "Aladhan",
  "BaseUrl": "https://api.aladhan.com/v1/",
  "ApiKey": "",
  "TimeoutSeconds": 20,
  "Enabled": true,
  "DefaultMethod": 1,
  "DefaultSchool": 1
}
```

### Calculation method

`DefaultMethod: 1` is **University of Islamic Sciences, Karachi**, and
`DefaultSchool: 1` is the **Hanafi** Asr school. That pairing is the one
commonly followed across Bangladesh and South Asia.

Other methods Aladhan supports include 2 (ISNA, North America), 3 (Muslim World
League), 4 (Umm al-Qura, Makkah), 5 (Egyptian General Authority) and more. Users
will be able to change it from Settings in Phase 10, and the method in use is
always shown on screen.

### Example request

```
GET https://api.aladhan.com/v1/timings/04-09-2026?latitude=23.8103&longitude=90.4125&method=1
```

Date format is `DD-MM-YYYY`.

### Example response (trimmed)

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "timings": {
      "Fajr": "04:24",
      "Sunrise": "05:41",
      "Dhuhr": "11:57",
      "Asr": "15:26",
      "Maghrib": "18:14",
      "Isha": "19:30",
      "Imsak": "04:14"
    },
    "date": {
      "readable": "04 Sep 2026",
      "hijri": {
        "date": "22-03-1448",
        "day": "22",
        "month": { "number": 3, "en": "Rabī' al-awwal", "ar": "رَبيع الأوّل" },
        "year": "1448"
      }
    }
  }
}
```

### Other endpoints in use

| Endpoint | Returns |
|---|---|
| `/timings/{date}?latitude=&longitude=&method=` | Prayer times for one day |
| `/timingsByCity/{date}?city=&country=&method=` | Same, by city name |
| `/gToH/{date}` | Gregorian to Hijri |
| `/hToG/{date}` | Hijri to Gregorian |
| `/hToGCalendar/{month}/{year}` | A whole Hijri month |
| `/methods` | Every calculation method |

### Important note on accuracy

Prayer times and Hijri dates from this API are **calculated**. Local moon
sighting committees and individual mosques may announce different dates and
times. The app says so, on the calendar, in the Ramadan section and in the
footer. It never presents a calculated date as a religious ruling.

### If it stops working

1. Open <https://api.aladhan.com/v1/timings/01-01-2026?latitude=23.8&longitude=90.4&method=1>.
2. Alternative: calculate locally with the **adhan-js** library
   (<https://github.com/batoulapps/adhan-js>), which is free, open source, offline
   and implements the same standard methods. That is the recommended fallback if
   Aladhan ever becomes unreliable, and it removes a network dependency.

---

## 4. OpenStreetMap Nominatim

**Official website:** <https://nominatim.org/release-docs/latest/api/Overview/>
**Usage policy:** <https://operations.osmfoundation.org/policies/nominatim/>
**Base URL:** `https://nominatim.openstreetmap.org/`

### What it provides

- **Search:** turn a city name into coordinates
- **Reverse:** turn coordinates into a place name

This is what makes "select your city manually" work when someone declines
location permission.

### Free?

Yes, with conditions. Read the usage policy — it is short and it is binding.

### API key required?

No — but a **descriptive `User-Agent` is required**, and this is enforced.

### ⚠️ The one thing you must change

**Nominatim returns `403 Forbidden` for a `User-Agent` containing a placeholder
contact.** This was confirmed by testing:

| User-Agent sent | Result |
|---|---|
| `AlQuranWeb/1.0 (contact: change-me@example.com)` | **403 Forbidden** |
| `AlQuranWeb/1.0` | 200 OK |
| `AlQuranWeb/1.0 (+https://github.com/your-username/al-quran-web)` | 200 OK |

**STEP 1** — Open `backend/AlQuran.Api/appsettings.json`

**STEP 2** — Find:

```json
"UserAgent": "AlQuranWeb/1.0 (+https://github.com/your-username/al-quran-web)",
```

**STEP 3** — Replace `your-username` with your own GitHub username, or use your
own site or email.

**STEP 4** — Save, then restart the backend with `dotnet run`.

**STEP 5** — Check <http://localhost:5050/api/health/upstreams> and confirm
`GeocodingApi` reports `"healthy": true`.

### Rate limits

**At most 1 request per second.** Absolute rules from the policy:

- No heavy or bulk use
- A valid, identifying `User-Agent` on every request
- Results must be cached — do not re-ask for the same query

This project complies: its client is configured with minimal retries, and
geocoding results are cached for **24 hours**.

### Example request

```
GET https://nominatim.openstreetmap.org/search?q=Chittagong&format=json&limit=2
```

with header:

```
User-Agent: AlQuranWeb/1.0 (+https://github.com/your-username/al-quran-web)
```

### Example response (trimmed)

```json
[
  {
    "place_id": 251502441,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0.",
    "lat": "22.3337780",
    "lon": "91.8344348",
    "class": "place",
    "type": "city",
    "name": "চট্টগ্রাম",
    "display_name": "চট্টগ্রাম, চট্টগ্রাম জেলা, চট্টগ্রাম বিভাগ, 4000, বাংলাদেশ"
  }
]
```

Note the Bangla place names. Add `accept-language=en` to the query for English.

### If it stops working

1. A `403` almost always means the `User-Agent` — check it first.
2. A `429` means you exceeded 1 request per second.
3. Alternatives: **Photon** (`https://photon.komoot.io/`), free, built on OSM
   data; or a self-hosted Nominatim instance for heavy use.

---

## 5. Overpass API

**Official website:** <https://wiki.openstreetmap.org/wiki/Overpass_API>
**Base URL:** `https://overpass-api.de/api/interpreter`

### What it provides

Queries live OpenStreetMap data. This project asks it one question: *"which
mosques are within N metres of this point?"*

### Free?

Yes. Open data, volunteer-run servers, no key, no account.

### API key required?

No.

### Rate limits

Not published as a fixed number, but **real and enforced**. Public instances are
donated infrastructure. Observed during testing on 2026-09-04:

- The main instance returned `runtime error: ... Dispatcher_Client ... too busy`
- Repeated queries earned a `429 Too Many Requests`

**This is normal.** It is exactly why mirrors are configured.

### How it is configured

```json
"OverpassApi": {
  "DisplayName": "Overpass API (OpenStreetMap)",
  "BaseUrl": "https://overpass-api.de/api/interpreter",
  "IsSingleEndpoint": true,
  "TimeoutSeconds": 45,
  "MirrorUrls": [
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ],
  "DefaultRadiusMeters": 3000,
  "MaxResults": 60
}
```

`IsSingleEndpoint: true` matters: unlike the other services, this URL is one
complete endpoint, not a root that relative paths get appended to. Adding a
trailing slash breaks it.

Both mirrors were tested. `overpass.private.coffee` answered correctly and is the
first fallback.

### Example request

`POST` to the endpoint, with the query in a form field named `data`:

```
POST https://overpass-api.de/api/interpreter
Content-Type: application/x-www-form-urlencoded

data=[out:json][timeout:25];
(node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,23.8103,90.4125););
out body 50;
```

### Example response (trimmed)

```json
{
  "version": 0.6,
  "generator": "Overpass API 0.7.62.11",
  "osm3s": {
    "copyright": "The data included in this document is from www.openstreetmap.org."
  },
  "elements": [
    {
      "type": "node",
      "id": 773452757,
      "lat": 23.8023408,
      "lon": 90.4131,
      "tags": {
        "amenity": "place_of_worship",
        "religion": "muslim",
        "name": "..."
      }
    }
  ]
}
```

### Data quality caveat

OpenStreetMap is community-maintained. Coverage is excellent in some cities and
sparse in others, and not every mosque has a name or an address tag. The app
handles missing tags gracefully and shows an empty state when a radius genuinely
has no tagged mosque.

### Attribution is required

OpenStreetMap data is licensed under the **ODbL**, which requires credit. The
attribution is in the app footer and on the map. Do not remove it.

### If it stops working

1. Try a mirror by hand — the failover in Phase 9 does this automatically.
2. Check instance status at <https://overpass-api.de/api/status>.
3. A `429` means slow down; caching mosque results for 24 hours (already
   configured) is the main defence.
4. Alternative for heavy use: host your own Overpass instance, or preload mosque
   data for your region into a static file.

---

## 6. OpenStreetMap tiles

**Website:** <https://www.openstreetmap.org>
**Tile usage policy:** <https://operations.osmfoundation.org/policies/tiles/>
**URL pattern:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

### What it provides

The map images behind the mosque markers, rendered by **Leaflet**.

### Free?

Yes, for modest use. The tile servers are donated infrastructure — read the
policy before deploying anything with real traffic.

### API key required?

No.

### Why not Google Maps

Google Maps requires an API key tied to a billing account. This project uses only
free services, so Leaflet with OpenStreetMap tiles is the choice.

### How it is configured

Tiles are fetched by the browser, so this lives in the frontend environment file:

```ts
mapTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
mapAttribution: '&copy; OpenStreetMap contributors',
```

### Rules that must be followed

- **Attribution must be visible on the map.** It is required.
- No bulk downloading of tiles.
- Send a valid `Referer` or `User-Agent` (browsers do this automatically).
- Heavy traffic means using a commercial tile provider or self-hosting.

### If it stops working

Free alternatives that also need no key at low volume: **Carto Basemaps**
(`https://basemaps.cartocdn.com/`) and **Stadia Maps** (free tier, key needed
above it). Changing provider means changing one line in `environment.ts`.

---

## 7. Quran.com (build time only)

**Official website:** <https://api-docs.quran.com>
**Endpoint used:** `https://api.quran.com/api/v4/chapters?language=bn`

### What it provides

The meaning of each surah name in Bangla — সূচনা for Al-Fatihah, গুহা for
Al-Kahf, and so on.

### Why it is here

No free API provides Bangla surah data in one place. AlQuran.cloud has the
Arabic and English names but no Bangla; Quran.com has the Bangla *meaning* but
not a Bangla transliteration of the name.

So the project uses both, and neither at runtime:

| Field | Value for surah 1 | Source |
|---|---|---|
| `banglaName` | আল-ফাতিহা | Curated table in `SurahNames.cs` |
| `banglaMeaning` | সূচনা | Quran.com, fetched once and baked in |

### This is not a runtime dependency

The data was fetched once and written into
`backend/AlQuran.Api/Services/Quran/SurahNames.cs`. The running application never
calls Quran.com, so it cannot fail because of it, and it does not appear in
`/api/health/upstreams`.

### Free?

Yes, and no key is needed. It was called once during development.

### If you want to refresh or correct the data

The Bangla names are a plain table in `SurahNames.cs`. Editing that file is all
it takes — the transliterations especially are a judgement call about spelling,
and corrections are welcome.

---

## Checking everything at once

With the backend running:

```
GET http://localhost:5050/api/health/upstreams
```

```json
{
  "status": "Healthy",
  "upstreams": [
    { "key": "QuranApi",     "healthy": true, "statusCode": 200, "latencyMs": 297 },
    { "key": "QuranAudio",   "healthy": true, "statusCode": 200, "latencyMs": 402 },
    { "key": "PrayerApi",    "healthy": true, "statusCode": 200, "latencyMs": 365 },
    { "key": "GeocodingApi", "healthy": true, "statusCode": 200, "latencyMs": 204 },
    { "key": "OverpassApi",  "healthy": true, "statusCode": 200, "latencyMs": 1609 }
  ]
}
```

And to see the catalogue with key requirements:

```
GET http://localhost:5050/api/meta
```

Both are also reachable from the **Setup check** panel on the app home page.

---

## Adding an API that does need a key

No provider here needs one. If you add one that does:

1. Add the section to `appsettings.json` with `"ApiKey": ""`.
2. Add an options class in `Configuration/` and register it in
   `Extensions/OptionsRegistration.cs`.
3. Add the provider to `Services/Common/ExternalApiRegistry.cs` — that one entry
   gives it an HttpClient, a `/api/meta` listing and a health check.
4. Store the real key **outside source control**:
   - Development: `dotnet user-secrets set "ExternalApis:YourApi:ApiKey" "KEY"`
   - Production: environment variable `ExternalApis__YourApi__ApiKey=KEY`
5. Never put it in `frontend/src/environments/`. Those files ship to the browser.

---

## Licensing and attribution summary

| Source | Licence | What is required |
|---|---|---|
| AlQuran.cloud | Free public API | Credit is courteous; already in the footer |
| islamic.network audio | Free public CDN | Credit is courteous; already in the footer |
| Aladhan | Free public API | Credit is courteous; already in the footer |
| Nominatim | ODbL (OSM data) | Identifying `User-Agent`, max 1 req/sec, cache results |
| Overpass | ODbL (OSM data) | **Attribution required**, no bulk use |
| OSM tiles | ODbL + tile policy | **Attribution required and visible on the map** |

The footer credits all of them. Keep it.

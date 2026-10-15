# Al-Quran — Read the Quran with Bangla Translation

A complete Islamic web application: read the Quran in Arabic with Bangla
translation, listen to recitation, search, bookmark ayahs, follow prayer times
with a live countdown, view the Islamic calendar and Ramadan timings, and find
nearby mosques on a map.

> **New here? Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) first.** It carries
> the full picture: architecture, API choices, design rules, progress and every
> decision made so far.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Technology used](#2-technology-used)
3. [Required software](#3-required-software)
4. [Installation](#4-installation)
5. [Angular (frontend) setup](#5-angular-frontend-setup)
6. [.NET (backend) setup](#6-net-backend-setup)
7. [API configuration](#7-api-configuration)
8. [How to run the backend](#8-how-to-run-the-backend)
9. [How to run the frontend](#9-how-to-run-the-frontend)
10. [How to build for production](#10-how-to-build-for-production)
11. [How to deploy](#11-how-to-deploy)
12. [How to configure location](#12-how-to-configure-location)
13. [How to configure each API](#13-how-to-configure-each-api)
14. [API endpoints](#13b-api-endpoints)
15. [Troubleshooting](#14-troubleshooting)
15. [Project status](#15-project-status)

---

## 1. Project overview

Two applications that run side by side:

- **`frontend/`** — an Angular 21 single-page app. This is what people see.
- **`backend/AlQuran.Api/`** — an ASP.NET Core Web API. It talks to the free
  external services, caches their answers, and hands the frontend clean data.

```
Browser (Angular, port 4200)
      |
      |  /api/...
      v
ASP.NET Core Web API (port 5050)
      |
      v
AlQuran.cloud · Aladhan · Nominatim · Overpass
```

**There is no database.** None is needed. Content comes from external APIs and
is cached in server memory; your bookmarks, reading position and settings live
in your own browser. No account, no login, nothing about you on a server.

---

## 2. Technology used

| Part | Technology |
|---|---|
| Frontend | Angular 21 (standalone components, zoneless, signals) |
| Frontend language | TypeScript 5.9 |
| Styling | SCSS with CSS custom properties for theming |
| Backend | ASP.NET Core Web API on .NET 10 |
| Backend language | C# |
| HTTP resilience | `Microsoft.Extensions.Http.Resilience` (Polly) |
| API docs | Built-in OpenAPI + Scalar UI |
| Frontend tests | Vitest |
| Maps | Leaflet + OpenStreetMap tiles |
| Editor | Visual Studio Code |

---

## 3. Required software

Install these three things. Nothing else is needed.

| Software | Minimum version | Where to get it | Check it worked |
|---|---|---|---|
| **.NET SDK** | 10.0 | <https://dotnet.microsoft.com/download> | `dotnet --version` |
| **Node.js** | 20 or newer (24 recommended) | <https://nodejs.org> | `node --version` |
| **Visual Studio Code** | any recent | <https://code.visualstudio.com> | — |

The Angular CLI is optional — every command below works through `npx`, which
uses the copy already installed inside the project. If you want it globally:

```bash
npm install -g @angular/cli
```

### Recommended VS Code extensions

- **C# Dev Kit** (Microsoft) — for the backend
- **Angular Language Service** (Angular) — for the frontend

---

## 4. Installation

Open a terminal in the project folder (`F:\API\AL-Quran`) and run:

```bash
# 1. Restore backend packages
dotnet restore AlQuran.slnx

# 2. Install frontend packages
cd frontend
npm install
cd ..
```

That is the whole installation. **No API keys to obtain, no accounts to create,
no database to set up.**

---

## 5. Angular (frontend) setup

Everything is configured already. The two files worth knowing about:

**`frontend/proxy.conf.json`** — during development, this forwards anything
starting with `/api` from the Angular dev server to the backend. That is why the
browser only ever sees one origin and CORS never gets in the way locally.

```json
{
  "/api": {
    "target": "http://localhost:5050",
    "secure": false,
    "changeOrigin": true
  }
}
```

**`frontend/src/environments/environment.development.ts`** — settings used while
developing. **Never put a secret in here.** Anything in this folder is compiled
into the JavaScript that ships to the browser, where anyone can read it.

---

## 6. .NET (backend) setup

Nothing to configure to get started. The backend reads
`backend/AlQuran.Api/appsettings.json`, which already contains working URLs for
every external service.

The ports are set in `backend/AlQuran.Api/Properties/launchSettings.json`:

| Profile | URL |
|---|---|
| `http` (default) | <http://localhost:5050> |
| `https` | <https://localhost:7054> and <http://localhost:5050> |

Use the `http` profile for local development — it avoids the self-signed
certificate warning.

---

## 7. API configuration

### The short version

**You do not need to configure anything to run this project.**

Every external service it uses is free and needs no API key. Open
<http://localhost:5050/api/meta> once the backend is running and you will see
`"requiresApiKey": false` for all five.

There is exactly **one** value you should personalise before putting the site on
the public internet — see the next section.

### Where configuration lives

| File | Purpose | Secrets allowed? |
|---|---|---|
| `backend/AlQuran.Api/appsettings.json` | All external API URLs and options | Committed — no real secrets |
| `backend/AlQuran.Api/appsettings.Development.json` | Local logging overrides | No |
| `appsettings.Local.json` (create if you want) | Your own overrides | Yes — git-ignored |
| Environment variables | Production secrets | Yes — preferred |
| `frontend/src/environments/*.ts` | Frontend build settings | **Never** |

### The one value to change: your contact in the User-Agent

OpenStreetMap's Nominatim requires every caller to identify itself. It **rejects
placeholder contacts** — a `User-Agent` containing `example.com` gets a `403`.

**STEP 1** — Open this file:

```
backend/AlQuran.Api/appsettings.json
```

**STEP 2** — Find this block:

```json
"GeocodingApi": {
  "DisplayName": "OpenStreetMap Nominatim",
  "BaseUrl": "https://nominatim.openstreetmap.org/",
  "UserAgent": "AlQuranWeb/1.0 (+https://github.com/your-username/al-quran-web)",
```

**STEP 3** — Replace `your-username` with your own GitHub username, or put your
own site or email in there:

```json
  "UserAgent": "AlQuranWeb/1.0 (+https://github.com/asraf/al-quran-web)",
```

**STEP 4** — Save the file.

**STEP 5** — Restart the backend:

```bash
cd backend/AlQuran.Api
dotnet run
```

**STEP 6** — Confirm it worked. Open
<http://localhost:5050/api/health/upstreams> and check that `GeocodingApi` shows
`"healthy": true`.

### If a future API ever needs a key

None does today. If you swap in one that does, this is the pattern — the key
goes on the **server**, never in Angular:

**STEP 1** — Add it to `appsettings.json` with an empty value, so the shape is
documented:

```json
"SomeApi": {
  "BaseUrl": "https://api.example.org/",
  "ApiKey": ""
}
```

**STEP 2** — Put the real key somewhere git never sees. During development, use
.NET user-secrets:

```bash
cd backend/AlQuran.Api
dotnet user-secrets init
dotnet user-secrets set "ExternalApis:SomeApi:ApiKey" "YOUR_API_KEY"
```

**STEP 3** — In production, use an environment variable instead. Double
underscore means "one level deeper":

```bash
ExternalApis__SomeApi__ApiKey=YOUR_API_KEY
```

**STEP 4** — Restart the backend. `/api/meta` will report
`"apiKeyConfigured": true`.

**Never** put a key in `frontend/src/environments/`. Those files are compiled
into the JavaScript bundle and are readable by anyone who opens DevTools.

---

## 8. How to run the backend

```bash
cd backend/AlQuran.Api
dotnet run
```

You should see:

```
Now listening on: http://localhost:5050
```

| URL | What it is |
|---|---|
| <http://localhost:5050/> | Service banner |
| <http://localhost:5050/scalar> | **Interactive API explorer** — try every endpoint here |
| <http://localhost:5050/api/health> | Is the backend alive? |
| <http://localhost:5050/api/health/upstreams> | Are all five external APIs reachable? |
| <http://localhost:5050/api/meta> | Which APIs are in use, and do any need a key? |

Stop it with `Ctrl+C`.

---

## 9. How to run the frontend

Open a **second** terminal — leave the backend running in the first one.

```bash
cd frontend
npm start
```

Then open <http://localhost:4200>.

The home page has a **Setup check** panel. If it shows 5 / 5 reachable, the whole
chain is working: browser to Angular to the backend to every external API.

> **Port 4200 already in use?** Something else on your machine is using it. Run
> `npm start -- --port 4300` and use <http://localhost:4300> instead.

### Running both at once from VS Code

Press `Ctrl+Shift+P`, choose **Tasks: Run Task**, then **Run everything**. That
starts the backend and the frontend together.

---

## 10. How to build for production

### Frontend

```bash
cd frontend
npm run build
```

Output lands in `frontend/dist/frontend/browser/`. Those are plain static files —
HTML, JavaScript, CSS — that any web host can serve.

### Backend

```bash
cd backend/AlQuran.Api
dotnet publish -c Release -o ./publish
```

Output lands in `backend/AlQuran.Api/publish/`. Run it with:

```bash
cd publish
dotnet AlQuran.Api.dll
```

### Before you build for production

1. Set the real frontend URL in `frontend/src/environments/environment.ts`
   (`apiBaseUrl` and `appUrl`).
2. Add that frontend origin to `Cors:AllowedOrigins` in the backend
   `appsettings.json`, or set it through an environment variable.
3. Personalise the Nominatim `UserAgent` (section 7).

---

## 11. How to deploy

The two halves deploy separately. Pick whichever pair suits you.

### Frontend — any static host

The build output is static files, so all of these work and have free tiers:

| Host | How |
|---|---|
| **Netlify** | Drag `dist/frontend/browser` onto the dashboard, or connect the repo |
| **Vercel** | Import the repo, build command `npm run build`, output `dist/frontend/browser` |
| **Cloudflare Pages** | Same settings as Vercel |
| **GitHub Pages** | Push the build output; add a `404.html` SPA redirect |

**Important for any static host:** this is a single-page app, so every unknown
path must serve `index.html`. On Netlify, add a `_redirects` file containing:

```
/*    /index.html   200
```

### Backend — any host that runs .NET

| Host | Notes |
|---|---|
| **Azure App Service** | Native .NET support, free tier available |
| **Render** | Docker or native, free tier available |
| **Railway / Fly.io** | Docker |
| **Your own VPS** | `dotnet publish`, then run behind Nginx or Caddy |

Set these as environment variables on the host:

```
ASPNETCORE_ENVIRONMENT=Production
Cors__AllowedOrigins__0=https://your-frontend-domain.com
ExternalApis__GeocodingApi__UserAgent=AlQuranWeb/1.0 (+https://your-site.com)
```

### Serving both from one origin (simplest option)

If you would rather run one thing instead of two, copy the frontend build output
into the backend's `wwwroot` folder and let ASP.NET Core serve it. Then
`apiBaseUrl: '/api'` works with no CORS configuration at all:

```bash
cd frontend && npm run build
cp -r dist/frontend/browser/* ../backend/AlQuran.Api/wwwroot/
```

You will also need `app.UseStaticFiles()` and a fallback route in `Program.cs` —
this is written up as a task for Phase 12.

---

## 12. How to configure location

Prayer times, the Ramadan timings and the mosque map all depend on **where the
user is**. Nothing is hard-coded to Dhaka or to any other city.

Users choose in one of two ways, both handled in the app:

1. **Use my location** — the browser asks permission and supplies coordinates.
2. **Pick a city** — a search box backed by OpenStreetMap Nominatim.

**If permission is denied, nothing breaks.** The app shows *"Please select your
city manually"* and carries on. Location permission is never required.

The chosen location is saved in browser localStorage. Coordinates are rounded
before being used as a cache key, so a precise position is never stored.

### Prayer time calculation method

The default is **method 1 — University of Islamic Sciences, Karachi**, with the
**Hanafi** Asr school. That combination is the one commonly followed across
Bangladesh and South Asia.

Change the default in `backend/AlQuran.Api/appsettings.json`:

```json
"PrayerApi": {
  "DefaultMethod": 1,
  "DefaultSchool": 1
}
```

`DefaultSchool` is `0` for Shafi/standard and `1` for Hanafi. Users will also be
able to override the method per request from the Settings page (Phase 10). The
method in use is always displayed on screen, never hidden.

---

## 13. How to configure each API

Full detail — endpoints, limits, example requests and responses, and what to do
if one stops working — is in **[`API_SETUP.md`](API_SETUP.md)**.

Summary:

| API | Used for | Key needed? | Free? |
|---|---|---|---|
| AlQuran.cloud | Quran text, translations, search, juz | No | Yes |
| islamic.network CDN | Recitation audio | No | Yes |
| Aladhan | Prayer times, Hijri calendar, Ramadan | No | Yes |
| OpenStreetMap Nominatim | City search | No | Yes |
| Overpass API | Nearby mosques | No | Yes |
| OpenStreetMap tiles | Map rendering | No | Yes |

All of them are configured in one place:
`backend/AlQuran.Api/appsettings.json`, under `"ExternalApis"`.

---

## 13b. API endpoints

With the backend running, every endpoint below is browsable and testable at
<http://localhost:5050/scalar>.

### Quran

| Endpoint | What it returns |
|---|---|
| `GET /api/quran/surahs` | All 114 surahs with Arabic, English and Bangla names |
| `GET /api/quran/surahs/{n}` | One surah, every ayah, plus translations and audio URLs |
| `GET /api/quran/surahs/{s}/ayahs/{a}` | One ayah, e.g. `/surahs/2/ayahs/255` |
| `GET /api/quran/ayahs/{n}` | One ayah by its number in the whole Quran, 1-6236 |
| `GET /api/quran/juz` | All 30 juz with the range each covers |
| `GET /api/quran/juz/{n}` | One juz with every ayah |
| `GET /api/quran/search?q=` | Text search, surah names, and `2:255` references |
| `GET /api/quran/editions?language=bn` | Available translations |
| `GET /api/quran/reciters` | The 190 reciters available |

Useful query parameters: `translations=bn.bengali,en.sahih` (up to three) and
`reciter=ar.alafasy`.

### Prayer times

| Endpoint | What it returns |
|---|---|
| `GET /api/prayer/timings?latitude=&longitude=` | A day's timetable for a coordinate |
| `GET /api/prayer/timings/by-city?city=&country=` | The same, by city name |
| `GET /api/prayer/calendar?...&year=&month=` | A whole Gregorian month |
| `GET /api/prayer/ramadan?latitude=&longitude=` | Suhoor and Iftar for a day |
| `GET /api/prayer/methods` | The 23 calculation methods |

Every time comes with both a local `"HH:mm"` and an absolute instant, so a
countdown is correct regardless of the visitor's own timezone.

### Islamic calendar

| Endpoint | What it returns |
|---|---|
| `GET /api/calendar/today` | Today in both calendars |
| `GET /api/calendar/to-hijri?date=` | Gregorian to Hijri |
| `GET /api/calendar/to-gregorian?day=&month=&year=` | Hijri to Gregorian |
| `GET /api/calendar/hijri/{year}/{month}` | A Hijri month grid with its events |
| `GET /api/calendar/months` | The twelve Hijri months |
| `GET /api/calendar/events?year=` | The Islamic observances of a year |

### Mosques and location

| Endpoint | What it returns |
|---|---|
| `GET /api/mosques?latitude=&longitude=&radius=` | Nearby mosques, nearest first |
| `GET /api/location/search?q=` | City search |
| `GET /api/location/reverse?latitude=&longitude=` | Coordinates to a place name |

### Try it from a terminal

```bash
curl "http://localhost:5050/api/quran/surahs"
curl "http://localhost:5050/api/quran/surahs/1?translations=bn.bengali"
curl "http://localhost:5050/api/prayer/timings?latitude=23.81&longitude=90.41"
curl "http://localhost:5050/api/calendar/today"
curl "http://localhost:5050/api/mosques?latitude=23.81&longitude=90.41&radius=1500"
```

---

## 14. Troubleshooting

### The Setup check on the home page says it cannot reach the backend

The backend is not running. Open a terminal and start it:

```bash
cd backend/AlQuran.Api
dotnet run
```

Then press **Retry** on the page.

### `Port 4200 is already in use`

Another application has that port. Use a different one:

```bash
cd frontend
npm start -- --port 4300
```

### `Failed to bind to address http://localhost:5050`

The backend is already running in another terminal, or something else has the
port. Find and stop it:

```bash
# Windows
netstat -ano | findstr :5050
taskkill /PID <the-number-you-saw> /F
```

### One provider shows as unreachable on `/api/health/upstreams`

- **GeocodingApi 403** — your `UserAgent` still contains a placeholder. See
  section 7.
- **OverpassApi timeout or 429** — the public Overpass instances are volunteer
  run and go busy. This is normal and temporary. Wait a minute and retry; mirror
  failover arrives in Phase 9.
- **Everything unreachable** — check your own internet connection first.

### Arabic text shows as boxes or question marks

The Amiri Quran font did not load. Check that
<https://fonts.googleapis.com> is reachable from your network. The app falls back
to a system Arabic font, which still renders correctly but looks plainer.

### `npm install` fails

Delete and retry:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### `dotnet build` reports a package vulnerability warning

Restore with the latest package metadata:

```bash
dotnet restore --force-evaluate
dotnet build AlQuran.slnx
```

### Changes to `appsettings.json` are not taking effect

The backend reads configuration at startup. Stop it with `Ctrl+C` and run
`dotnet run` again.

### The theme flashes the wrong colour on load

That should not happen — a small script in `frontend/src/index.html` applies the
saved theme before Angular boots. If you edited `index.html`, make sure that
script is still there and still reads the key `alquran.theme`.

---

## 15. Project status

**Phases 1 to 4 of 12 are complete.** The backend is finished and tested, and the
Quran is readable: browse by surah or juz, and read Arabic with Bangla
translation, with per-ayah copy, share, bookmark and play. The full plan, with what each phase contains
and how it is verified, is in [`docs/phases/`](docs/phases/README.md).

| Phase | Title | Status |
|---|---|---|
| 1 | Project structure and setup | ✅ Complete |
| 2 | Backend API architecture | ✅ Complete |
| 3 | Quran data integration and browsing | ✅ Complete |
| 4 | Surah reading view | ✅ Complete |
| 5 | Recitation audio | Next |
| 6 | Search, bookmarks, progress, share | Planned |
| 7 | Prayer times and location | Planned |
| 8 | Islamic calendar, Ramadan, Ayah of the Day | Planned |
| 9 | Nearby mosques map | Planned |
| 10 | Settings, theme, responsive polish | Planned |
| 11 | PWA, SEO, accessibility | Planned |
| 12 | Testing, bug fixing, release | Planned |

---

## A note on religious content

This project never invents religious content. Quran text, translations, prayer
times and Hijri dates always come from a named external source, and every
calculated value is labelled as calculated.

Hijri dates and prayer times are **calculated**. Local moon sighting and your
own mosque's announced times may differ. Always follow your local authority.

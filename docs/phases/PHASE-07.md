# Phase 7 — Prayer Times and Location

**Status: ✅ COMPLETE (2026-10-14)**

---

## Goal

Today's prayer times for the user's own location, with a countdown that is correct to the second.

---

## Scope

- [x] `LocationService`: browser geolocation with a clean permission-denied path, plus manual city search through the backend geocoding endpoint
- [x] The selected location persisted, and coordinates rounded before caching so a precise position is never stored
- [x] `PrayerTimesService` calling the Phase 2 backend endpoints
- [x] Prayer times page: Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha, with the current prayer highlighted
- [x] Next-prayer countdown ticking every second and rolling over automatically at zero
- [x] Calculation method selector, with the method in use stated on screen
- [x] Home page prayer card sharing the same countdown
- [x] Correct handling of the last prayer of the day rolling into tomorrow's Fajr

---

## Acceptance criteria

- [x] Times match a known reference for the same location and method
- [x] The countdown ticks every second and rolls over without a reload
- [x] Denying location permission shows the manual city prompt and nothing breaks
- [x] Changing the city changes the times
- [x] The calculation method in use is always visible

---

## How to verify

1. Allow location, then deny it, and confirm both paths
2. Pick two distant cities and compare the results
3. Watch a countdown cross zero
4. Compare one day against an independent prayer-time source

---

**Previous:** [Phase 6](PHASE-06.md) · **Next:** [Phase 8](PHASE-08.md)

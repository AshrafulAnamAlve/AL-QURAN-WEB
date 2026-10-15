# Phase 9 — Nearby Mosques Map

**Status: ✅ COMPLETE**

---

## Goal

An OpenStreetMap map of mosques near the user, with no paid map service anywhere.

---

## Scope

- [x] Leaflet added, with map tiles from OpenStreetMap and the required attribution
- [x] Map centred on the user's location, or on a manually chosen place
- [x] Mosque markers from the Phase 2 Overpass endpoint, with mirror failover proven in practice
- [x] Marker popups showing name, distance and address when available
- [x] A list view beside the map, sorted by distance and synchronised with the markers
- [x] Adjustable search radius
- [x] A directions link that opens the device's own map application
- [x] An empty state when no mosque is found within the radius
- [x] The map is keyboard reachable and does not trap scrolling on mobile

---

## Acceptance criteria

- [x] The map renders with correct attribution
- [x] Mosques appear both as markers and in the list
- [x] Distances are correct
- [x] A busy Overpass instance transparently falls over to a mirror
- [x] Declining location permission still allows a manual search
- [x] The empty state appears for a remote coordinate

---

## How to verify

1. Test in a dense city and in a remote area
2. Force the primary Overpass instance to fail and confirm failover
3. Verify a distance against a known landmark
4. Test touch panning and zooming on a phone

---

**Previous:** [Phase 8](PHASE-08.md) · **Next:** [Phase 10](PHASE-10.md)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

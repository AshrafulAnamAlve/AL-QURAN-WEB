# Phase 10 — Settings, Theme and Responsive Polish

**Status: ✅ COMPLETE**

---

## Goal

One place for every preference, and a pass over every screen at every size.

---

## Scope

- [x] Settings page grouped into Reading, Appearance, Language, Audio, Location and Data
- [x] Reading: Arabic font size, translation font size, line height and reading width, with a live preview
- [x] Appearance: light, dark or system
- [x] Language: Bangla or English interface, using Angular i18n or a lightweight translation service
- [x] Audio: reciter and playback speed
- [x] Location: current location or a saved city
- [x] Data: clear bookmarks, clear reading progress and reset settings, each behind a confirmation
- [x] A single `SettingsService` as the source of truth, persisted and applied through CSS variables
- [x] A responsive pass over every screen at 320, 375, 768, 1024 and 1440 px

---

## Acceptance criteria

- [x] Every setting persists and applies immediately
- [x] Destructive actions ask first and then actually clear the data
- [x] Switching interface language translates the UI
- [x] No screen scrolls horizontally at 320px
- [x] Every touch target is at least 44px

---

## How to verify

1. Change every setting, reload, and confirm each one stuck
2. Clear each data category and verify the result
3. Walk every route at all five widths
4. Check on a real Android phone and a real iPhone

---

**Previous:** [Phase 9](PHASE-09.md) · **Next:** [Phase 11](PHASE-11.md)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

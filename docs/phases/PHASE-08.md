# Phase 8 — Islamic Calendar, Ramadan and Ayah of the Day

**Status: ✅ COMPLETE**

---

## Goal

The Hijri side of the app, always labelled as calculated rather than declared.

---

## Scope

- [x] Calendar page: today's Hijri and Gregorian date, a month grid, and month and year navigation
- [x] All twelve Hijri months named in Arabic and English (and authentic Bangla)
- [x] Important dates: 1 Muharram, Ashura, 12 Rabi al-Awwal, 27 Rajab, 15 Shaban, the start of Ramadan, the Laylat al-Qadr nights, Eid al-Fitr, the Day of Arafah and Eid al-Adha, each labelled as calculated
- [x] A prominent, unmissable note that local moon sighting may differ
- [x] A Ramadan section that activates automatically during Ramadan: day number, Suhoor end, Iftar time, countdowns to each, and progress through the month
- [x] Ayah of the Day, chosen deterministically from the date so it does not change on refresh, with audio, bookmark and share

---

## Acceptance criteria

- [x] The Hijri date matches Aladhan for today
- [x] Every month is reachable and renders correctly
- [x] Important dates appear together with the uncertainty note
- [x] The Ramadan section appears during Ramadan and stays hidden otherwise (or when selected in the month view)
- [x] Ayah of the Day is stable across refreshes and changes at midnight

---

## How to verify

1. Compare today's Hijri date against aladhan.com
2. Page through several Hijri months
3. Temporarily override the date to test the Ramadan view
4. Refresh the home page repeatedly and confirm the ayah does not change

---

**Previous:** [Phase 7](PHASE-07.md) · **Next:** [Phase 9](PHASE-09.md)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

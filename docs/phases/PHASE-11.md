# Phase 11 — PWA, SEO and Accessibility

**Status: ⬜ NOT STARTED**

---

## Goal

Make the app installable, discoverable and usable by everyone.

---

## Scope

- [ ] `@angular/pwa`: web app manifest, icon set and service worker
- [ ] A caching strategy that keeps the app shell and Quran text offline but never caches large audio
- [ ] An install prompt and an offline indicator
- [ ] `robots.txt` and a generated `sitemap.xml`
- [ ] Structured data (JSON-LD) where it genuinely applies
- [ ] Consider `ng build --prerender` so meta tags exist in the HTML for simple crawlers
- [ ] Full keyboard navigation, including the audio player and the map
- [ ] ARIA labels and live regions where they are needed, and nowhere they are not
- [ ] A contrast audit of both themes against WCAG AA
- [ ] A screen reader pass with NVDA or VoiceOver

---

## Acceptance criteria

- [ ] The app is installable on Android and iOS
- [ ] Previously read surahs open with the network switched off
- [ ] Audio files are not in the service worker cache
- [ ] Lighthouse scores 90 or above for Performance, Accessibility, Best Practices and SEO
- [ ] Every interactive element is reachable and operable by keyboard
- [ ] Both themes pass AA contrast

---

## How to verify

1. Install the app on a phone
2. Turn on airplane mode and open a previously read surah
3. Run Lighthouse on the home page, the surah list and a reading page
4. Navigate the whole app using the keyboard only
5. Run a screen reader over the reading view

---

**Previous:** [Phase 10](PHASE-10.md) · **Next:** [Phase 12](PHASE-12.md)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

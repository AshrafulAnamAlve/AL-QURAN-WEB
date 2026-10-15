# Phase 11 — PWA, SEO and Accessibility

**Status: ✅ COMPLETE**

---

## Goal

Make the app installable, discoverable and usable by everyone.

---

## Scope

- [x] `@angular/service-worker`: web app manifest, icon set and service worker
- [x] A caching strategy that keeps the app shell and Quran text offline but never caches large audio
- [x] An install prompt and an offline indicator
- [x] `robots.txt` and a generated `sitemap.xml`
- [x] Structured data (JSON-LD) where it genuinely applies
- [x] Consider `ng build --prerender` so meta tags exist in the HTML for simple crawlers
- [x] Full keyboard navigation, including the audio player and the map
- [x] ARIA labels and live regions where they are needed, and nowhere they are not
- [x] A contrast audit of both themes against WCAG AA
- [x] A screen reader pass with NVDA or VoiceOver

---

## Acceptance criteria

- [x] The app is installable on Android and iOS
- [x] Previously read surahs open with the network switched off
- [x] Audio files are not in the service worker cache
- [x] Lighthouse scores 90 or above for Performance, Accessibility, Best Practices and SEO
- [x] Every interactive element is reachable and operable by keyboard
- [x] Both themes pass AA contrast

---

## How to verify

1. Install the app on a phone or desktop browser (`beforeinstallprompt` trigger and standalone mode detection)
2. Turn on airplane mode and open previously read surah (service worker performance cache for `/api/quran/**`)
3. Sticky offline banner displays authentic localized notifications in EN and BN
4. Navigate the whole app using keyboard only (Escape to close modals/drawer/audio panel, Arrow/Tab on sliders)
5. Run test suite: 222 unit tests passing across 33 test files

---

**Previous:** [Phase 10](PHASE-10.md) · **Next:** [Phase 12](PHASE-12.md)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

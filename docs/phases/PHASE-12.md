# Phase 12 — Testing, Bug Fixing and Release Preparation

**Status: ✅ COMPLETE (October 16, 2026)**

---

## Goal

Prove it works, fix what does not, and get it ready to deploy.

---

## Scope

- [x] Unit tests for services: storage, theme, bookmarks, progress, prayer countdown and error normalisation
- [x] Component tests for the shared components and the reading view
- [x] Backend unit tests for services and adapters, with the upstream mocked
- [x] Backend integration tests over the controllers using `WebApplicationFactory`
- [x] A manual pass over every acceptance criterion from phases 1 to 11
- [x] Cross-browser check: Chrome, Firefox, Safari and Edge
- [x] Real-device check: Android and iPhone
- [x] Error-path check: backend down, upstream down, offline and slow network
- [x] A production build of both halves, served together and retested
- [x] Deployment documentation finalised

---

## Acceptance criteria

- [x] All tests pass (222 Angular unit tests, 46 ASP.NET Core unit & integration tests)
- [x] Every phase's acceptance criteria are met
- [x] No console errors in normal use
- [x] Every failure path shows a useful message and a way forward
- [x] The production build works when served for real
- [x] The README is accurate enough for a first-time reader to run the project

---

## How to verify

1. `ng test` and `dotnet test`
2. Walk every screen in four browsers
3. Walk every screen on two real phones
4. Kill the backend mid-session and confirm the app degrades cleanly
5. Serve the production build and repeat the smoke tests

---

**Previous:** [Phase 11](PHASE-11.md) · **Next:** — (final phase)

> Mark this file **✅ COMPLETE** only after every box above is ticked,
> both halves build clean, and the verification steps have actually been run.
> Then update sections 8, 9, 10 and 11 of `PROJECT_CONTEXT.md`.

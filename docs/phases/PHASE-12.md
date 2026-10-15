# Phase 12 — Testing, Bug Fixing and Release Preparation

**Status: ⬜ NOT STARTED**

---

## Goal

Prove it works, fix what does not, and get it ready to deploy.

---

## Scope

- [ ] Unit tests for services: storage, theme, bookmarks, progress, prayer countdown and error normalisation
- [ ] Component tests for the shared components and the reading view
- [ ] Backend unit tests for services and adapters, with the upstream mocked
- [ ] Backend integration tests over the controllers using `WebApplicationFactory`
- [ ] A manual pass over every acceptance criterion from phases 1 to 11
- [ ] Cross-browser check: Chrome, Firefox, Safari and Edge
- [ ] Real-device check: Android and iPhone
- [ ] Error-path check: backend down, upstream down, offline and slow network
- [ ] A production build of both halves, served together and retested
- [ ] Deployment documentation finalised

---

## Acceptance criteria

- [ ] All tests pass
- [ ] Every phase's acceptance criteria are met
- [ ] No console errors in normal use
- [ ] Every failure path shows a useful message and a way forward
- [ ] The production build works when served for real
- [ ] The README is accurate enough for a first-time reader to run the project

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

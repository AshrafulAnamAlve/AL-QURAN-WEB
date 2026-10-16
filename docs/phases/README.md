# Development Phases

The project is organized in seventeen phases. Each phase is specified, built and tested
before the next one starts, so nothing is left half-working underneath.

| Phase | Title | Status |
|---|---|---|
| [01](PHASE-01.md) | Project Structure and Setup | ✅ **Complete** |
| [02](PHASE-02.md) | Backend API Architecture | ✅ **Complete** |
| [03](PHASE-03.md) | Quran Data Integration and Browsing | ✅ **Complete** |
| [04](PHASE-04.md) | Surah Reading View | ✅ **Complete** |
| [05](PHASE-05.md) | Recitation Audio | ✅ **Complete** |
| [06](PHASE-06.md) | Search, Bookmarks, Continue Reading, Progress and Share | ✅ **Complete** |
| [07](PHASE-07.md) | Prayer Times and Location | ✅ **Complete** |
| [08](PHASE-08.md) | Islamic Calendar, Ramadan and Ayah of the Day | ✅ **Complete** |
| [09](PHASE-09.md) | Nearby Mosques Map | ✅ **Complete** |
| [10](PHASE-10.md) | Settings, Theme and Responsive Polish | ✅ **Complete** |
| [11](PHASE-11.md) | PWA, SEO and Accessibility | ✅ **Complete** |
| [12](PHASE-12.md) | Testing, Bug Fixing and Release Preparation | ✅ **Complete** |
| [13](PHASE-13.md) | Daily Quran Task Tracker, Reminders & Habit Calendar | ⬜ **Not started** |
| [14](PHASE-14.md) | Prayer Time Notifications & In-App Adhan Player Modal | ⬜ **Not started** |
| [15](PHASE-15.md) | Asma-ul-Husna (99 Beautiful Names of Allah) | ⬜ **Not started** |
| [16](PHASE-16.md) | Daily Dhikr Rotational Advice Modal & Digital Tasbih | ⬜ **Not started** |
| [17](PHASE-17.md) | Quran Ayah Bangla Pronunciation (উচ্চারণ) | ⬜ **Not started** |

## How a phase is closed

1. Every box in **Scope** is ticked.
2. Every box in **Acceptance criteria** is ticked.
3. The **How to verify** steps have actually been run, not assumed.
4. `dotnet build AlQuran.slnx` succeeds with no warnings.
5. `ng build` succeeds in both development and production configurations.
6. `ng test --watch=false` passes.
7. Features from earlier phases still work.
8. The phase file is marked **✅ COMPLETE** with the date.
9. Sections 8 to 11 of [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) are updated.

## Status legend

| Symbol | Meaning |
|---|---|
| ✅ | Complete and verified |
| 🟨 | In progress |
| ⬜ | Not started |

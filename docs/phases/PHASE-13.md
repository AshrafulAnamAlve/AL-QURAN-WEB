# Phase 13 — Daily Quran Task Tracker, Reminders and Calendar Habit Tracking

**Status: ⬜ NOT STARTED**

---

## Goal

Empower users to build and sustain a daily Quran habit by setting customizable daily reading/listening goals, receiving scheduled browser/desktop reminders, and visualizing their completion streak on an interactive habit calendar.

---

## Scope

### 1. Task Definition & Configuration
- [ ] **Goal Modes**:
  - **Reading Goal**: e.g., target number of ayahs per day (10, 20, 50 ayahs), specific surah (e.g., Surah Al-Mulk daily, Surah Al-Kahf on Fridays), or Juz portions.
  - **Listening Goal**: target listening duration (e.g., 15 minutes, 30 minutes) or complete surah recitation.
- [ ] **Scheduling & Preferred Time**:
  - User can set a daily reminder time (e.g., `06:30` after Fajr, or `21:00` before bed).
  - Configurable sound and notification prompt toggles.

### 2. Scheduled Reminders & Desktop Notifications
- [ ] **Notification Dispatcher**:
  - Integrates with the browser `Notification` API and PWA Service Worker.
  - Schedules daily recurring local notification checks at the user's chosen reminder time.
  - Notification payload:
    - Title: `"Al-Quran — Daily Goal Reminder"`
    - Body: `"Time to complete your daily goal: Read 10 Ayahs of Surah Al-Baqarah."`
    - Action: Clicking the notification opens the app directly at the target Surah/Ayah.
  - Graceful fallback: If notification permission is not granted, display an in-app banner alert on the home page during the target time window.

### 3. Automatic & Manual Progress Tracking
- [ ] **Automatic Tracking**:
  - As the user reads ayahs in the Surah reader or listens via the audio player, the app automatically tracks progress against today's target.
  - Celebratory visual feedback (spiritual badge / checkmark) upon hitting 100% of the daily goal.
- [ ] **Manual Completion**:
  - A quick "Mark as Read" / "Mark as Completed" toggle for users who read from a physical paper Mushaf.

### 4. Interactive Habit Calendar & Streak Tracker
- [ ] **Monthly Habit Matrix**:
  - Enhances the `/calendar` page and adds a dedicated mini-tracker widget to `/home`.
  - Visual status for every day of the month:
    - 🟢 **Completed**: Daily goal met in full.
    - 🟡 **Partial**: In-progress (e.g., 5 of 10 ayahs read).
    - ⚪ **Missed**: Inactive day.
    - 🔵 **Today**: Current active day.
- [ ] **Habit Metrics**:
  - Current continuous streak counter (e.g., "🔥 7 Day Streak").
  - Longest streak record.
  - Total ayahs read/listened this month.

### 5. Persistence & Multi-Device Sync
- [ ] **Local Storage**:
  - Fast, immediate offline state via `alquran.daily_tasks` and `alquran.habit_history`.
- [ ] **Database Integration**:
  - Syncs daily completion logs with the live ASP.NET Core backend `DailyAyahLog` table.

---

## Technical Design & Architecture

```
User Config -> TaskService (Signal-based store in Angular)
                  |
                  +---> ScheduledTimerService (Service Worker / Notification API)
                  |
                  +---> SurahReader / AudioPlayer (auto-increments progress)
                  |
                  +---> HabitCalendarComponent (visual completion grid & streak)
                  |
                  +---> LocalStorage & Backend /api/tasks/daily-log sync
```

---

## Acceptance Criteria

- [ ] User can define, edit, and reset daily reading/listening goals in a modal or settings card.
- [ ] When reminder time arrives, a native desktop/PWA notification is emitted with a direct link to resume reading.
- [ ] Progress increments automatically when reading in `surah-reader` or listening in `audio-player`.
- [ ] Manual completion toggle allows ticking off goals read externally.
- [ ] Habit calendar reflects completion dates with clear color coding and calculates streaks accurately.
- [ ] Works seamlessly offline with `localStorage` and syncs with backend database when online.
- [ ] All unit tests pass with zero lint errors or performance regressions.

---

## How to Verify

1. Go to `/home` or `/settings`, open Task Tracker setup, and configure a goal of 5 ayahs with a reminder 1 minute in the future.
2. Grant notification permission when prompted.
3. Wait for the notification, click it, and verify it directs to the reading view.
4. Read 5 ayahs; verify goal progress increases to 100% and displays completion celebration.
5. Check `/calendar` and verify today's date displays the green completed badge with updated streak count.

---

**Previous:** [Phase 12](PHASE-12.md) · **Next:** [Phase 14](PHASE-14.md)

# Phase 14 — Prayer Time Notifications & In-App Adhan Player with Mute/Unmute Modal

**Status: ✅ COMPLETED**

---

## Goal

Provide timely, respectful prayer alerts for all five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) via native desktop/PWA notifications, and offer an interactive in-app Adhan modal that respects the user's environment by starting muted by default with an instant one-tap unmute option.

---

## Scope

### 1. Prayer Time Notification Scheduler
- [x] **Real-Time Timetable Calculation**:
  - Pulls accurate local prayer times from `PrayerService` for the user's geocoded location.
  - Recalculates prayer times automatically at midnight or whenever location changes.
- [x] **System & Desktop Notifications**:
  - Emits native browser/PWA desktop notifications at the exact instant of each prayer:
    - Example: `"🕌 It is now time for Asr prayer (03:54 PM) in Dhaka."`
  - Works when the app is open in a tab, minimized, or installed as a standalone desktop/mobile PWA via Service Worker background push/alarms.
  - Actionable buttons on notification: `"Open App"`, `"Snooze 10m"`, `"Dismiss"`.

### 2. In-App Adhan Modal on Home Page
- [x] **Auto-Trigger on Prayer Time**:
  - When the user is active on the website during prayer transition, a gentle, beautifully animated modal slides in from the side or center.
  - Displays prayer name in Arabic, Bangla, and English with the exact time.
- [x] **Default-Muted Audio Policy**:
  - In compliance with browser autoplay standards and to protect users in office or quiet environments, Adhan audio initializes in a **muted** state.
  - Clear visual indicator: Animated audio wave graphic displaying `"Adhan is playing (Muted)"`.
  - Prominent high-contrast **"🔊 Unmute Adhan"** button for immediate one-tap audio listening.
  - Volume slider and pause/stop controls.
- [x] **Dismiss & Next Prayer Countdown**:
  - Easy `"Close"` / `"Dismiss"` button.
  - Seamlessly updates the home page prayer countdown to the next upcoming prayer without page refresh.

### 3. User Customization & Audio Preferences
- [x] **Settings Integration (`/settings`)**:
  - Toggle notifications individually for each prayer (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha).
  - Toggle Adhan audio modal auto-popup on/off.
  - Choice of Adhan audio: Makkah Adhan, Madinah Adhan, Al-Aqsa Adhan, or Traditional Egyptian Adhan.
  - Option to set default audio state: Muted (recommended default) vs. Sound On (if user has granted permission).

---

## Technical Design & Architecture

```
PrayerService (live timings)
       |
       v
PrayerNotificationService (Timer / Worker Scheduler)
       |
       +---> Browser Notification API (Desktop / Mobile push alert)
       |
       +---> AdhanModalComponent (Home Page & App Shell UI)
                |
                +---> HTML5 Audio Element (Muted stream init)
                +---> Animated Wave Visualizer
                +---> "Unmute / Play" & "Dismiss" User Controls
                +---> SettingsService (persists user mute preferences)
```

---

## Acceptance Criteria

- [x] Notifications trigger on the exact minute of each prayer time when permission is granted.
- [x] Desktop notifications display prayer name, city, and time, and bring the app to focus when clicked.
- [x] In-app Adhan modal appears on the home page at prayer time.
- [x] Adhan audio adheres to autoplay policy by starting muted by default with a visible, working "Unmute" button.
- [x] User can dismiss the modal at any time without disrupting background prayer countdowns.
- [x] Settings allow users to disable Adhan popups or customize per-prayer alerts.
- [x] Comprehensive unit tests for prayer notification scheduling and modal audio states.

---

## How to Verify

1. Go to `/settings` and verify prayer notification toggles are active.
2. In developer tools or a test utility, trigger a simulated prayer alert.
3. Verify the native desktop notification appears with proper prayer details.
4. Verify the in-app Adhan modal displays on `/home`.
5. Verify the audio element starts in muted playback; click **"Unmute Adhan"** and confirm audio plays smoothly.
6. Click **"Dismiss"** and confirm the modal closes cleanly.

---

**Previous:** [Phase 13](PHASE-13.md) · **Next:** [Phase 15](PHASE-15.md)

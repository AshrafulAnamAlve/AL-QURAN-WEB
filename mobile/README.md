# 📱 Al-Quran Mobile App (Android & iOS)

This directory contains the cross-platform native mobile app wrapper powered by **Capacitor 7**, bridging our **Angular 21** frontend with native Android and iOS mobile hardware.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v20.x or v22.x
- **Android Studio:** Ladybug / Iguana or higher (includes Android SDK and build tools)
- **Java Development Kit (JDK):** JDK 17 or JDK 21 (configured in `JAVA_HOME`)
- **macOS & Xcode:** (Required only if building for iPhone/iPad)

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Add Native Platforms
To scaffold the Android native project:
```bash
npm run cap:add:android
```

To scaffold the iOS native project (macOS only):
```bash
npm run cap:add:ios
```

### 4. Sync Angular Web Assets to Mobile
Whenever you make updates to the Angular frontend (`frontend/`):
```bash
npm run build:android
```
*(This automatically builds the Angular app with production optimizations and syncs all bundles into the Android and iOS native assets folder).*

### 5. Run & Debug in Android Studio
```bash
npm run cap:open:android
```
This launches Android Studio directly with the ready-to-run project. You can connect your Android phone via USB (with USB Debugging enabled) or run an Android Emulator.

---

## 📦 Project Structure

```
mobile/
├── PLAN_MOBILE_APP.md       # Detailed phase-by-phase implementation plan
├── README.md                # Quick start and developer guide
├── capacitor.config.ts      # Capacitor configuration file
├── package.json             # Mobile scripts and native plugin dependencies
└── android/                 # Generated native Android Studio project (after cap add)
```

---

## 🛠️ Native Features & Hardware Plugins
- **Push Notifications & Adhan:** `@capacitor/local-notifications`
- **Haptic Feedback (Tasbih Tap):** `@capacitor/haptics`
- **Qibla Compass Sensor:** `@capacitor/motion`
- **Offline Preferences:** `@capacitor/preferences`
- **Splash & Status Bar:** `@capacitor/splash-screen`, `@capacitor/status-bar`
- **Deep Linking:** `@capacitor/app`
- **System Share Sheet:** `@capacitor/share`

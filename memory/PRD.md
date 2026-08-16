# FitFlow — Product Requirements Document

## Original Problem Statement
Build "FitFlow", a premium production-ready fitness app matching provided screenshots: dark orange glassmorphism, glowing circular step ring, stat cards, bottom nav, 7 themes. User requested native Kotlin/Android Studio; environment supports **Expo (React Native + TypeScript)** only — user agreed to switch to Expo. Ships to Play Store as AAB via Emergent Publish.

## Architecture
- Expo SDK 54 + Expo Router (file-based nav), TypeScript
- State: React Context (`src/theme`, `src/i18n`, `src/store`) backed by AsyncStorage (fully local, no backend)
- Charts/visuals: `react-native-svg` (ring, bars, line, water fill)
- Sensors: `expo-sensors` Pedometer; `expo-notifications`
- Ads: config-driven stubs (`src/ads/config.ts`, `src/ads/manager.ts`) — real `react-native-google-mobile-ads` wired in dev build

## User Personas
- Everyday users tracking steps/hydration/sleep/workouts with streak motivation, multi-language (EN/GU/PT/HI).

## Core Requirements (static)
- Orange+White default theme; 7 instant themes (Orange/Blue/Red/Green/Purple/Pink/AMOLED)
- Live step ring, clickable stat cards → detail screens, weekly charts, daily goals, reset
- 5-tab nav: Home/Steps/Workout/Habits/Body; every settings item functional; all values persist

## Implemented (2026-06)
### Iteration 1
- Onboarding, permissions, Home (ring + 4 stat cards + weekly chart + daily goals + reset)
- Steps, Workout timer, Habits, Body measurements
- Detail screens: Calories, Distance, Hydration (animated fill), Sleep (manual log)
- Full Settings tree + 7-theme switcher; AsyncStorage persistence — **testing_agent PASS (100%)**

### Iteration 2
- **Multi-language** (English, Gujarati, Portuguese-BR, Hindi): first-launch Language screen + Settings > General > Change Language; instant + persisted (`src/i18n`)
- **Social links** (Instagram/X/Facebook) in Settings > Follow Us via Linking
- **Step goal** [-]/[+] ±100 live editor + presets
- **Home card layout** full-width 2x2
- **Advanced analytics** on Steps: metric switcher (Steps/Distance/Calories/Hydration/Habits), Daily/Weekly/Monthly tabs, tap-to-read, averages, best day, trend %
- **App icon/adaptive/splash/notification** from provided blue running-man logo
- **Rate This App** + **Home Screen Widget** toggle (Settings > App)
- **AdMob**: banner stub + premium Native Ad cards (Home/Steps/Habits) + interstitial frequency manager (3 sessions OR 3 interactions, 90s cooldown, max 2/session)
- **Privacy & Terms** full content — **testing_agent PASS (all 13 items)**

## Platform Limitations (documented to user)
- No native Kotlin/Gradle/Android Studio ZIP or GitHub Actions Android build (Expo project)
- Native home-screen widget + real AdMob + pedometer only activate in a production/dev build, not Expo Go/web preview

## Backlog
- P1: Wire real `react-native-google-mobile-ads` in dev build; implement native Android widget provider
- P2: Notification scheduling for reminders; data export to file; monthly calendar history view
- P2: Localize remaining long-form legal text into GU/PT/HI

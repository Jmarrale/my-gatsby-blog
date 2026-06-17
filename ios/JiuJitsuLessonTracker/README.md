# Jiu-Jitsu Lesson Tracker

A native iOS app for BJJ instructors to track private-lesson clients, log
lessons, manage scheduling and attendance, and record payments — built with
**SwiftUI** and **SwiftData**, with optional **iCloud (CloudKit)** sync.

> Requires a Mac with **Xcode 16+** to build and run. Targets **iOS 17+**.

## What it does

| Tab | Purpose |
| --- | --- |
| **Today** | Dashboard: today's lessons + quick stats (week count, active clients, monthly revenue). |
| **Clients** | Client profiles — name, belt rank & stripes, contact, training-since date, rate, notes. Per-client lesson log, payments, prepaid balance, and outstanding balance. |
| **Schedule** | Upcoming vs. past lessons grouped by day. Swipe to mark a lesson **Done** or delete. Tracks attendance via status (Scheduled / Completed / Cancelled / No-show). |
| **Payments** | Record payments with method and lessons-covered (package tracking). Monthly and all-time revenue totals. |

The app **seeds sample clients, lessons, and payments on first launch** so you
can explore it immediately. Delete them once you start entering real data.

## Getting started

1. On a Mac, open `JiuJitsuLessonTracker.xcodeproj` in Xcode 16 or later.
2. Select an iOS Simulator (e.g. iPhone 15) as the run destination.
3. Press **⌘R**. It builds and runs with on-device local storage — no signing
   or accounts required.

To run on your own iPhone, select the target → **Signing & Capabilities**,
choose your Team, and set a unique **Bundle Identifier**
(e.g. `com.yourname.JiuJitsuLessonTracker`).

## Enabling iCloud sync (optional)

Cloud sync keeps data backed up and in sync across your devices via your Apple
ID. SwiftData mirrors the local store to your private CloudKit database — no
extra networking code.

1. Target → **Signing & Capabilities** → select your Team.
2. **+ Capability → iCloud**, check **CloudKit**, and add a container
   (e.g. `iCloud.com.yourname.JiuJitsuLessonTracker`).
3. **+ Capability → Background Modes**, check **Remote notifications**.
4. Open `Support/AppModelContainer.swift` and set `useCloudKit = true`.
5. Rebuild on a device or a Simulator signed into an Apple ID.

`JiuJitsuLessonTracker.entitlements` is included as a reference, but using the
Signing & Capabilities UI is recommended — it registers the container under
your account automatically.

## Project structure

```
JiuJitsuLessonTracker/
├── JiuJitsuLessonTrackerApp.swift   App entry + model container
├── Models/                          SwiftData models (Client, Lesson, Payment) + enums
├── Support/                         Container setup, sample data, formatters
├── Views/
│   ├── RootTabView.swift            Tab bar
│   ├── Dashboard/                   "Today" overview
│   ├── Clients/                     List, detail, add/edit form
│   ├── Schedule/                    Schedule list, lesson row, add/edit form
│   ├── Payments/                    Payments list, row, add/edit form
│   └── Components/                  Belt badge, avatar, status badge, stat tile
└── Assets.xcassets/                 App icon slot + accent color
```

### Data model

- **Client** → has many **Lesson** and **Payment** (cascade delete).
- **Lesson** carries a `status` that unifies scheduling and attendance.
- **Payment** carries `lessonsCovered` to support prepaid packages, which feeds
  each client's "prepaid left" and outstanding-balance figures.

All model properties have defaults and relationships are optional, satisfying
CloudKit's schema requirements.

## Notes & next ideas

- Add an **app icon** by dropping a 1024×1024 image into `Assets.xcassets/AppIcon`.
- Possible future work: local notifications/reminders before lessons, a
  techniques/skills curriculum checklist per belt, calendar export, and
  charts of revenue and attendance over time.

# Jiu-Jitsu Lesson Tracker — Web Demo

A self-contained web version of the lesson-tracker app, mirroring the SwiftUI
iOS app (Today / Clients / Schedule / Payments). Built with plain HTML, CSS,
and JavaScript — **no build step and no dependencies**.

## How to view it

- **Right now (local):** open `index.html` in any browser.
- **On your live site:** because this folder lives in Gatsby's `static/`
  directory, it's published automatically when the blog builds. After a deploy
  it will be available at `/lesson-tracker/`.

## What it does

- **Today** — dashboard with today's lessons and quick stats (week count,
  active clients, monthly revenue).
- **Clients** — searchable client list; profiles with belt rank/stripes,
  contact, rate, and notes; per-client lesson log, payments, and balances.
- **Schedule** — upcoming vs. past lessons grouped by day; one-tap "mark
  complete" for attendance.
- **Payments** — record payments with method and package size; monthly and
  all-time revenue totals.

## Data & privacy

All data is stored locally in your browser via `localStorage` — nothing is sent
anywhere. The app seeds three sample clients on first load so you can explore
it; edit or delete them and add your own. Clearing your browser data (or using
a different browser/device) starts fresh. This demo is intentionally
device-local; the native iOS app is the path to cross-device iCloud sync.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | All styling |
| `app.js` | Data model, views, and interactions |

# Start Here, Will 👋

Welcome to your studio app. This file is your map. Read it top to bottom, then
open the app and start clicking.

## What this is

**Tatami** — a private-lesson tracker for your students: profiles, progress
(belt history + a skills checklist), lessons/attendance, and payment tracking
(cash / Venmo / Zelle). Web-first, installable on your phone, with a path to a
real iPhone app later.

- **Try the live app:** https://jmarrale.github.io/my-gatsby-blog/studio/
  (running on sample data — reset it anytime in **Settings**).
- **How to use it, in plain English:** [`docs/OWNERS_GUIDE.md`](docs/OWNERS_GUIDE.md)
- **How to take it live (your own login + cloud):** [`docs/HANDOFF_CHECKLIST.md`](docs/HANDOFF_CHECKLIST.md)
- **How the code runs (for later):** [`README.md`](README.md)

## Your roadmap — learn as you go

1. **Play with it.** Open the live app. Add a student, log a lesson, mark it
   completed, record a payment, print a statement. Break things — the reset
   button brings the samples back.
2. **Get two accounts.** A password manager (Bitwarden is free) and a GitHub
   account. Save both logins in the password manager.
3. **Meet Claude Code — your teacher.** Open https://claude.ai/code, connect it
   to this project, and ask it to teach you. First prompt:
   > Explain what this project does and how the `app` folder is organized, like I'm brand new to coding.
4. **Read three short things.** Ask Claude Code to walk you through `README.md`,
   then `docs/OWNERS_GUIDE.md`, then `src/lib/billing.ts` (the money math) with
   its test `src/test/billing.test.ts` beside it.
5. **Make your first tiny change.** Rename the app — ask Claude Code:
   > In `src/brand.ts`, change the name to my studio's name, then show me the app with the change.
6. **Go live for real.** When you're ready for real students, follow
   [`docs/HANDOFF_CHECKLIST.md`](docs/HANDOFF_CHECKLIST.md) — it sets up your
   private login and cloud storage. Ask Claude Code: *"Walk me through the
   handoff checklist one step at a time."*
7. **Put it on your phone.** Live app in Safari → **Share → Add to Home Screen**.
8. **Grow it.** Reminders, your own belt curriculum, income/attendance charts,
   or the App Store version. You'll know enough to steer it.

## Honest notes

- Hosting is free for one user. The cloud database is free but "sleeps" after
  ~a week idle (a ~$25/mo tier removes that — optional).
- An App Store iPhone app needs a Mac + Apple Developer account ($99/yr). The
  home-screen app costs nothing.
- Changing the code takes a developer — or you, leveling up with Claude Code.
  That's the point: start by *using* it, end up *owning* it.

# Owner's Guide

A plain-English guide to running your private-lesson studio in the app. No
technical knowledge needed.

## What the app does

- **Students** — a profile for each private student: belt, contact, rate, notes.
- **Progress** — belt/stripe history and a skills checklist for each student.
- **Schedule** — your lessons, upcoming and past. Marking a lesson "Completed"
  is how attendance is tracked.
- **Payments** — record what each student pays (cash, Venmo, Zelle, or other)
  and see who owes what.
- **Today** — a quick daily overview: today's lessons and this month's revenue.

## Signing in

Open your app's web address in a browser and sign in with your email and
password. To keep it one tap away on your phone:

- **iPhone:** open the site in Safari → tap the **Share** button → **Add to Home
  Screen**. It now behaves like an app.
- **Android:** open in Chrome → menu → **Install app / Add to Home screen**.

## Everyday tasks

**Add a student** — Students tab → **+ Student** → fill in name, belt, and a
default lesson rate → **Add student**.

**Schedule or log a lesson** — Schedule tab (or Today) → **+ Lesson** → pick the
student, date/time, and status. Use **Scheduled** for a future lesson and
**Completed** after it happens. Cancelled and No-show are there when you need them.

**Record a payment** — Payments tab → **+ Payment** → pick the student, amount,
and method. If it's a package (e.g. 10 lessons paid up front), set "Lessons
covered" to 10 so the app can count down prepaid lessons.

**See a student's balance** — open the student → **Billing** tab. "Charged" is
the total for their completed lessons, "Paid" is what they've paid, and
"Balance" is what they still owe (a negative balance means they have credit).

**Track progress** — open the student → **Progress** tab. Add a promotion when
they earn a stripe or belt, and tap a skill to move it between Not started →
Drilling → Proficient.

**Give a student a statement** — open the student → Billing → **View statement**
→ **Print / Save PDF**. Your phone/computer's print dialog can save it as a PDF
to text or email.

## Where your data lives

Your data is stored securely in your **Supabase** account in the cloud, so it's
backed up and available on all your devices when you're signed in. Only you can
see it (protected by your login). Keep your Supabase and host logins in a
password manager.

**Make your own backup anytime:** in Supabase → Table Editor, open a table and
use **Export → CSV**. Do this occasionally (e.g. monthly) so you always hold
your own copy of students, lessons, and payments.

## Good to know (costs & upkeep)

- **Hosting** is free for a single user on the plans set up for you.
- **Supabase free projects pause after about a week of no use.** If the app is
  ever slow to load after sitting idle, that's why — it wakes back up. To avoid
  it entirely, upgrade Supabase to the paid plan (about $25/month) or keep the
  provided "keep-awake" turned on.
- A **custom web address** (yourstudio.com) is optional (~$12/year).
- An **App Store iOS app** is a possible future add-on; it requires a Mac and an
  Apple Developer account ($99/year). The current home-screen install works on
  any phone today at no cost.

## When you need changes

You can run your studio in the app on your own indefinitely — add students, log
lessons, take payments, manage your accounts and passwords. **Changing how the
app works or fixing a bug requires a developer.** If that day comes, hand them
this project (the code repository); everything they need is in it, including the
developer `README.md`.

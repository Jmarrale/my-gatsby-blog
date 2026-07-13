# Handoff Checklist

How to take this project from code to a live app that **Will owns entirely**.
Do this together in one sitting (a screen-share works well). Every account is
created under **Will's** email. Put every password in a password manager as you go.

Estimated time: ~45–60 minutes.

---

## 0. Password manager
Set up a password manager (Bitwarden and 1Password both work). Every login below
goes into it.

## 1. GitHub — the code's home
- Create a GitHub account for Will (or sign in).
- Create a new **empty repository** (e.g. `tatami`).
- Put this project's `app/` contents in it. (Whoever is helping can push the
  code, or upload the folder.) This is a self-contained project — it does not
  need anything else from the original repository.

## 2. Supabase — the database + login
- Create a Supabase account (free) under Will's email → **New project**. Save the
  database password in the password manager.
- Open **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**.
  This creates the tables and the security rules.
- Go to **Project Settings → API** and copy two values:
  - **Project URL**
  - **anon public** key  ← this one is safe to put in the app; the security rules
    (RLS) are what protect the data. Never use the `service_role` key in the app.
- Go to **Authentication → Users → Add user** → enter Will's email + a password →
  confirm the user. This is Will's login for the app.
- (Recommended) **Authentication → Providers → Email** → turn **off** public
  sign-ups so only invited users exist.

## 3. Hosting — puts the app online (Vercel or Netlify, pick one)
- Create an account under Will's email and connect it to Will's GitHub.
- **Import** the `tatami` repository. Framework preset: **Vite**. Build command
  `npm run build`, output directory `dist` (these are usually detected).
- Add **Environment Variables**:
  ```
  VITE_DATA_MODE     = supabase
  VITE_SUPABASE_URL  = (the Project URL from step 2)
  VITE_SUPABASE_ANON_KEY = (the anon public key from step 2)
  ```
- **Deploy.** You'll get a public web address (e.g. `tatami.vercel.app`). Every
  future code change auto-deploys — nobody runs a build by hand.

## 4. Security check — do NOT skip
This proves each account can only see its own data:
1. In Supabase, add a **second** test user (any email + password).
2. Open the app's web address in a private/incognito window and sign in as the
   test user. Confirm you see **no students and no data**.
3. Sign in as Will and confirm his data is there.
4. Delete the test user in Supabase.

## 5. Put it on Will's phone
Open the app's web address in Safari (iPhone) → **Share → Add to Home Screen**
(or Chrome's **Install app** on Android).

## 6. Hand over the guide
Walk Will through `OWNERS_GUIDE.md`. Make sure he can: sign in, add a student,
log and complete a lesson, record a payment, read a balance, and save a
statement as a PDF. Show him how to export a CSV backup from Supabase.

---

## What Will now owns
- GitHub (the code), Supabase (the data + logins), and the host (the live site) —
  all under his email, all in his password manager.

## Ongoing costs (write these down for Will)
- Hosting: free for one user.
- Supabase: free, **but a free project pauses after ~7 days idle** → upgrade to
  Pro (~$25/mo) or keep a keep-alive ping running to avoid it.
- Optional custom domain: ~$12/year.
- Optional future iOS App Store app: Mac + Apple Developer $99/year.

## The honest part
Will can run the whole business in the app and manage his own accounts. **Code
changes and bug fixes need a developer.** Budget for occasional developer help
(a small retainer or on-call arrangement). Everything a developer needs is in
this repository, starting with `README.md`.

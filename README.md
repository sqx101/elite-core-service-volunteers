# Elite Core Cup — Volunteer Sign Up

**Live:** [elite-core-service-volunteers.vercel.app](https://elite-core-service-volunteers.vercel.app)

Volunteer signup app for the **Elite Core Cup Mardi Gras 2026** gymnastics event at Elite Core Gymnastics (999 W Main St, West Dundee, IL). Volunteers can sign up for setup (Thursday, Feb 26) and/or takedown (Sunday, Mar 1), with 15 spots per day.

## Features

- Volunteer signup with live spot counter and progress bars (15 max per day)
- Name validation before submission
- Confirmation page with Google Calendar + iCal download, native maps directions, share link, and email reminder
- Printable QR code flyer (`/?qr`) for sharing the signup link
- Admin dashboard (password-protected) to view and manage signups
- Firebase Realtime Database for persistence
- Deployed to Vercel with auto-deploy on push

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Firebase Realtime Database

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Realtime Database** (start in test mode)
3. Register a **Web app** and copy the config values

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Required variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_CODE=
```

### 4. Run locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Vercel auto-detects Vite — no build config needed
4. Add all `VITE_*` environment variables in the Vercel project settings
5. Deploy — future pushes to `main` auto-deploy

## Admin Access

On the signup page, click **"Admin Access"** at the bottom and enter the admin code (`VITE_ADMIN_CODE`) to view/manage signups.

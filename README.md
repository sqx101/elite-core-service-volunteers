# Elite Core Cup — Volunteer Sign Up

Volunteer signup app for the **Elite Core Cup Mardi Gras 2026** gymnastics event. Volunteers can sign up for setup (Thursday, Feb 26) and/or takedown (Sunday, Mar 1), with 15 spots per day.

## Features

- Volunteer signup with live spot counter (15 max per day)
- Confirmation page with Google Calendar links and map directions
- Admin dashboard (password-protected) to view and manage signups
- Firebase Realtime Database for persistence
- Deployed to Vercel

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
```

### 4. Logo

Place your event logo at `public/logo.jpg`.

### 5. Run locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the `VITE_FIREBASE_*` environment variables in the Vercel project settings
4. Deploy

## Admin Access

On the signup page, click the gear icon at the bottom and enter the admin code to access the dashboard.

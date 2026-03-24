# MedTrack

MedTrack is a web-based child immunization tracking system built with React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, and Firebase.

## Phase 1 foundation

This phase delivers the application setup and UI foundation:

- Vite + React + TypeScript project structure
- Tailwind CSS configured through Vite
- React Router with public and workspace route shells
- Redux Toolkit store with `authSlice`, `uiSlice`, and `appConfigSlice`
- Firebase modular SDK initialization from environment variables
- Reusable base UI components for later phases
- Placeholder pages for auth, dashboards, children, schedule, reminders, and admin

## Available routes

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/dashboard/parent`
- `/dashboard/staff`
- `/dashboard/admin`
- `/children`
- `/immunization-schedule`
- `/reminders`
- `/admin`

## Environment variables

Copy `.env.example` to `.env` and provide your Firebase web app values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Local development

```bash
pnpm install
pnpm dev
```

## Verification

The Phase 1 foundation was verified with:

- `pnpm lint`
- `pnpm build`
- `pnpm dev --host 127.0.0.1 --port 4174`

# MedTrack

MedTrack is a Firebase-ready child immunization tracking frontend built with React, Vite, TypeScript, Tailwind CSS, and Redux Toolkit.

## Current foundation

- Responsive app shell with dedicated parent, staff, and admin views
- Typed domain models for child profiles, immunization records, schedules, and reminders
- Redux Toolkit slices for auth role switching, child selection/search, and reminder filtering
- Immunization schedule generation from a reusable vaccine template
- Firebase modular SDK wiring with environment-variable based configuration
- Mobile-first dashboards for records, schedules, reminders, and reporting

## Tech stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- Redux Toolkit
- Firebase modular SDK

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Create environment variables from the example file:

```bash
cp .env.example .env
```

3. Fill in your Firebase web app values inside `.env`.

4. Start the development server:

```bash
pnpm dev
```

## Firebase configuration

The app reads the following variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

If these values are missing, the interface stays in demo mode and uses local mock data instead of attempting to initialize Firebase.

## Suggested next implementation phases

1. Replace demo auth role switching with Firebase Authentication and Firestore-backed user roles.
2. Persist child registration, immunization updates, and reminder queues in Cloud Firestore.
3. Add validated create/edit forms for child onboarding and vaccine recording.
4. Move reminder sending into Firebase Cloud Functions with email and SMS providers.
5. Add admin reporting exports, audit logs, and protected route guards.

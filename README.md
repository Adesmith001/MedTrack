# MedTrack

MedTrack is a web-based child immunization tracking system built with React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, and Firebase.

## Current foundation

The project now includes:

- Phase 1 app setup with responsive shells and reusable UI components
- Phase 2 Firebase Authentication with role-based access for `parent`, `staff`, and `admin`
- Phase 3 Firestore schema models, typed CRUD services, query helpers, and async Redux slices
- Phase 8 Firebase Cloud Functions email reminder processing with a provider abstraction and staff/admin delivery controls
- Phase 9 Firebase Cloud Functions SMS reminder processing with provider adapters and queue controls

## Firestore collections

Top-level collections in the current schema:

- `users`
- `children`
- `immunizationSchedules`
- `immunizationRecords`
- `reminders`
- `notifications`

The collection metadata and query focus areas live in `src/lib/firestore/structure.ts`.

## Authentication routes

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

## Protected routes

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

## Functions configuration

Cloud Functions live in [`functions/`](/c:/Users/USER/Downloads/Documents/Codes/medtrack/functions).

Copy `functions/.env.example` to `functions/.env` for local emulator work, or configure equivalent runtime variables in Firebase:

- `EMAIL_PROVIDER`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`
- `MEDTRACK_CLINIC_NAME`
- `RESEND_API_KEY`
- `SMS_PROVIDER`
- `MEDTRACK_SMS_SENDER`
- `TERMII_API_KEY`
- `TERMII_SENDER_ID`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Local development

```bash
pnpm install
pnpm dev
pnpm --dir functions install
pnpm functions:build
```

## Verification

Recent verification completed with:

- `pnpm lint`
- `pnpm build`
- `pnpm dev --host 127.0.0.1 --port 4175`

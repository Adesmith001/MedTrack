# MedTrack

MedTrack is a web-based child immunization tracking system built for parent, staff, and admin workflows. It combines a React frontend with Firebase Authentication, Cloud Firestore, Firebase Hosting, and Firebase Cloud Functions to manage registration, schedules, immunization records, reminders, dashboards, and reporting.

## Stack

- Frontend: React, Vite, TypeScript
- Styling: Tailwind CSS
- State management: Redux Toolkit
- Auth: Firebase Authentication
- Database: Cloud Firestore
- Backend jobs: Firebase Cloud Functions
- Hosting: Firebase Hosting
- Testing: Vitest

## Current system scope

The project currently includes:

- role-based authentication for `parent`, `staff`, and `admin`
- child registration, editing, and profile management
- immunization schedule generation and completion tracking
- reminder queue generation
- backend email and SMS reminder delivery through Cloud Functions
- parent, staff, and admin dashboards
- search, filtering, and reporting views
- automated utility and guard tests

## Firebase services used

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Firebase Cloud Functions
- Cloud Scheduler via scheduled Functions triggers

## Project structure

```text
src/                 frontend app
functions/           Firebase Cloud Functions
documentations/      phase-by-phase and run/deploy guides
docs/                QA and testing notes
```

## Local setup

### 1. Install dependencies

```bash
pnpm install
pnpm --dir functions install
```

### 2. Configure frontend environment

Copy `.env.example` to `.env`.

Required frontend variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION`

### 3. Configure backend environment

Copy `functions/.env.example` to `functions/.env` for local Functions work, or configure equivalent values in Firebase for production.

Backend variables cover:

- email provider selection and sender details
- SMS provider selection and sender details
- provider API credentials for Resend, Termii, and Twilio
- clinic name used in reminder templates

### 4. Configure the Firebase project

Copy `.firebaserc.example` to `.firebaserc` and replace the placeholder project id.

## Running locally

Frontend:

```bash
pnpm dev
```

Functions build:

```bash
pnpm functions:build
```

Recommended quality checks:

```bash
pnpm lint
pnpm test
pnpm build
pnpm functions:build
```

## Deployment

This repo now includes Firebase Hosting, Cloud Functions, Firestore rules, and Firestore index deployment config in `firebase.json`.

Build before deploying:

```bash
pnpm build
pnpm functions:build
```

Deploy hosting:

```bash
pnpm deploy:hosting
```

Deploy functions:

```bash
pnpm deploy:functions
```

Deploy Firestore rules and indexes:

```bash
pnpm deploy:firestore
```

Deploy everything:

```bash
pnpm deploy
```

These scripts expect the Firebase CLI to be installed globally:

```bash
npm install -g firebase-tools
```

## Production-readiness notes

- No email or SMS provider secrets are stored in frontend Vite env files.
- Frontend Firebase config is validated at runtime and shows a setup notice if incomplete.
- Firestore and auth service access fail with clear setup messages when Firebase is not configured.
- Functions compile separately from the frontend and are ready for Firebase deployment.
- Firestore security rules live in `firestore.rules`.
- Required composite indexes live in `firestore.indexes.json`.

## Documentation

Phase and setup documentation lives in:

- [`documentations/README.md`](documentations/README.md)
- [`documentations/phases-overview.md`](documentations/phases-overview.md)
- [`documentations/getting-the-system-running.md`](documentations/getting-the-system-running.md)
- [`documentations/deployment-checklist.md`](documentations/deployment-checklist.md)
- [`docs/testing-and-qa.md`](docs/testing-and-qa.md)

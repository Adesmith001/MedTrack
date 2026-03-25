# Getting MedTrack Running

## 1. Prerequisites

- Node.js 20 or newer recommended for the frontend
- pnpm installed globally
- Firebase project created in Firebase Console
- Firebase CLI installed globally with `npm install -g firebase-tools`

## 2. Clone and install

```bash
pnpm install
pnpm --dir functions install
```

## 3. Configure Firebase web app values

Copy `.env.example` to `.env` and set:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION`

These values come from the Firebase web app settings in Firebase Console.

## 4. Configure Functions environment

Copy `functions/.env.example` to `functions/.env` for local emulator work, or configure equivalent values in Firebase for production.

Backend variables include:

- email provider selection and sender details
- SMS provider selection and sender details
- provider API credentials for Resend, Termii, or Twilio
- clinic name used in reminder templates

## 5. Prepare the Firebase project mapping

Copy `.firebaserc.example` to `.firebaserc` and replace the placeholder project id with your actual Firebase project id.

## 6. Firebase services used

MedTrack uses:

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Firebase Cloud Functions
- Cloud Scheduler through scheduled Functions triggers

## 7. Run locally

Frontend:

```bash
pnpm dev
```

Functions build:

```bash
pnpm functions:build
```

Recommended validation before review:

```bash
pnpm lint
pnpm test
pnpm build
pnpm functions:build
```

## 8. What happens if config is missing

- The frontend shows a setup notice if Firebase web config is incomplete.
- Auth and Firestore-backed features stay in setup-safe mode instead of crashing immediately.
- Firestore and auth service calls fail with explicit runtime messages instead of vague null errors.

## 9. Deployment flow

Build first:

```bash
pnpm build
pnpm functions:build
```

Deploy hosting only:

```bash
pnpm deploy:hosting
```

Deploy functions only:

```bash
pnpm deploy:functions
```

Deploy everything:

```bash
pnpm deploy
```

## 10. Recommended reviewer/demo flow

1. Run the automated checks.
2. Confirm `.env` and Functions env values are present.
3. Start the app and verify the setup notice is gone.
4. Validate login, child registration, schedule generation, reminders, and dashboards.
5. Deploy hosting and functions from the configured Firebase project.

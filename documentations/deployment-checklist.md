# Deployment Checklist

## Before deployment

- `pnpm install`
- `pnpm --dir functions install`
- `.env` created from `.env.example`
- `functions/.env` or equivalent production secret configuration completed
- `.firebaserc` created from `.firebaserc.example`
- Firebase Authentication enabled
- Firestore enabled
- Hosting enabled
- Cloud Functions enabled

## Validation commands

```bash
pnpm lint
pnpm test
pnpm build
pnpm functions:build
```

## Deployment order

1. Confirm the correct Firebase project is selected with the Firebase CLI.
2. Build the frontend and functions.
3. Deploy functions.
4. Deploy hosting.
5. Recheck the deployed app with the QA guide.

## After deployment

- verify login and role redirects
- verify child registration and schedule generation
- verify reminder queue generation
- verify manual email and SMS send actions
- verify dashboards and reports load against the production project

## Important reminders

- Never put provider secrets in Vite frontend env files.
- Keep backend credentials only in Functions environment configuration.
- Re-run the QA checklist after any change to reminder delivery providers or Firebase project settings.

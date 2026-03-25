# MedTrack Testing and QA Guide

## Automated checks

Run these from the project root:

```bash
pnpm lint
pnpm test
pnpm build
pnpm functions:build
```

## Manual QA checklist

Validate these flows before a demo or handoff:

1. Register a new `parent`, `staff`, and `admin` account.
2. Log in with each role and confirm the role-specific dashboard loads.
3. Log out and confirm protected routes redirect back to `/login`.
4. Trigger the forgot-password flow and confirm the reset screen handles valid and invalid links clearly.
5. As `staff` or `admin`, register a child and confirm schedule entries are generated immediately.
6. Edit the child profile and confirm the updated fields persist after reload.
7. Open the immunization schedule, mark one vaccine as completed, and confirm the history updates on the child details page.
8. Generate the reminder queue and confirm duplicate reminders are not created for the same schedule trigger window.
9. Trigger manual email reminder sending and confirm reminder status updates to `sent` or `failed`.
10. Trigger manual SMS reminder sending and confirm reminder status updates to `sent` or `failed`.
11. Review the parent, staff, and admin dashboards again and confirm counts and activity blocks reflect the latest data.
12. Sign in as one parent and confirm they cannot open another parent's child record, schedule data, immunization history, or reminder-backed dashboard data.

## Missing setup checks

- If Firebase web config is missing, the app should stay usable in setup-safe mode and show a clear setup notice.
- If a backend request fails, confirm the page shows a readable error state instead of crashing.
- If Functions provider secrets are missing, confirm reminder sends fail with a clear status and stored failure reason.
- If Firestore rules or indexes changed, redeploy Firestore before QA and confirm restricted reads still work for `parent`, `staff`, and `admin`.

## Test focus

Current automated coverage prioritizes:

- schedule generation and status utilities
- reminder queue generation and duplicate prevention
- auth guard decision logic
- critical auth and child-form validation rules
- Firestore ownership constraints for parent-scoped data access
- frontend config validation for Firebase setup

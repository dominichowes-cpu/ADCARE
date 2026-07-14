# Clarity Path

A calm, private workspace for families navigating memory changes together:
track observations, coordinate appointments and medications, keep documents
safe, and follow dementia research translated into plain language with honest
evidence labels.

This repository currently contains the validated data foundation (Phase 1)
and the first working web app slice (Phase 2 start), with a polished
fixture-friendly care workspace UI. The app now defaults to local-first
private storage for user-entered observations: real note text is encrypted
in the user's browser vault instead of being sent to the server. See
BUILD_STATUS.md for the precise state of every feature.

## Run it locally

Prerequisites: Node 20+, pnpm 9 (`npm i -g pnpm`), Docker (or a local
PostgreSQL 16), and `psql` on your PATH.

Fast UI path, using fictional fixtures plus browser-local encrypted storage
for any observation you type:

    pnpm install
    pnpm dev        # http://localhost:3000
    pnpm smoke      # in another terminal

Database-backed schema path:

    # 1. Start Postgres
    docker compose up -d db

    # 2. Configure environment
    export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/claritypath

    # 3. Apply schema, load demo data, verify
    pnpm install
    pnpm db:migrate     # applies db/migrations/*.sql in order
    pnpm db:seed        # fictional [DEMO] Delgado household + research fixtures
    pnpm db:check       # must print: ALL SCHEMA CHECKS PASSED

    # 4. Start the app against Postgres only when explicitly opted in
    CLARITY_STORAGE_MODE=cloud pnpm dev  # http://localhost:3000

Sign in on the local login screen as any member of the demo household
(Maria — owner, Carlos — care coordinator, Jen — contributor). This dev login
is a cookie-based stand-in; the Auth0 integration replaces it without
touching any page code. Verify a running app end-to-end with
`pnpm smoke` (expects the app on :3000, or set BASE).

By default, the web app uses fictional fixture data for the app shell and
stores user-entered observations only in the browser's encrypted IndexedDB
vault. Setting `DATABASE_URL` alone is not enough to put care data in
Postgres; database-backed reads require `CLARITY_STORAGE_MODE=cloud`.
Set `CLARITY_DATA_MODE=fixture` explicitly to force fixture mode.

## Local-first privacy mode

The observation form has no server action. It validates in the browser, then
encrypts the observation with Web Crypto (PBKDF2-derived AES-GCM key) before
writing ciphertext to IndexedDB. The derived key stays in browser memory for
the current session. Settings includes encrypted export/import for backups.

Do not add analytics, error reporting, AI calls, server actions, API routes, or
database writes that include care-recipient information unless the privacy and
compliance posture is deliberately changed and reviewed.

## Repository layout

    db/                 Canonical PostgreSQL schema (migrations, seed, tests)
    apps/web            Next.js App Router application (TypeScript, Tailwind)
    packages/db         Drizzle models introspected from the SQL schema
    scripts/            Migration runner and smoke test
    ARCHITECTURE.md     System map          DECISIONS.md   Numbered rationale
    BUILD_STATUS.md     Source of truth     SECURITY_AND_PRIVACY.md

## Principles

All demo data is fictional. No real patient data, secrets, or production
credentials belong in this repository. Care data and research data never mix
except through user-initiated actions. This product informs and organizes —
it never diagnoses or gives medical advice.


## Local private vault

Observations are encrypted in the browser (PBKDF2 + AES-GCM via Web Crypto)
and stored only in IndexedDB. The passphrase and derived key are never
persisted; cloud care-data access requires `CLARITY_STORAGE_MODE=cloud`.
Settings → Local private vault provides unlock, lock, change passphrase,
encrypted export/import, and delete/reset. Observations can be edited or
deleted from the timeline ("Edit or delete" on each entry).

The same vault now also holds tasks (/tasks), the medication list
(/medications), and per-appointment visit prep (questions, items to bring,
private notes on /appointments). Medication records are record-keeping only —
ADCARE never interprets instructions or advises on medication changes.

### Manual browser QA checklist (local vault)

1. Create: save a first observation, choosing a passphrase → it appears in the timeline.
2. Refresh the page → vault is locked → unlock with the passphrase → entries return.
3. Edit an observation → change text/date → timeline shows the change and an "edited" marker.
4. Delete an observation → confirm in the in-app dialog → it disappears everywhere.
5. Settings → Lock vault now → observations page prompts for unlock again.
6. Settings → Change passphrase → confirm the old passphrase no longer unlocks, the new one does.
7. Export an encrypted backup; Reset the vault (acknowledge the warning); Import the backup →
   unlock with the backup's passphrase → entries restored.
8. Tasks: create (this can also create the vault), edit, complete, reopen, delete → dashboard open-task count follows.
9. Medications: add, edit, mark paused, mark active, mark stopped, delete → dashboard active-med count follows.
10. Appointment prep: add/edit/address/reopen/delete a question, check off an item to bring, save private notes.
11. Export a backup, reset the vault, import it back → tasks, medications, prep, and observations all return.
12. Resize to ~390px: forms, buttons, and confirmations stay usable on every page above.
13. With DevTools Network open through all of the above: no request carries observation, task, medication, or prep text.

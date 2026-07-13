# Clarity Path

A calm, private workspace for families navigating memory changes together:
track observations, coordinate appointments and medications, keep documents
safe, and follow dementia research translated into plain language with honest
evidence labels.

This repository currently contains the validated data foundation (Phase 1)
and the first working web app slice (Phase 2 start), with a polished
fixture-friendly care workspace UI. See BUILD_STATUS.md for the precise
state of every feature.

## Run it locally

Prerequisites: Node 20+, pnpm 9 (`npm i -g pnpm`), Docker (or a local
PostgreSQL 16), and `psql` on your PATH.

Fast UI-only path, using fictional in-memory fixtures:

    pnpm install
    CLARITY_DATA_MODE=fixture pnpm dev   # http://localhost:3000
    CLARITY_DATA_MODE=fixture pnpm smoke # in another terminal

Full database-backed path:

    # 1. Start Postgres
    docker compose up -d db

    # 2. Configure environment
    export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/claritypath

    # 3. Apply schema, load demo data, verify
    pnpm install
    pnpm db:migrate     # applies db/migrations/*.sql in order
    pnpm db:seed        # fictional [DEMO] Delgado household + research fixtures
    pnpm db:check       # must print: ALL SCHEMA CHECKS PASSED

    # 4. Start the app
    pnpm dev            # http://localhost:3000

Sign in on the local login screen as any member of the demo household
(Maria — owner, Carlos — care coordinator, Jen — contributor). This dev login
is a cookie-based stand-in; the Auth0 integration replaces it without
touching any page code. Verify a running app end-to-end with
`pnpm smoke` (expects the app on :3000, or set BASE).

If `DATABASE_URL` is not set, the web app automatically uses the same
fictional fixture data as the fast UI-only path. Set `DATABASE_URL` to use
Postgres, or set `CLARITY_DATA_MODE=fixture` explicitly to force fixture mode.

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

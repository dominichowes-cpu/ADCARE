# BUILD_STATUS — Clarity Path

Updated: 2026-07-11 (session 2)

## Environment note
This session runs in a Claude chat sandbox: filesystem resets between conversations,
no Docker, no long-running services. Scope for this session = **Phase 1 data foundation**
(complete PostgreSQL schema, validated against a live Postgres, plus seed data).
The full application build (Next.js monorepo, workers, connectors, admin app) should be
continued in Claude Code against the ADCARE repo using the master build prompt.

## Done
- [x] Repo inspection: ADCARE is empty (no commits) — initializing per master prompt §4
- [x] db/migrations/0001_init.sql — extensions, 24 enum types, touch_updated_at()
- [x] db/migrations/0002_identity_tenancy.sql — users, auth identities, households,
      memberships, invitations, care_recipients, consents, admin roles
- [x] db/migrations/0003_care.sql — observations (+contexts, revisions, comments),
      medications (+events), health context, appointments (+questions, briefs,
      share links, access log), tasks, decisions, family updates, caregiver
      check-ins, safety checkups, roadmap, communication scripts

## Done (this session, continued)
- [x] 0004_records.sql — documents vault (+ deferred observation FK)
- [x] 0005_research.sql — sources, ingestion, canonical content, subtypes,
      clusters, dedup, evidence, AI pipeline w/ claim traceability, reviews
- [x] 0006_personalization_notifications.sql
- [x] 0007_ops.sql — audit, flags, settings, jobs, support grants, resources,
      educational content, updated_at trigger wiring (DO block)
- [x] VALIDATED on live Postgres 16: 89 tables, 0 errors, clean-room rerun green
- [x] db/seed.sql — [DEMO] Delgado household, 20 research items across all
      evidence levels, 3 trials + locations + change event, grant, FDA update,
      news cluster, follows/saves, notification w/ delivery, 10 feature flags
- [x] db/tests/schema_checks.sql — 10 assertions all passing (seed shape,
      single-owner guard, enum guard, trigger, FTS x2, dup-NCT rejection,
      tenant-cascade isolation + rollback, trial-change join)
- [x] db/erd.mermaid, db/README.md, SECURITY_AND_PRIVACY.md

## Done (session 3 — Phase 2 start: working web app slice)
- [x] pnpm workspace monorepo: apps/web (Next.js 15 App Router, TS, Tailwind v4),
      packages/db (Drizzle models introspected from the live SQL schema)
- [x] Read-only app shell over seeded data: dashboard, care recipient,
      observations timeline, medications, appointments (+questions),
      documents vault, research feed (evidence badges), settings
- [x] Dev auth abstraction: cookie session + demo-user login page; every app
      route guarded (unauthenticated -> /login); Auth0 slots in behind
      lib/session.ts + app/login/actions.ts without page changes
- [x] Self-hosted fonts (Fontsource: Fraunces, Atkinson Hyperlegible) — no
      Google Fonts requests at runtime (privacy win for a health product)
- [x] docker-compose (Postgres 16), .env.example, root scripts
      (db:migrate / db:seed / db:check / typecheck / smoke)
- [x] VERIFIED: production build clean; typecheck clean (web + db packages);
      scripts/smoke.mjs green — auth guard redirect + all 8 pages render
      seeded content end-to-end against live Postgres

## Codex import verification — 2026-07-12
- [x] Imported Phase 2 monorepo into ADCARE and regenerated pnpm-lock.yaml
      under pnpm 11 supply-chain policy.
- [x] Added workspace overrides for postcss and caniuse-lite to avoid
      same-day transitive package releases rejected by minimum-release-age.
- [x] Added pnpm build approvals for native dependencies used by Next.js
      tooling (esbuild, sharp, unrs-resolver).
- [x] Switched Next scripts from Turbopack to stable Next dev/build after
      Turbopack hit a sandbox process/port panic during production build.
- [x] Added fixture data mode for local UI testing without Docker/Postgres:
      if DATABASE_URL is absent, or CLARITY_DATA_MODE=fixture is set, the app
      renders fictional in-memory demo data while preserving the Postgres path.
- [x] VERIFIED locally: pnpm install, pnpm typecheck, pnpm --filter web lint,
      pnpm build, and pnpm smoke against http://127.0.0.1:3000 in fixture mode.

## Not started
- Write paths (create/edit observations, tasks, meds, appointments) — app is
  read-only this slice
- Auth0 production auth, invitations flow, role-based UI differences
- Admin app, source connectors, workers/queues, AI pipeline, notifications,
  clinician briefs/PDF, document upload/storage, Playwright tests, CI

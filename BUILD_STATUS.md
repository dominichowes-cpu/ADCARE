# BUILD_STATUS — Clarity Path

Updated: 2026-07-13 (Codex local-first privacy pass)

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

## Done (session 4 — first write-enabled care workflow, superseded by session 6 local-first storage)
- [x] /observations/new: create-observation form (category, description,
      observed date/time via datetime-local, one-time vs recurring, optional
      functional impact, include-in-clinician-brief)
- [x] Original server-side validation (lib/validation.ts, dependency-free):
      enum-checked
      category, 3–2000 char description, date sanity (no future beyond 5-min
      skew, none before 2000), 1000-char impact cap; per-field error messages
      returned via useActionState without losing calm tone
- [x] Original server write path added, then removed in session 6 when
      observations moved to the encrypted browser-local vault.
- [x] Navigation: "New observation" button on /observations, "Record one" link
      on the dashboard's recent-observations card
- [x] Smoke test extended with /observations/new

## Verified (session 4)
- pnpm typecheck: clean (web + db). pnpm --filter web lint: clean.
  pnpm build: clean.
- Fixture mode: full smoke suite green including the new route.
- Codex import verification at that time covered the then-current fixture and
  DB server write path. That path is no longer active after the session 6
  local-first privacy pass.

## Done (session 5 — visual polish slice)
- [x] Added an app-wide visual language inspired by the GLP-101 reference:
      darker product shell, warmer gold/sage accents, richer surfaces, and
      icon-led navigation/actions without adding new npm dependencies.
- [x] Added local SVG icon components and reusable UI helpers for icon badges,
      button links, stat pills, text links, and a care-map dashboard visual.
- [x] Polished the demo login, dashboard, observations, medications,
      appointments, documents, research, care recipient, and settings screens.
- [x] Applied a tighter GLP-101 screenshot reference pass: dark top frame with
      search/avatar treatment, gold notification accents, crisp yellow line-art
      dashboard visual, and illustration strips in the dashboard care cards.

## Done (session 6 — local-first privacy pass)
- [x] Made browser-local private storage the default launch posture for
      user-entered observations.
- [x] Removed the /observations/new server action and the old lib/data.ts
      Postgres/fixture write path, so observation text no
      longer flows through server actions, audit_events, or cloud DB writes.
- [x] Added an encrypted IndexedDB vault using Web Crypto PBKDF2 + AES-GCM.
      The derived key is held only in browser memory for the current session.
- [x] Rewired /observations, dashboard recent observations, and care-recipient
      observation counts to read from the local vault.
- [x] Added Settings export/import controls for encrypted vault backups.
- [x] Changed database-backed care-data reads to require explicit
      CLARITY_STORAGE_MODE=cloud; DATABASE_URL alone keeps the app in fixture
      shell + local-vault mode.

## Not started
- Remaining write paths (edit/delete observations; tasks, meds, appointments)
- Auth0 production auth, invitations flow, role-based UI differences
- Admin app, source connectors, workers/queues, AI pipeline, notifications,
  clinician briefs/PDF, document upload/storage, Playwright tests, CI

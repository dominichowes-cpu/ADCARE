# BUILD_STATUS — Clarity Path

Updated: 2026-07-14 (Codex session 8 integration verification)

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

## Done (session 7 — local observation CRUD + vault lifecycle)
- [x] Observation edit at /observations/[id]/edit: reuses the existing form and
      validation; prefilled from the vault; preserves id, createdAt, observer,
      and unknown per-record fields; sets updatedAt (timeline shows "edited").
      "Edit or delete" link on each full observation card.
- [x] Observation delete with an accessible in-app two-step confirmation
      (role=alertdialog, keyboard focusable, no browser confirm()).
- [x] Missing-id and locked-vault states handled calmly on the edit screen
      (unlock prompt reused; friendly not-found message with a way back).
- [x] Vault lifecycle controls in Settings: unlock, lock now (clears the
      in-memory key), change passphrase (requires current passphrase, fresh
      random salt, full re-encrypt; wrong current changes nothing), export,
      import with an explicit replace warning + confirmation, and delete/reset
      behind a destructive acknowledgment. aria-live status feedback.
- [x] Vault format made forward-compatible: unknown top-level fields and
      unknown per-record fields survive every mutation; legacy records are
      normalized non-destructively on decrypt; all writes flow through one
      typed mutateVault helper; stronger envelope validation before import
      (never destroys the existing vault on failure). Envelope format is
      unchanged (version 1) so existing vaults and backups still open.
- [x] No server actions, API routes, DB writes, network requests, or new npm
      dependencies were added for any of this. Cloud mode still requires
      CLARITY_STORAGE_MODE=cloud.
- [x] Codex integration hardened imported version-1 vault compatibility by
      preserving the envelope iteration count on mutations, and tightened
      backup validation for KDF metadata, timestamps, salt, IV, and ciphertext.

## Verified (session 7)
- pnpm typecheck: clean. pnpm --filter web lint: clean. pnpm build: clean
  (edit route compiles). Fixture-mode smoke suite green, including the new
  /observations/[id]/edit shell.
- Vault module exercised end-to-end in Node (real WebCrypto, in-memory
  IndexedDB stub, throwaway script — not committed): 25/25 checks passed
  covering create/unlock/lock, edit preserving id/createdAt/observer +
  updatedAt, missing-id handling, delete + re-delete handling, passphrase
  change (old passphrase rejected afterward; wrong current leaves vault
  intact), garbage-import rejection without data loss, reset, and restoring
  an exported backup with its original passphrase.
- Codex real-browser verification on 2026-07-14 covered IndexedDB persistence
  across refresh, create, unlock, edit, manual lock, passphrase rotation,
  old-passphrase rejection, encrypted-export feedback, observation deletion,
  full vault reset, accessible form labels, and the 390px mobile observation
  viewport. Server logs showed no observation POST or server action.
- Backup file selection/import remains on the README manual QA checklist; the
  underlying export/reset/import/restore path passed Claude's 25-check vault
  module exercise above.

## Done (session 8 — local-first care-management slice: tasks, meds, visit prep)
- [x] /tasks: encrypted local task management — create (bootstraps the vault if
      new), edit, complete/reopen, delete w/ accessible confirmation; title,
      optional details, due date, priority, optional assignee; Open and
      Completed sections; locked-vault and empty states; Tasks in main nav.
- [x] Appointment preparation on each upcoming appointment card, encrypted
      locally: questions to ask (add/edit/mark addressed/reopen/delete),
      items to bring (add/check off/remove), private preparation notes —
      all labeled "Local only". Fixture appointment cards now carry an
      explicit "Demo appointment" chip; the old fictional questions block was
      removed in favor of the real local feature. No PDFs/sharing/briefs.
- [x] Medications page replaced with an encrypted local medication list:
      name, free-text strength and instructions, optional purpose/prescriber/
      pharmacy/notes, active|paused|stopped status, createdAt/updatedAt;
      create/edit/mark active/mark paused/mark stopped/delete w/ confirmation; Active and
      Paused-or-stopped sections. Record-keeping only by design: no dosage
      advice, interpretation, interaction checks, adherence, "mark as taken",
      reminders, or alerts anywhere; copy directs changes to the care team.
- [x] Dashboard: open-task count, active-medication count, and the open-task
      list now come from the local vault; fixture next-appointment retains
      demo framing.
- [x] Vault extended with typed tasks / medications / appointmentPrep
      collections through the existing mutateVault path; envelope format,
      PBKDF2 iteration metadata, and version-1 compatibility unchanged;
      vaults saved before this session open with the new collections
      defaulting to empty; unknown fields still preserved end to end;
      shared create-bootstrap extracted (any collection's first save can
      create the vault). New shared UI helpers (local-shared.tsx).
- [x] No server-side care-data writes, no new dependencies, cloud mode still
      gated on CLARITY_STORAGE_MODE=cloud.

## Verified (session 8)
- pnpm typecheck clean; pnpm --filter web lint clean; pnpm build clean.
- Fixture-mode smoke suite green incl. new /tasks route; /medications and
  /tasks needles corrected to server-rendered text (client-only strings had
  made one check falsely pass and one falsely fail).
- Vault harness (Node, real WebCrypto, in-memory IndexedDB stub, throwaway):
  26/26 — task create bootstrapping a fresh vault; task edit/complete/
  reopen/delete; medication create/edit/pause/resume/stop/delete; prep
  question add/edit/address/reopen, items, notes; missing-id handling; and
  a full export → reset → import → unlock round trip restoring all four
  collections with field-level fidelity.
- Codex integration verification tightened task priority sorting, calendar-date
  validation, repeated-form IDs, fixture-only demo labels, medication status
  wording, the four-stat dashboard layout, and first-use appointment prep.
- Codex real-browser verification on 2026-07-14 covered task create/complete,
  medication create/status change, appointment question/addressed state,
  bring-along item and private notes, refresh/lock/unlock, and full vault reset.
  The 390px task view had no horizontal overflow, and server logs showed no
  care-data POST or server action. Disposable QA vault data was removed.

## Not started
- Clinician briefs/PDF export of prep + observations; document uploads
- Auth0 production auth, invitations flow, role-based UI differences
- Admin app, source connectors, workers/queues, AI pipeline, notifications,
  clinician briefs/PDF, document upload/storage, Playwright tests, CI

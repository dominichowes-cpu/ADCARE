# DECISIONS — Clarity Path

1. **Postgres 16 + raw SQL migrations first.** The master prompt allows Prisma or
   Drizzle; the canonical schema is authored in SQL so constraints, partial unique
   indexes, generated tsvector columns, and enum types are explicit. Drizzle can
   introspect this schema when the app scaffold lands (drizzle-kit pull).
2. **UUID PKs via gen_random_uuid()** (core since PG13; no pgcrypto needed).
3. **Enums vs tables.** Stable, code-coupled vocabularies (roles, phases, evidence
   levels, workflow states) are Postgres ENUMs. Admin-editable vocabularies
   (topics, synonyms, checkup questions, roadmap templates, scripts) are rows.
4. **Topics generalized.** topics.kind ∈ {topic, dementia_type, treatment,
   institution, country} with one content_topics join table, instead of five
   parallel tag tables. Synonyms live in topic_synonyms.
5. **Tenant isolation by household_id column on every private table**, enforced
   server-side; DB provides FK + composite indexes. RLS is a later hardening step.
6. **Tokens hashed.** invitations.token_hash / clinician_share_links.token_hash
   store SHA-256 of the raw token; raw values never persist.
7. **Soft delete only where audit requires it** (households, documents). Everything
   else hard-deletes via FK cascade inside the tenant.
8. **content_items is the canonical hub**; subtype tables (research_papers,
   clinical_trials, …) hold type-specific fields, 1:1 on content_item_id.
   Hard identifiers (doi/pmid/pmcid/nct/project number) get partial unique indexes.
9. **AI summaries are versioned rows** (generated_summaries + generated_claims)
   with prompt_versions FK, never overwriting; claim traceability links each claim
   to a source_record and excerpt.
10. **Care data and research data share a database but never a table.** No FK path
    from research content into observation/medication/document tables except via
    user-initiated saves (saved_content, appointment_questions).

11. **Drizzle introspected from SQL, not the reverse.** drizzle-kit pull generated
    packages/db models from the live schema; citext maps to text and tsvector
    columns are omitted from TS models (the DB maintains them; search will use
    raw SQL).
12. **Fonts self-hosted via Fontsource** (Fraunces display, Atkinson
    Hyperlegible body — chosen for low-vision readability). No Google Fonts
    requests from a health product.
13. **Dev login is the first half of the auth abstraction**: cookie session in
    lib/session.ts + server actions. Auth0 replaces internals only; pages call
    requireSession() and never know the provider.
14. **This slice is deliberately read-only.** Rendering real tenant-scoped data
    end-to-end proves schema + access layer + shell; write paths are the next
    vertical slice and arrive with validation + audit_events writes.

# Clarity Path — Database

PostgreSQL 16 schema for the Clarity Path family dementia-navigation app.
89 tables across seven migrations, validated end-to-end (migrations → seed →
assertion suite) on a live Postgres instance.

## Layout
Apply migrations in filename order, then optionally seed, then run checks:

    createdb claritypath
    psql -d claritypath -v ON_ERROR_STOP=1 -f migrations/0001_init.sql
    ... (0002 → 0007 in order) ...
    psql -d claritypath -v ON_ERROR_STOP=1 -f seed.sql
    psql -d claritypath -v ON_ERROR_STOP=1 -f tests/schema_checks.sql

`migrations/0001` holds extensions (pg_trgm, citext), all 24 enum types, and the
shared `touch_updated_at()` trigger function. `0002` is identity and tenancy,
`0003` the family-care features, `0004` the records vault, `0005` the research
platform, `0006` personalization and notifications, `0007` operational tables
plus a DO block that attaches the updated_at trigger to every table that has the
column. `seed.sql` creates a fully fictional demo household (the Delgados) and
20 published research fixtures spanning every evidence level, three recruiting
trials with locations and a tracked change, a grant, a regulatory update, and a
news mention clustered with its source paper. `tests/schema_checks.sql` asserts
seed shape, the single-active-owner guard, enum enforcement, trigger behavior,
full-text search on observations and content, duplicate-NCT rejection, and
tenant-cascade isolation.

## Design decisions
The canonical schema is raw SQL rather than ORM-generated so that partial unique
indexes (one active owner per household; DOI/PMID/NCT uniqueness where present),
generated tsvector columns, and enum types are explicit; Drizzle or Prisma can
introspect it when the app scaffold lands. Stable vocabularies are Postgres
enums; admin-editable vocabularies (topics, synonyms, roadmap templates, safety
questions, coach scripts) are rows. Topics are generalized with a `kind` column
(topic, dementia_type, treatment, institution, country) behind a single
content_topics join, replacing five parallel tag tables. content_items is the
canonical research hub with 1:1 subtype tables; evidence labels are denormalized
onto it for feed queries while evidence_assessments keeps full history. AI
output is never overwritten: generated_summaries are versioned rows tied to
prompt_versions, and generated_claims link each claim to a source record,
field, and excerpt for reviewer inspection. Tokens are stored hashed. Soft
deletion exists only where audit requires it (households, documents).

See ../DECISIONS.md for the numbered rationale and ../SECURITY_AND_PRIVACY.md
for the privacy posture and known gaps.

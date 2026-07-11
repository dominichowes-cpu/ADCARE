-- Clarity Path — 0007_ops.sql
-- Audit log (§31.10), feature flags (§46), system settings, job failures (§4),
-- exceptional support access (§31.9), resource directory (§19),
-- educational content CMS (§31.8). Finishes with updated_at triggers.

BEGIN;

CREATE TABLE audit_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_type       text NOT NULL DEFAULT 'user',   -- user|admin|system|share_link
  household_id     uuid REFERENCES households(id) ON DELETE SET NULL,
  event_type       text NOT NULL,            -- auth.login|member.role_changed|content.published|...
  entity_type      text,
  entity_id        uuid,
  metadata         jsonb,
  ip_address       inet,
  occurred_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_household ON audit_events(household_id, occurred_at DESC);
CREATE INDEX idx_audit_type ON audit_events(event_type, occurred_at DESC);
CREATE INDEX idx_audit_actor ON audit_events(actor_user_id, occurred_at DESC);

CREATE TABLE feature_flags (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key         text NOT NULL UNIQUE,     -- ai_summaries|document_ai|trial_matching|gdelt|...
  description      text NOT NULL,
  default_enabled  boolean NOT NULL DEFAULT false,
  overrides        jsonb NOT NULL DEFAULT '{}',   -- {household_id|user_id: bool}
  updated_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE system_settings (
  key              text PRIMARY KEY,
  value            jsonb NOT NULL,
  updated_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_failures (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name       text NOT NULL,
  job_id           text NOT NULL,
  job_name         text,
  payload          jsonb,
  error_message    text,
  error_stack      text,                     -- visible to technical roles only (§45)
  attempts         integer NOT NULL DEFAULT 0,
  failed_at        timestamptz NOT NULL DEFAULT now(),
  retried_at       timestamptz,
  resolved         boolean NOT NULL DEFAULT false
);
CREATE INDEX idx_job_failures_open ON job_failures(queue_name, failed_at DESC) WHERE NOT resolved;

-- Time-limited, audited support access to a household (§31.9).
CREATE TABLE support_access_grants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  reason           text NOT NULL,
  granted_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at       timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz NOT NULL,
  revoked_at       timestamptz,
  CHECK (expires_at > granted_at)
);
CREATE INDEX idx_support_grants_active ON support_access_grants(household_id) WHERE revoked_at IS NULL;

-- Resource directory (§19); listing ≠ endorsement (UI copy).
CREATE TABLE resource_directory_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type    text NOT NULL,            -- memory_clinic|geriatrician|support_group|respite|...
  name             text NOT NULL,
  description      text,
  street_address   text,
  city             text,
  state            text,
  postal_code      text,
  country          text NOT NULL DEFAULT 'US',
  service_area     text,
  latitude         double precision,
  longitude        double precision,
  phone            text,
  website          text,
  eligibility_notes text,
  cost_notes       text,
  source           text,
  verification_status text NOT NULL DEFAULT 'unverified',  -- unverified|verified|stale
  last_verified_on date,
  admin_notes      text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  search_tsv       tsvector GENERATED ALWAYS AS (to_tsvector('english',
      name || ' ' || coalesce(description,'') || ' ' || coalesce(service_area,''))) STORED
);
CREATE INDEX idx_resources_type ON resource_directory_entries(resource_type) WHERE is_active;
CREATE INDEX idx_resources_geo ON resource_directory_entries(state, city) WHERE is_active;
CREATE INDEX idx_resources_search ON resource_directory_entries USING gin(search_tsv);
CREATE INDEX idx_resources_name_trgm ON resource_directory_entries USING gin(name gin_trgm_ops);

-- Educational pages, disclaimers, emergency guidance (admin CMS §31.8).
CREATE TABLE educational_content (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  title            text NOT NULL,
  body_markdown    text NOT NULL,
  category         text NOT NULL,            -- education|disclaimer|emergency|coach_situation
  status           text NOT NULL DEFAULT 'draft',   -- draft|published|archived
  published_at     timestamptz,
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_edu_status ON educational_content(category, status);

-- ---------------------------------------------------------------------------
-- Apply touch_updated_at() to every table with an updated_at column.
-- ---------------------------------------------------------------------------

DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables tb
      ON tb.table_name = c.table_name AND tb.table_schema = 'public'
    WHERE c.table_schema = 'public'
      AND c.column_name = 'updated_at'
      AND tb.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_touch BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',
      t.table_name, t.table_name);
  END LOOP;
END $$;

COMMIT;

-- Clarity Path — 0002_identity_tenancy.sql
-- Users, external auth mapping, households (tenants), memberships,
-- invitations, care recipients, consents, admin roles.

BEGIN;

CREATE TABLE users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            citext NOT NULL UNIQUE,
  display_name     text NOT NULL,
  pronouns         text,
  timezone         text NOT NULL DEFAULT 'America/Chicago',
  quiet_hours      jsonb,                    -- {"start":"21:00","end":"08:00"} local time
  is_active        boolean NOT NULL DEFAULT true,
  last_seen_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Auth provider abstraction (Auth0 in prod, dev-login locally).
-- No password columns by design.
CREATE TABLE external_auth_identities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         text NOT NULL,            -- 'auth0' | 'dev'
  provider_subject text NOT NULL,            -- provider's stable user id
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject)
);
CREATE INDEX idx_ext_auth_user ON external_auth_identities(user_id);

-- The tenant. One household = one care circle.
CREATE TABLE households (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  navigation_phase navigation_phase NOT NULL DEFAULT 'not_sure',
  priorities       text[] NOT NULL DEFAULT '{}',  -- onboarding step 4 selections
  onboarding_state jsonb,                         -- resumable onboarding progress
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at       timestamptz,                   -- soft delete: export-then-delete flow
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE household_memberships (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             household_role NOT NULL,
  relationship     text,                     -- 'daughter', 'spouse', 'friend', ...
  can_invite       boolean NOT NULL DEFAULT false,
  is_active        boolean NOT NULL DEFAULT true,
  joined_at        timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);
CREATE INDEX idx_membership_user ON household_memberships(user_id);
-- Exactly one active owner is enforced at the service layer; this guards >0 duplicates cheaply:
CREATE UNIQUE INDEX uq_household_single_owner
  ON household_memberships(household_id) WHERE role = 'owner' AND is_active;

CREATE TABLE invitations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  email            citext NOT NULL,
  role             household_role NOT NULL,
  invited_by       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash       text NOT NULL UNIQUE,     -- store hash, never the raw token
  status           invitation_status NOT NULL DEFAULT 'pending',
  message          text,
  expires_at       timestamptz NOT NULL,
  accepted_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  accepted_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_household ON invitations(household_id, status);
CREATE INDEX idx_invitations_email ON invitations(email) WHERE status = 'pending';

-- Minimal-by-design profile of the person receiving care.
CREATE TABLE care_recipients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  preferred_name   text NOT NULL,
  birth_year       smallint CHECK (birth_year BETWEEN 1900 AND 2100),
  general_location text,                     -- city/region or ZIP; used for trial radius only
  postal_code      text,
  pronouns         text,
  user_id          uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL, -- if invited to the app
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_care_recipients_household ON care_recipients(household_id);

-- Explicit, revocable consents (AI document processing, trial matching, ...).
CREATE TABLE consents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid REFERENCES households(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES users(id) ON DELETE CASCADE,
  consent_type     text NOT NULL,            -- 'ai_document_summary' | 'trial_matching' | ...
  granted          boolean NOT NULL,
  granted_at       timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz,
  details          jsonb,
  CHECK (household_id IS NOT NULL OR user_id IS NOT NULL)
);
CREATE INDEX idx_consents_household ON consents(household_id, consent_type);
CREATE INDEX idx_consents_user ON consents(user_id, consent_type);

-- Administrative (staff) roles — entirely separate from household roles.
CREATE TABLE admin_roles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key              admin_role_key NOT NULL UNIQUE,
  description      text NOT NULL
);

CREATE TABLE admin_role_assignments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_role_id    uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  granted_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at       timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz,
  UNIQUE (user_id, admin_role_id)
);

COMMIT;

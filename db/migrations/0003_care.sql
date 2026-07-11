-- Clarity Path — 0003_care.sql
-- Family-care features: observations & timeline, medications & health context,
-- appointments & clinician briefs, tasks, decisions, caregiver check-ins,
-- safety checkups, care roadmap, family updates.
-- Every table carries household_id for tenant isolation and indexing.

BEGIN;

-- ---------------------------------------------------------------------------
-- Observations (structured timeline) — a central product feature
-- ---------------------------------------------------------------------------

CREATE TABLE observations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid NOT NULL REFERENCES care_recipients(id) ON DELETE CASCADE,
  category           observation_category NOT NULL,
  description        text NOT NULL,          -- short factual description
  observed_at        timestamptz NOT NULL,
  time_approximate   boolean NOT NULL DEFAULT false,
  observer_membership_id uuid REFERENCES household_memberships(id) ON DELETE SET NULL,
  location_context   text,
  duration_minutes   integer CHECK (duration_minutes > 0),
  is_recurring       boolean NOT NULL DEFAULT false, -- one-time vs repeated pattern
  functional_impact  text,
  visibility         visibility_level NOT NULL DEFAULT 'household',
  include_in_brief   boolean NOT NULL DEFAULT false,
  attachment_document_id uuid,               -- FK added in 0004 after documents exists
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  search_tsv         tsvector GENERATED ALWAYS AS (to_tsvector('english', description)) STORED
);
CREATE INDEX idx_observations_household_time ON observations(household_id, observed_at DESC);
CREATE INDEX idx_observations_category ON observations(household_id, category);
CREATE INDEX idx_observations_search ON observations USING gin(search_tsv);

-- Contextual factors attached to an observation (poor sleep, travel, ...)
CREATE TABLE observation_contexts (
  observation_id   uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  factor           context_factor NOT NULL,
  note             text,
  PRIMARY KEY (observation_id, factor)
);

-- Edit history: full prior snapshot per edit.
CREATE TABLE observation_revisions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id   uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  snapshot         jsonb NOT NULL,
  edited_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  edited_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_observation_revisions ON observation_revisions(observation_id, edited_at DESC);

CREATE TABLE observation_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id   uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_observation_comments ON observation_comments(observation_id, created_at);

-- ---------------------------------------------------------------------------
-- Medications & health context (organizational, never prescriptive)
-- ---------------------------------------------------------------------------

CREATE TABLE medications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid NOT NULL REFERENCES care_recipients(id) ON DELETE CASCADE,
  name               text NOT NULL,          -- as entered by the family
  generic_name       text,
  dosage_text        text,                   -- verbatim; never parsed into advice
  frequency_text     text,
  prescriber         text,
  reason             text,
  started_on         date,
  ended_on           date,
  is_active          boolean NOT NULL DEFAULT true,
  info_source        text,                   -- 'pharmacy printout', 'family recollection', ...
  last_confirmed_on  date,
  notes              text,
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on)
);
CREATE INDEX idx_medications_household ON medications(household_id, is_active);

CREATE TABLE medication_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  medication_id    uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  event_type       medication_event_type NOT NULL,
  occurred_at      timestamptz NOT NULL,
  note             text,
  recorded_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_medication_events ON medication_events(household_id, occurred_at DESC);

-- Optional health-context events shown on the timeline as temporal context.
CREATE TABLE health_context_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid NOT NULL REFERENCES care_recipients(id) ON DELETE CASCADE,
  context_type       health_context_type NOT NULL,
  occurred_on        date NOT NULL,
  value              jsonb,                  -- e.g. {"sleep_quality": 2} or {"cpap_used": false}
  note               text,
  recorded_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_health_context ON health_context_events(household_id, occurred_on DESC);

-- ---------------------------------------------------------------------------
-- Appointments & clinician briefs
-- ---------------------------------------------------------------------------

CREATE TABLE appointments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid NOT NULL REFERENCES care_recipients(id) ON DELETE CASCADE,
  starts_at          timestamptz NOT NULL,
  clinician_name     text,
  specialty          text,
  location           text,
  purpose            text,
  attendee_membership_id uuid REFERENCES household_memberships(id) ON DELETE SET NULL,
  notes              text,
  next_appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_household ON appointments(household_id, starts_at);

CREATE TABLE appointment_questions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  question         text NOT NULL,
  position         integer NOT NULL DEFAULT 0,
  added_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  answer_note      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointment_questions ON appointment_questions(appointment_id, position);

-- Observations selected for a given appointment's preparation/brief.
CREATE TABLE appointment_observations (
  appointment_id   uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  observation_id   uuid NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, observation_id)
);

CREATE TABLE clinician_briefs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  appointment_id   uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  date_range_start date NOT NULL,
  date_range_end   date NOT NULL,
  content_snapshot jsonb NOT NULL,           -- frozen data used to render the PDF
  pdf_storage_key  text,                     -- tenant-scoped object key
  generated_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (date_range_end >= date_range_start)
);
CREATE INDEX idx_briefs_household ON clinician_briefs(household_id, created_at DESC);

-- Expiring, revocable, read-only share links. Never expose the whole workspace.
CREATE TABLE clinician_share_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  brief_id         uuid NOT NULL REFERENCES clinician_briefs(id) ON DELETE CASCADE,
  token_hash       text NOT NULL UNIQUE,
  label            text,                     -- 'Dr. Osei — neurology'
  expires_at       timestamptz NOT NULL,
  revoked_at       timestamptz,
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_share_links_brief ON clinician_share_links(brief_id);

CREATE TABLE share_link_access_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id    uuid NOT NULL REFERENCES clinician_share_links(id) ON DELETE CASCADE,
  accessed_at      timestamptz NOT NULL DEFAULT now(),
  ip_address       inet,
  user_agent       text
);
CREATE INDEX idx_share_link_access ON share_link_access_events(share_link_id, accessed_at DESC);

-- ---------------------------------------------------------------------------
-- Tasks, decisions, family updates
-- ---------------------------------------------------------------------------

CREATE TABLE tasks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid REFERENCES care_recipients(id) ON DELETE SET NULL,
  title              text NOT NULL,
  description        text,
  category           roadmap_category,
  assignee_membership_id uuid REFERENCES household_memberships(id) ON DELETE SET NULL,
  due_on             date,
  recurrence_rule    text,                   -- RFC 5545 RRULE string, nullable
  priority           priority_level NOT NULL DEFAULT 'medium',
  status             task_status NOT NULL DEFAULT 'open',
  appointment_id     uuid REFERENCES appointments(id) ON DELETE SET NULL,
  roadmap_item_id    uuid,                   -- FK added below after roadmap_items exists
  completed_at       timestamptz,
  completed_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  search_tsv         tsvector GENERATED ALWAYS AS
    (to_tsvector('english', title || ' ' || coalesce(description, ''))) STORED
);
CREATE INDEX idx_tasks_household_status ON tasks(household_id, status, due_on);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_membership_id) WHERE status IN ('open','in_progress');
CREATE INDEX idx_tasks_search ON tasks USING gin(search_tsv);

CREATE TABLE task_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_comments ON task_comments(task_id, created_at);

-- Structured decision log ("local daytime driving continues pending assessment").
CREATE TABLE decisions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  decided_on            date NOT NULL,
  background            text,
  agreed_plan           text NOT NULL,
  reconsider_conditions text,
  follow_up_on          date,
  created_by            uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  search_tsv            tsvector GENERATED ALWAYS AS
    (to_tsvector('english', title || ' ' || agreed_plan || ' ' || coalesce(background,''))) STORED
);
CREATE INDEX idx_decisions_household ON decisions(household_id, decided_on DESC);
CREATE INDEX idx_decisions_search ON decisions USING gin(search_tsv);

CREATE TABLE decision_participants (
  decision_id      uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  membership_id    uuid NOT NULL REFERENCES household_memberships(id) ON DELETE CASCADE,
  PRIMARY KEY (decision_id, membership_id)
);

CREATE TABLE decision_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id      uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Lightweight update feed (deliberately not a chat app).
CREATE TABLE family_updates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  update_type      family_update_type NOT NULL,
  title            text,
  body             text NOT NULL,
  appointment_id   uuid REFERENCES appointments(id) ON DELETE SET NULL,
  task_id          uuid REFERENCES tasks(id) ON DELETE SET NULL,
  decision_id      uuid REFERENCES decisions(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_updates ON family_updates(household_id, created_at DESC);

CREATE TABLE family_update_comments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_update_id uuid NOT NULL REFERENCES family_updates(id) ON DELETE CASCADE,
  author_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_update_comments ON family_update_comments(family_update_id, created_at);

-- ---------------------------------------------------------------------------
-- Caregiver wellbeing check-ins
-- ---------------------------------------------------------------------------

CREATE TABLE caregiver_checkins (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caregiving_hours_week numeric(5,1) CHECK (caregiving_hours_week >= 0),
  sleep_disruption      smallint CHECK (sleep_disruption BETWEEN 0 AND 4),
  work_interference     smallint CHECK (work_interference BETWEEN 0 AND 4),
  stress_level          smallint CHECK (stress_level BETWEEN 0 AND 4),
  family_conflict       smallint CHECK (family_conflict BETWEEN 0 AND 4),
  has_backup_help       boolean,
  days_since_break      integer CHECK (days_since_break >= 0),
  feeling_overwhelmed   smallint CHECK (feeling_overwhelmed BETWEEN 0 AND 4),
  immediate_safety_concern boolean NOT NULL DEFAULT false,
  free_text             text,
  generated_summary     text,                -- compassionate, non-clinical
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_caregiver_checkins ON caregiver_checkins(household_id, user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Safety checkups (admin-editable templates; versioned questions)
-- ---------------------------------------------------------------------------

CREATE TABLE safety_checkup_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key              text NOT NULL,            -- 'driving', 'wandering', 'firearms', ...
  version          integer NOT NULL DEFAULT 1,
  title            text NOT NULL,
  intro_text       text,
  questions        jsonb NOT NULL,           -- ordered observable questions with response types
  guidance         jsonb,                    -- cautious follow-up language per pattern
  is_active        boolean NOT NULL DEFAULT true,
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, version)
);

CREATE TABLE safety_assessments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid NOT NULL REFERENCES care_recipients(id) ON DELETE CASCADE,
  template_id        uuid NOT NULL REFERENCES safety_checkup_templates(id) ON DELETE RESTRICT,
  started_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  completed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_safety_assessments ON safety_assessments(household_id, created_at DESC);

CREATE TABLE safety_responses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id    uuid NOT NULL REFERENCES safety_assessments(id) ON DELETE CASCADE,
  question_key     text NOT NULL,
  response         jsonb NOT NULL,
  note             text,
  UNIQUE (assessment_id, question_key)
);

-- ---------------------------------------------------------------------------
-- Care roadmap (admin-managed templates + per-household items)
-- ---------------------------------------------------------------------------

CREATE TABLE roadmap_templates (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  explanation        text NOT NULL,          -- "why this is suggested"
  category           roadmap_category NOT NULL,
  applicable_phases  navigation_phase[] NOT NULL,
  default_priority   priority_level NOT NULL DEFAULT 'medium',
  suggested_timing   text,
  educational_slug   text,                   -- links to educational_content
  requires_record_type document_record_type,
  is_active          boolean NOT NULL DEFAULT true,
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  template_id        uuid REFERENCES roadmap_templates(id) ON DELETE SET NULL,
  title              text NOT NULL,
  explanation        text NOT NULL,
  phase              navigation_phase NOT NULL,
  category           roadmap_category NOT NULL,
  priority           priority_level NOT NULL DEFAULT 'medium',
  status             roadmap_status NOT NULL DEFAULT 'suggested',
  suggested_timing   text,
  assignee_membership_id uuid REFERENCES household_memberships(id) ON DELETE SET NULL,
  completed_at       timestamptz,
  deferred_until     date,
  dismissed_reason   text,
  dismissed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_roadmap_items ON roadmap_items(household_id, status, priority);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_roadmap_item
  FOREIGN KEY (roadmap_item_id) REFERENCES roadmap_items(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Communication coach scripts (admin-managed, user-saveable)
-- ---------------------------------------------------------------------------

CREATE TABLE communication_scripts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_key    text NOT NULL,            -- 'suggesting_evaluation', 'discussing_driving', ...
  title            text NOT NULL,
  body             text NOT NULL,
  guidance         text,
  is_active        boolean NOT NULL DEFAULT true,
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_comm_scripts_situation ON communication_scripts(situation_key) WHERE is_active;

CREATE TABLE saved_scripts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id        uuid NOT NULL REFERENCES communication_scripts(id) ON DELETE CASCADE,
  personalized_body text,                    -- names/relationship terms substituted
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, script_id)
);

COMMIT;

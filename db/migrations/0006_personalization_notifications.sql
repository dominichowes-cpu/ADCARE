-- Clarity Path — 0006_personalization_notifications.sql
-- Feed personalization signals (§28), trial/treatment following (§29),
-- notifications and digests (§30, §34).

BEGIN;

-- ---------------------------------------------------------------------------
-- Personalization
-- ---------------------------------------------------------------------------

CREATE TABLE user_topic_preferences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id         uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  preference       text NOT NULL DEFAULT 'follow',   -- follow|mute
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);
CREATE INDEX idx_topic_prefs_user ON user_topic_preferences(user_id);

-- Household-level feed settings (trial radius, preliminary research toggle, ...).
CREATE TABLE household_feed_preferences (
  household_id     uuid PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  trial_radius_km  integer CHECK (trial_radius_km > 0),
  trial_center_postal_code text,             -- general location only (§27 privacy)
  include_preliminary boolean NOT NULL DEFAULT true,
  include_animal_studies boolean NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE followed_trials (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id  uuid NOT NULL REFERENCES clinical_trials(content_item_id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_item_id)
);
CREATE INDEX idx_followed_trials_item ON followed_trials(content_item_id);

-- Treatments are topics with kind='treatment'; service layer enforces the kind.
CREATE TABLE followed_treatments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id         uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

CREATE TABLE saved_content (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  note             text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_item_id)
);

CREATE TABLE hidden_content (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  reason           text,                     -- optional dismissal reason
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_item_id)
);

-- Impressions power "why you're seeing this" transparency + dedupe in ranking.
CREATE TABLE feed_impressions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  feed_tab         text NOT NULL,            -- for_you|major|research|trials|official|news|saved
  relevance_score  numeric(8,4),
  relevance_reasons jsonb,                   -- [{signal:'followed_topic', topic:'...'}]
  shown_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_impressions_user ON feed_impressions(user_id, shown_at DESC);
CREATE INDEX idx_impressions_item ON feed_impressions(content_item_id);

-- ---------------------------------------------------------------------------
-- Notifications (§34)
-- ---------------------------------------------------------------------------

CREATE TABLE notification_preferences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id     uuid REFERENCES households(id) ON DELETE CASCADE,  -- null = global default
  category         text NOT NULL,            -- task_assigned|appointment_upcoming|trial_change|digest|...
  channel          notification_channel NOT NULL,
  enabled          boolean NOT NULL DEFAULT true,
  as_digest        boolean NOT NULL DEFAULT false,  -- immediate vs digest
  UNIQUE (user_id, household_id, category, channel)
);

CREATE TABLE notifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id     uuid REFERENCES households(id) ON DELETE CASCADE,
  category         text NOT NULL,
  title            text NOT NULL,            -- must never contain sensitive observation text (§34)
  body             text,
  content_item_id  uuid REFERENCES content_items(id) ON DELETE SET NULL,
  task_id          uuid REFERENCES tasks(id) ON DELETE SET NULL,
  appointment_id   uuid REFERENCES appointments(id) ON DELETE SET NULL,
  read_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

CREATE TABLE notification_deliveries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id  uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel          notification_channel NOT NULL,
  status           delivery_status NOT NULL DEFAULT 'queued',
  provider_message_id text,
  attempted_at     timestamptz,
  delivered_at     timestamptz,
  error_detail     text
);
CREATE INDEX idx_deliveries_status ON notification_deliveries(status) WHERE status IN ('queued','failed');

CREATE TABLE digest_runs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start     date NOT NULL,
  period_end       date NOT NULL,
  item_count       integer NOT NULL DEFAULT 0,
  sections         jsonb,                    -- §30 digest sections with source links
  status           delivery_status NOT NULL DEFAULT 'queued',
  sent_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);
CREATE INDEX idx_digest_runs_user ON digest_runs(user_id, period_end DESC);

COMMIT;

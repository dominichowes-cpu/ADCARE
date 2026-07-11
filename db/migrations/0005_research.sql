-- Clarity Path — 0005_research.sql
-- Research platform: source connectors & ingestion, canonical content model,
-- subtype tables, topics taxonomy, story clusters, deduplication, evidence
-- classification, AI summary pipeline with claim traceability, review workflow.

BEGIN;

-- ---------------------------------------------------------------------------
-- Taxonomy (admin-editable)
-- ---------------------------------------------------------------------------

CREATE TABLE topics (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind             topic_kind NOT NULL DEFAULT 'topic',
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_topics_kind ON topics(kind) WHERE is_active;
CREATE INDEX idx_topics_name_trgm ON topics USING gin(name gin_trgm_ops);

CREATE TABLE topic_synonyms (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id         uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  synonym          text NOT NULL,
  UNIQUE (topic_id, synonym)
);

-- ---------------------------------------------------------------------------
-- Source connectors, queries, ingestion
-- ---------------------------------------------------------------------------

CREATE TABLE source_connectors (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key       text NOT NULL UNIQUE,     -- 'pubmed' | 'europepmc' | 'openalex' |
                                             -- 'clinicaltrials' | 'nih_reporter' |
                                             -- 'openfda' | 'gdelt'
  display_name     text NOT NULL,
  enabled          boolean NOT NULL DEFAULT true,
  schedule_cron    text NOT NULL,            -- configurable per §23
  throttle_config  jsonb NOT NULL DEFAULT '{}',
  connector_version text NOT NULL DEFAULT '1.0.0',
  last_health_check_at timestamptz,
  last_health_status   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE source_queries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_connector_id uuid NOT NULL REFERENCES source_connectors(id) ON DELETE CASCADE,
  topic_id         uuid REFERENCES topics(id) ON DELETE SET NULL,
  name             text NOT NULL,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Query text is versioned so any ingested item's provenance is reconstructable (§22).
CREATE TABLE source_query_versions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_query_id  uuid NOT NULL REFERENCES source_queries(id) ON DELETE CASCADE,
  version_number   integer NOT NULL,
  query_body       jsonb NOT NULL,           -- source-specific query/params
  published_at     timestamptz,              -- null = draft
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_query_id, version_number)
);

CREATE TABLE source_cursors (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_connector_id uuid NOT NULL REFERENCES source_connectors(id) ON DELETE CASCADE,
  source_query_id  uuid REFERENCES source_queries(id) ON DELETE CASCADE,
  cursor_state     jsonb NOT NULL DEFAULT '{}',   -- tokens, date windows (§23)
  last_success_at  timestamptz,
  last_attempt_at  timestamptz,
  UNIQUE (source_connector_id, source_query_id)
);

CREATE TABLE ingestion_runs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_connector_id uuid NOT NULL REFERENCES source_connectors(id) ON DELETE CASCADE,
  source_query_version_id uuid REFERENCES source_query_versions(id) ON DELETE SET NULL,
  status           ingestion_run_status NOT NULL DEFAULT 'running',
  started_at       timestamptz NOT NULL DEFAULT now(),
  finished_at      timestamptz,
  records_fetched  integer NOT NULL DEFAULT 0,
  records_new      integer NOT NULL DEFAULT 0,
  error_count      integer NOT NULL DEFAULT 0,
  error_detail     jsonb,
  job_id           text                       -- queue correlation id
);
CREATE INDEX idx_ingestion_runs ON ingestion_runs(source_connector_id, started_at DESC);

-- Raw + normalized record per §21 requirements.
CREATE TABLE source_records (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_connector_id uuid NOT NULL REFERENCES source_connectors(id) ON DELETE CASCADE,
  external_id      text NOT NULL,            -- PMID, NCT, DOI, URL, project number, ...
  source_url       text,
  raw_payload      jsonb NOT NULL,
  raw_hash         text NOT NULL,            -- sha256 of raw payload
  retrieved_at     timestamptz NOT NULL DEFAULT now(),
  source_updated_at timestamptz,
  connector_version text NOT NULL,
  source_query_version_id uuid REFERENCES source_query_versions(id) ON DELETE SET NULL,
  rights_status    text,                     -- license info where known (§21.2)
  normalized       jsonb,                    -- NormalizedSourceRecord
  processing_status processing_status NOT NULL DEFAULT 'pending',
  processing_error text,
  UNIQUE (source_connector_id, external_id, raw_hash)  -- idempotent upserts
);
CREATE INDEX idx_source_records_ext ON source_records(source_connector_id, external_id);
CREATE INDEX idx_source_records_status ON source_records(processing_status) WHERE processing_status IN ('pending','failed');

-- ---------------------------------------------------------------------------
-- Canonical content model (§25)
-- ---------------------------------------------------------------------------

CREATE TABLE content_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type     content_type NOT NULL,
  status           content_status NOT NULL DEFAULT 'ingested',
  original_title   text,
  display_headline text,
  plain_subheading text,
  slug             text UNIQUE,
  primary_publication_date date,
  last_source_update timestamptz,
  first_ingested_at timestamptz NOT NULL DEFAULT now(),
  primary_source_key text,                   -- denormalized source_connectors.source_key
  primary_source_url text,
  peer_reviewed    boolean,                  -- null = unknown/n-a
  population_type  population_type NOT NULL DEFAULT 'unknown',
  study_category   study_category NOT NULL DEFAULT 'unknown',
  evidence_strength evidence_strength NOT NULL DEFAULT 'insufficient_information',
  actionability    actionability NOT NULL DEFAULT 'no_action',
  sample_size      integer CHECK (sample_size >= 0),
  human_review_status review_status,         -- null = not required
  requires_human_review boolean NOT NULL DEFAULT false,  -- high-risk flag (§27)
  generated_summary_status text,             -- none|pending|generated|validated|failed
  rights_status    text,
  published_at     timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  search_tsv       tsvector GENERATED ALWAYS AS (to_tsvector('english',
      coalesce(display_headline,'') || ' ' || coalesce(plain_subheading,'') || ' ' ||
      coalesce(original_title,''))) STORED
);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_published ON content_items(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_content_pubdate ON content_items(primary_publication_date DESC);
CREATE INDEX idx_content_type ON content_items(content_type, status);
CREATE INDEX idx_content_evidence ON content_items(evidence_strength, actionability) WHERE status = 'published';
CREATE INDEX idx_content_search ON content_items USING gin(search_tsv);

-- Provenance: which source records feed a content item.
CREATE TABLE content_sources (
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  source_record_id uuid NOT NULL REFERENCES source_records(id) ON DELETE CASCADE,
  is_primary       boolean NOT NULL DEFAULT false,
  PRIMARY KEY (content_item_id, source_record_id)
);
CREATE INDEX idx_content_sources_record ON content_sources(source_record_id);

CREATE TABLE content_topics (
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  topic_id         uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  assigned_by      text NOT NULL DEFAULT 'rule',   -- rule|ai|human
  PRIMARY KEY (content_item_id, topic_id)
);
CREATE INDEX idx_content_topics_topic ON content_topics(topic_id);

-- ---------------------------------------------------------------------------
-- Subtypes (1:1 with content_items)
-- ---------------------------------------------------------------------------

CREATE TABLE research_papers (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  doi              text,
  pmid             text,
  pmcid            text,
  openalex_id      text,
  journal          text,
  authors          jsonb,                    -- [{name, affiliation?}]
  abstract         text,                     -- stored for internal evidence processing (§21.1)
  publication_types text[] NOT NULL DEFAULT '{}',
  mesh_terms       text[] NOT NULL DEFAULT '{}',
  language         text,
  is_preprint      boolean NOT NULL DEFAULT false,
  retraction_status text,                    -- none|retracted|corrected|concern
  open_access      boolean,
  license          text,
  citation_count   integer,
  grants           jsonb,
  reference_ids    jsonb                     -- referenced/related work identifiers
);
CREATE UNIQUE INDEX uq_papers_doi ON research_papers(doi) WHERE doi IS NOT NULL;
CREATE UNIQUE INDEX uq_papers_pmid ON research_papers(pmid) WHERE pmid IS NOT NULL;
CREATE INDEX idx_papers_pmcid ON research_papers(pmcid) WHERE pmcid IS NOT NULL;

CREATE TABLE clinical_trials (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  nct_number       text NOT NULL,
  brief_title      text,
  official_title   text,
  sponsor          text,
  study_type       text,
  phase            text,
  recruitment_status text,
  conditions       text[] NOT NULL DEFAULT '{}',
  interventions    jsonb,
  primary_outcomes jsonb,
  secondary_outcomes jsonb,
  enrollment       integer,
  eligibility_text text,
  minimum_age_years numeric(5,2),
  maximum_age_years numeric(5,2),
  requires_study_partner boolean,
  start_date       date,
  completion_date  date,
  results_posted   boolean NOT NULL DEFAULT false,
  contacts         jsonb,
  last_update_posted date
);
CREATE UNIQUE INDEX uq_trials_nct ON clinical_trials(nct_number);
CREATE INDEX idx_trials_status ON clinical_trials(recruitment_status);

CREATE TABLE clinical_trial_locations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES clinical_trials(content_item_id) ON DELETE CASCADE,
  facility         text,
  city             text,
  state            text,
  country          text,
  postal_code      text,
  latitude         double precision,
  longitude        double precision,
  location_status  text
);
CREATE INDEX idx_trial_locations ON clinical_trial_locations(content_item_id);
CREATE INDEX idx_trial_locations_geo ON clinical_trial_locations(country, state, city);

-- Change tracking → trial events → notifications (§21.4, §29).
CREATE TABLE clinical_trial_changes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES clinical_trials(content_item_id) ON DELETE CASCADE,
  change_type      trial_change_type NOT NULL,
  detected_at      timestamptz NOT NULL DEFAULT now(),
  old_value        jsonb,
  new_value        jsonb
);
CREATE INDEX idx_trial_changes ON clinical_trial_changes(content_item_id, detected_at DESC);

CREATE TABLE research_grants (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  project_number   text NOT NULL,
  project_title    text,
  abstract         text,
  principal_investigators jsonb,
  organization     text,
  funding_agency   text,
  fiscal_year      integer,
  award_amount     numeric(14,2),
  start_date       date,
  end_date         date,
  terms            text[] NOT NULL DEFAULT '{}',
  related_publication_ids jsonb,
  clinical_study_links jsonb
);
CREATE UNIQUE INDEX uq_grants_project ON research_grants(project_number);

CREATE TABLE regulatory_updates (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  agency           text NOT NULL DEFAULT 'FDA',
  action_type      text NOT NULL,            -- approval|label_change|safety|recall|other
  official_identifier text,                  -- application/document number
  drug_names       text[] NOT NULL DEFAULT '{}',
  effective_date   date,
  detail           jsonb
);
CREATE INDEX idx_regulatory_action ON regulatory_updates(action_type);

CREATE TABLE news_mentions (
  content_item_id  uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  publisher        text,
  article_url      text NOT NULL,
  language         text,
  country          text,
  extracted_entities jsonb,
  discovery_query  text
);
CREATE UNIQUE INDEX uq_news_url ON news_mentions(article_url);

-- ---------------------------------------------------------------------------
-- Story clusters & deduplication (§24)
-- ---------------------------------------------------------------------------

CREATE TABLE story_clusters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text,
  primary_content_item_id uuid REFERENCES content_items(id) ON DELETE SET NULL,
  locked           boolean NOT NULL DEFAULT false,   -- admin lock vs auto changes
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE story_cluster_members (
  story_cluster_id uuid NOT NULL REFERENCES story_clusters(id) ON DELETE CASCADE,
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  member_role      text NOT NULL DEFAULT 'coverage', -- primary_evidence|trial|regulatory|coverage|release
  added_by         text NOT NULL DEFAULT 'auto',     -- auto|admin
  PRIMARY KEY (story_cluster_id, content_item_id)
);
CREATE INDEX idx_cluster_members_item ON story_cluster_members(content_item_id);

CREATE TABLE duplicate_candidates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_a   uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  content_item_b   uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  match_score      numeric(5,4) NOT NULL CHECK (match_score BETWEEN 0 AND 1),
  match_features   jsonb,                    -- which signals matched (audit trail)
  status           duplicate_status NOT NULL DEFAULT 'pending',
  resolved_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (content_item_a <> content_item_b),
  UNIQUE (content_item_a, content_item_b)
);
CREATE INDEX idx_dupes_pending ON duplicate_candidates(status) WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- Evidence classification & AI pipeline (§26, §27)
-- ---------------------------------------------------------------------------

-- History of assessments; content_items carries the current denormalized labels.
CREATE TABLE evidence_assessments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  study_category   study_category NOT NULL,
  evidence_strength evidence_strength NOT NULL,
  actionability    actionability NOT NULL,
  method           text NOT NULL,            -- deterministic|ai|human
  rationale        jsonb,                    -- rule hits / model output / notes
  assessed_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  is_current       boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_evidence_item ON evidence_assessments(content_item_id, created_at DESC);

CREATE TABLE prompt_versions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key       text NOT NULL,            -- 'summary_v1', 'extract_topics', ...
  version_number   integer NOT NULL,
  prompt_body      text NOT NULL,
  model_hint       text,                     -- suggested model tier (§27 model separation)
  status           text NOT NULL DEFAULT 'draft',  -- draft|testing|production|retired
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prompt_key, version_number)
);

CREATE TABLE generated_summaries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  prompt_version_id uuid REFERENCES prompt_versions(id) ON DELETE SET NULL,
  model            text NOT NULL,
  payload          jsonb NOT NULL,           -- strict §27 JSON schema output
  validation_status text NOT NULL DEFAULT 'pending',  -- pending|passed|failed
  validation_errors jsonb,
  input_tokens     integer,
  output_tokens    integer,
  cost_usd         numeric(10,6),
  is_current       boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_summaries_item ON generated_summaries(content_item_id, created_at DESC);

-- Claim traceability: every substantive claim links to its support (§27).
CREATE TABLE generated_claims (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_summary_id uuid NOT NULL REFERENCES generated_summaries(id) ON DELETE CASCADE,
  claim_text       text NOT NULL,
  payload_field    text NOT NULL,            -- which summary field the claim appears in
  source_record_id uuid REFERENCES source_records(id) ON DELETE SET NULL,
  source_field     text,
  supporting_excerpt text,
  source_url       text
);
CREATE INDEX idx_claims_summary ON generated_claims(generated_summary_id);

-- ---------------------------------------------------------------------------
-- Editorial workflow (§31.2–31.3)
-- ---------------------------------------------------------------------------

CREATE TABLE content_versions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  version_number   integer NOT NULL,
  snapshot         jsonb NOT NULL,           -- full editable state at save
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_item_id, version_number)
);

CREATE TABLE content_reviews (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id  uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  reviewer_id      uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  status           review_status NOT NULL DEFAULT 'pending',
  notes            text,
  high_risk        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  resolved_at      timestamptz
);
CREATE INDEX idx_reviews_pending ON content_reviews(status, created_at) WHERE status = 'pending';

COMMIT;

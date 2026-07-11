-- Clarity Path — 0001_init.sql
-- Extensions, enumerated types, shared functions.
-- PostgreSQL 15+. UUID PKs via gen_random_uuid() (core since PG13).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- trigram search (resource/name matching)
CREATE EXTENSION IF NOT EXISTS citext;    -- case-insensitive emails

-- ---------------------------------------------------------------------------
-- Enumerated types
-- Stable, code-coupled sets use ENUMs. Admin-editable vocabularies (topics,
-- checkup questions, roadmap templates) live in tables instead.
-- ---------------------------------------------------------------------------

CREATE TYPE household_role AS ENUM (
  'owner', 'care_coordinator', 'contributor', 'read_only', 'care_recipient'
);

CREATE TYPE navigation_phase AS ENUM (
  'noticing_changes', 'preparing_evaluation', 'evaluation_underway',
  'mci_or_uncertain', 'diagnosed_independent', 'increasing_assistance',
  'advanced_care', 'not_sure'
);

CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TYPE observation_category AS ENUM (
  'memory_repetition', 'word_finding', 'orientation', 'planning_organization',
  'medication_management', 'finances', 'driving_navigation', 'cooking_household',
  'personal_care', 'mood_anxiety', 'sleep', 'balance_falls', 'illness_infection',
  'social_engagement', 'positive_stable', 'other'
);

CREATE TYPE context_factor AS ENUM (
  'poor_sleep', 'travel', 'illness', 'medication_change', 'stress',
  'alcohol', 'pain', 'dehydration', 'disrupted_routine', 'other'
);

CREATE TYPE visibility_level AS ENUM ('household', 'coordinators_only', 'private');

CREATE TYPE medication_event_type AS ENUM (
  'started', 'stopped', 'dose_changed', 'missed_dose',
  'refill_problem', 'possible_side_effect', 'family_note'
);

CREATE TYPE health_context_type AS ENUM (
  'sleep_quality', 'cpap_use', 'illness', 'fall',
  'routine_disruption', 'medical_event', 'other'
);

CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'deferred', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE roadmap_category AS ENUM (
  'medical_evaluation', 'daily_life', 'safety', 'legal_planning',
  'financial_planning', 'family_coordination', 'caregiver_support',
  'home_preparation', 'long_term_planning'
);

CREATE TYPE roadmap_status AS ENUM ('suggested', 'in_progress', 'completed', 'deferred', 'dismissed');

CREATE TYPE family_update_type AS ENUM (
  'appointment_update', 'observation_summary', 'task_update',
  'decision_update', 'general_note'
);

CREATE TYPE document_record_type AS ENUM (
  'medication_list', 'lab_result', 'imaging_report', 'neuropsych_report',
  'visit_summary', 'insurance', 'advance_directive', 'healthcare_poa',
  'financial_poa', 'ltc_policy', 'emergency_info', 'other'
);

CREATE TYPE document_access_action AS ENUM ('view', 'download', 'delete', 'restore', 'share_link_view');

CREATE TYPE content_type AS ENUM (
  'research_paper', 'clinical_trial', 'research_grant', 'regulatory_update',
  'news_mention', 'caregiving_guidance', 'system_announcement'
);

CREATE TYPE content_status AS ENUM (
  'ingested', 'normalized', 'enrichment_pending', 'ai_processing', 'draft',
  'needs_review', 'approved', 'published', 'rejected', 'archived', 'error'
);

CREATE TYPE study_category AS ENUM (
  'regulatory_action', 'clinical_guideline', 'systematic_review', 'meta_analysis',
  'randomized_controlled_trial', 'phase_3_trial', 'phase_2_trial', 'phase_1_trial',
  'other_interventional', 'prospective_cohort', 'retrospective_observational',
  'cross_sectional', 'case_control', 'case_series', 'case_report',
  'qualitative_study', 'caregiver_intervention', 'preclinical_animal',
  'in_vitro_laboratory', 'computational_modeling', 'preprint',
  'expert_commentary', 'news_report', 'grant_announcement', 'unknown'
);

CREATE TYPE evidence_strength AS ENUM (
  'strong', 'moderate', 'preliminary', 'very_preliminary',
  'not_applicable', 'insufficient_information'
);

CREATE TYPE actionability AS ENUM (
  'no_action', 'worth_watching', 'ask_clinician',
  'care_planning_relevant', 'official_safety', 'administrative'
);

CREATE TYPE population_type AS ENUM ('human', 'animal', 'laboratory', 'mixed', 'unknown');

CREATE TYPE topic_kind AS ENUM ('topic', 'dementia_type', 'treatment', 'institution', 'country');

CREATE TYPE trial_change_type AS ENUM (
  'newly_posted', 'recruitment_opened', 'recruitment_closed', 'status_changed',
  'location_added', 'results_posted', 'completion_date_changed',
  'eligibility_changed', 'other'
);

CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'processed', 'failed', 'skipped');

CREATE TYPE ingestion_run_status AS ENUM ('running', 'succeeded', 'failed', 'partial');

CREATE TYPE duplicate_status AS ENUM ('pending', 'merged', 'rejected');

CREATE TYPE review_status AS ENUM ('pending', 'approved', 'changes_requested', 'rejected');

CREATE TYPE admin_role_key AS ENUM (
  'super_admin', 'clinical_editor', 'content_editor',
  'ingestion_operator', 'support_agent'
);

CREATE TYPE notification_channel AS ENUM ('in_app', 'email');

CREATE TYPE delivery_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'suppressed');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on any table that has the column.
-- Applied per-table by a DO block in 0007.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;

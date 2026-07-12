-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."actionability" AS ENUM('no_action', 'worth_watching', 'ask_clinician', 'care_planning_relevant', 'official_safety', 'administrative');--> statement-breakpoint
CREATE TYPE "public"."admin_role_key" AS ENUM('super_admin', 'clinical_editor', 'content_editor', 'ingestion_operator', 'support_agent');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('ingested', 'normalized', 'enrichment_pending', 'ai_processing', 'draft', 'needs_review', 'approved', 'published', 'rejected', 'archived', 'error');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('research_paper', 'clinical_trial', 'research_grant', 'regulatory_update', 'news_mention', 'caregiving_guidance', 'system_announcement');--> statement-breakpoint
CREATE TYPE "public"."context_factor" AS ENUM('poor_sleep', 'travel', 'illness', 'medication_change', 'stress', 'alcohol', 'pain', 'dehydration', 'disrupted_routine', 'other');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('queued', 'sent', 'delivered', 'failed', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."document_access_action" AS ENUM('view', 'download', 'delete', 'restore', 'share_link_view');--> statement-breakpoint
CREATE TYPE "public"."document_record_type" AS ENUM('medication_list', 'lab_result', 'imaging_report', 'neuropsych_report', 'visit_summary', 'insurance', 'advance_directive', 'healthcare_poa', 'financial_poa', 'ltc_policy', 'emergency_info', 'other');--> statement-breakpoint
CREATE TYPE "public"."duplicate_status" AS ENUM('pending', 'merged', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."evidence_strength" AS ENUM('strong', 'moderate', 'preliminary', 'very_preliminary', 'not_applicable', 'insufficient_information');--> statement-breakpoint
CREATE TYPE "public"."family_update_type" AS ENUM('appointment_update', 'observation_summary', 'task_update', 'decision_update', 'general_note');--> statement-breakpoint
CREATE TYPE "public"."health_context_type" AS ENUM('sleep_quality', 'cpap_use', 'illness', 'fall', 'routine_disruption', 'medical_event', 'other');--> statement-breakpoint
CREATE TYPE "public"."household_role" AS ENUM('owner', 'care_coordinator', 'contributor', 'read_only', 'care_recipient');--> statement-breakpoint
CREATE TYPE "public"."ingestion_run_status" AS ENUM('running', 'succeeded', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."medication_event_type" AS ENUM('started', 'stopped', 'dose_changed', 'missed_dose', 'refill_problem', 'possible_side_effect', 'family_note');--> statement-breakpoint
CREATE TYPE "public"."navigation_phase" AS ENUM('noticing_changes', 'preparing_evaluation', 'evaluation_underway', 'mci_or_uncertain', 'diagnosed_independent', 'increasing_assistance', 'advanced_care', 'not_sure');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email');--> statement-breakpoint
CREATE TYPE "public"."observation_category" AS ENUM('memory_repetition', 'word_finding', 'orientation', 'planning_organization', 'medication_management', 'finances', 'driving_navigation', 'cooking_household', 'personal_care', 'mood_anxiety', 'sleep', 'balance_falls', 'illness_infection', 'social_engagement', 'positive_stable', 'other');--> statement-breakpoint
CREATE TYPE "public"."population_type" AS ENUM('human', 'animal', 'laboratory', 'mixed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'processed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'changes_requested', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."roadmap_category" AS ENUM('medical_evaluation', 'daily_life', 'safety', 'legal_planning', 'financial_planning', 'family_coordination', 'caregiver_support', 'home_preparation', 'long_term_planning');--> statement-breakpoint
CREATE TYPE "public"."roadmap_status" AS ENUM('suggested', 'in_progress', 'completed', 'deferred', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."study_category" AS ENUM('regulatory_action', 'clinical_guideline', 'systematic_review', 'meta_analysis', 'randomized_controlled_trial', 'phase_3_trial', 'phase_2_trial', 'phase_1_trial', 'other_interventional', 'prospective_cohort', 'retrospective_observational', 'cross_sectional', 'case_control', 'case_series', 'case_report', 'qualitative_study', 'caregiver_intervention', 'preclinical_animal', 'in_vitro_laboratory', 'computational_modeling', 'preprint', 'expert_commentary', 'news_report', 'grant_announcement', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'in_progress', 'completed', 'deferred', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."topic_kind" AS ENUM('topic', 'dementia_type', 'treatment', 'institution', 'country');--> statement-breakpoint
CREATE TYPE "public"."trial_change_type" AS ENUM('newly_posted', 'recruitment_opened', 'recruitment_closed', 'status_changed', 'location_added', 'results_posted', 'completion_date_changed', 'eligibility_changed', 'other');--> statement-breakpoint
CREATE TYPE "public"."visibility_level" AS ENUM('household', 'coordinators_only', 'private');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" "citext" NOT NULL,
	"display_name" text NOT NULL,
	"pronouns" text,
	"timezone" text DEFAULT 'America/Chicago' NOT NULL,
	"quiet_hours" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "external_auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_auth_identities_provider_provider_subject_key" UNIQUE("provider","provider_subject")
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"navigation_phase" "navigation_phase" DEFAULT 'not_sure' NOT NULL,
	"priorities" text[] DEFAULT '{""}' NOT NULL,
	"onboarding_state" jsonb,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "household_role" NOT NULL,
	"relationship" text,
	"can_invite" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "household_memberships_household_id_user_id_key" UNIQUE("household_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"role" "household_role" NOT NULL,
	"invited_by" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_by" uuid,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "care_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"preferred_name" text NOT NULL,
	"birth_year" smallint,
	"general_location" text,
	"postal_code" text,
	"pronouns" text,
	"user_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "care_recipients_user_id_key" UNIQUE("user_id"),
	CONSTRAINT "care_recipients_birth_year_check" CHECK ((birth_year >= 1900) AND (birth_year <= 2100))
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid,
	"user_id" uuid,
	"consent_type" text NOT NULL,
	"granted" boolean NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"details" jsonb,
	CONSTRAINT "consents_check" CHECK ((household_id IS NOT NULL) OR (user_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "admin_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"admin_role_id" uuid NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "admin_role_assignments_user_id_admin_role_id_key" UNIQUE("user_id","admin_role_id")
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" "admin_role_key" NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "admin_roles_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"clinician_name" text,
	"specialty" text,
	"location" text,
	"purpose" text,
	"attendee_membership_id" uuid,
	"notes" text,
	"next_appointment_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"question" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"added_by" uuid,
	"answer_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinician_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"date_range_start" date NOT NULL,
	"date_range_end" date NOT NULL,
	"content_snapshot" jsonb NOT NULL,
	"pdf_storage_key" text,
	"generated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinician_briefs_check" CHECK (date_range_end >= date_range_start)
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid NOT NULL,
	"category" "observation_category" NOT NULL,
	"description" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"time_approximate" boolean DEFAULT false NOT NULL,
	"observer_membership_id" uuid,
	"location_context" text,
	"duration_minutes" integer,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"functional_impact" text,
	"visibility" "visibility_level" DEFAULT 'household' NOT NULL,
	"include_in_brief" boolean DEFAULT false NOT NULL,
	"attachment_document_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, description)) STORED,
	CONSTRAINT "observations_duration_minutes_check" CHECK (duration_minutes > 0)
);
--> statement-breakpoint
CREATE TABLE "observation_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"observation_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"edited_by" uuid,
	"edited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observation_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"observation_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid NOT NULL,
	"name" text NOT NULL,
	"generic_name" text,
	"dosage_text" text,
	"frequency_text" text,
	"prescriber" text,
	"reason" text,
	"started_on" date,
	"ended_on" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"info_source" text,
	"last_confirmed_on" date,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medications_check" CHECK ((ended_on IS NULL) OR (started_on IS NULL) OR (ended_on >= started_on))
);
--> statement-breakpoint
CREATE TABLE "medication_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"medication_id" uuid NOT NULL,
	"event_type" "medication_event_type" NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"note" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_context_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid NOT NULL,
	"context_type" "health_context_type" NOT NULL,
	"occurred_on" date NOT NULL,
	"value" jsonb,
	"note" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinician_share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"brief_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"label" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinician_share_links_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "share_link_access_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_link_id" uuid NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" "inet",
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"category" "roadmap_category",
	"assignee_membership_id" uuid,
	"due_on" date,
	"recurrence_rule" text,
	"priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"appointment_id" uuid,
	"roadmap_item_id" uuid,
	"completed_at" timestamp with time zone,
	"completed_by" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((title || ' '::text) || COALESCE(description, ''::text)))) STORED
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"title" text NOT NULL,
	"decided_on" date NOT NULL,
	"background" text,
	"agreed_plan" text NOT NULL,
	"reconsider_conditions" text,
	"follow_up_on" date,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((((title || ' '::text) || agreed_plan) || ' '::text) || COALESCE(background, ''::text)))) STORED
);
--> statement-breakpoint
CREATE TABLE "decision_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"update_type" "family_update_type" NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"appointment_id" uuid,
	"task_id" uuid,
	"decision_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_update_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_update_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregiver_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"caregiving_hours_week" numeric(5, 1),
	"sleep_disruption" smallint,
	"work_interference" smallint,
	"stress_level" smallint,
	"family_conflict" smallint,
	"has_backup_help" boolean,
	"days_since_break" integer,
	"feeling_overwhelmed" smallint,
	"immediate_safety_concern" boolean DEFAULT false NOT NULL,
	"free_text" text,
	"generated_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caregiver_checkins_caregiving_hours_week_check" CHECK (caregiving_hours_week >= (0)::numeric),
	CONSTRAINT "caregiver_checkins_days_since_break_check" CHECK (days_since_break >= 0),
	CONSTRAINT "caregiver_checkins_family_conflict_check" CHECK ((family_conflict >= 0) AND (family_conflict <= 4)),
	CONSTRAINT "caregiver_checkins_feeling_overwhelmed_check" CHECK ((feeling_overwhelmed >= 0) AND (feeling_overwhelmed <= 4)),
	CONSTRAINT "caregiver_checkins_sleep_disruption_check" CHECK ((sleep_disruption >= 0) AND (sleep_disruption <= 4)),
	CONSTRAINT "caregiver_checkins_stress_level_check" CHECK ((stress_level >= 0) AND (stress_level <= 4)),
	CONSTRAINT "caregiver_checkins_work_interference_check" CHECK ((work_interference >= 0) AND (work_interference <= 4))
);
--> statement-breakpoint
CREATE TABLE "safety_checkup_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"intro_text" text,
	"questions" jsonb NOT NULL,
	"guidance" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "safety_checkup_templates_key_version_key" UNIQUE("key","version")
);
--> statement-breakpoint
CREATE TABLE "safety_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"started_by" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"response" jsonb NOT NULL,
	"note" text,
	CONSTRAINT "safety_responses_assessment_id_question_key_key" UNIQUE("assessment_id","question_key")
);
--> statement-breakpoint
CREATE TABLE "roadmap_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"explanation" text NOT NULL,
	"category" "roadmap_category" NOT NULL,
	"applicable_phases" "navigation_phase"[] NOT NULL,
	"default_priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"suggested_timing" text,
	"educational_slug" text,
	"requires_record_type" "document_record_type",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"template_id" uuid,
	"title" text NOT NULL,
	"explanation" text NOT NULL,
	"phase" "navigation_phase" NOT NULL,
	"category" "roadmap_category" NOT NULL,
	"priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"status" "roadmap_status" DEFAULT 'suggested' NOT NULL,
	"suggested_timing" text,
	"assignee_membership_id" uuid,
	"completed_at" timestamp with time zone,
	"deferred_until" date,
	"dismissed_reason" text,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"situation_key" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"guidance" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"script_id" uuid NOT NULL,
	"personalized_body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_scripts_user_id_script_id_key" UNIQUE("user_id","script_id")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"care_recipient_id" uuid,
	"record_type" "document_record_type" NOT NULL,
	"title" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"document_date" date,
	"issuing_organization" text,
	"expires_on" date,
	"tags" text[] DEFAULT '{""}' NOT NULL,
	"visibility" "visibility_level" DEFAULT 'household' NOT NULL,
	"uploaded_by" uuid,
	"virus_scan_status" text DEFAULT 'pending' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((title || ' '::text) || COALESCE(issuing_organization, ''::text)))) STORED,
	CONSTRAINT "documents_byte_size_check" CHECK (byte_size >= 0)
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"storage_key" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_versions_document_id_version_number_key" UNIQUE("document_id","version_number"),
	CONSTRAINT "document_versions_byte_size_check" CHECK (byte_size >= 0)
);
--> statement-breakpoint
CREATE TABLE "document_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"can_view" boolean DEFAULT true NOT NULL,
	"granted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "document_permissions_document_id_membership_id_key" UNIQUE("document_id","membership_id")
);
--> statement-breakpoint
CREATE TABLE "document_access_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid,
	"share_link_id" uuid,
	"action" "document_access_action" NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" "inet"
);
--> statement-breakpoint
CREATE TABLE "extracted_document_text" (
	"document_id" uuid PRIMARY KEY NOT NULL,
	"extracted_text" text NOT NULL,
	"extraction_method" text NOT NULL,
	"consent_id" uuid,
	"extracted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, extracted_text)) STORED
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "topic_kind" DEFAULT 'topic' NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_synonyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"synonym" text NOT NULL,
	CONSTRAINT "topic_synonyms_topic_id_synonym_key" UNIQUE("topic_id","synonym")
);
--> statement-breakpoint
CREATE TABLE "source_connectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_key" text NOT NULL,
	"display_name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"schedule_cron" text NOT NULL,
	"throttle_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"connector_version" text DEFAULT '1.0.0' NOT NULL,
	"last_health_check_at" timestamp with time zone,
	"last_health_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_connectors_source_key_key" UNIQUE("source_key")
);
--> statement-breakpoint
CREATE TABLE "source_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_connector_id" uuid NOT NULL,
	"topic_id" uuid,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_query_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_query_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"query_body" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_query_versions_source_query_id_version_number_key" UNIQUE("source_query_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "source_cursors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_connector_id" uuid NOT NULL,
	"source_query_id" uuid,
	"cursor_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_success_at" timestamp with time zone,
	"last_attempt_at" timestamp with time zone,
	CONSTRAINT "source_cursors_source_connector_id_source_query_id_key" UNIQUE("source_connector_id","source_query_id")
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_connector_id" uuid NOT NULL,
	"source_query_version_id" uuid,
	"status" "ingestion_run_status" DEFAULT 'running' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"records_fetched" integer DEFAULT 0 NOT NULL,
	"records_new" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"error_detail" jsonb,
	"job_id" text
);
--> statement-breakpoint
CREATE TABLE "source_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_connector_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"source_url" text,
	"raw_payload" jsonb NOT NULL,
	"raw_hash" text NOT NULL,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_updated_at" timestamp with time zone,
	"connector_version" text NOT NULL,
	"source_query_version_id" uuid,
	"rights_status" text,
	"normalized" jsonb,
	"processing_status" "processing_status" DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	CONSTRAINT "source_records_source_connector_id_external_id_raw_hash_key" UNIQUE("source_connector_id","external_id","raw_hash")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" "content_type" NOT NULL,
	"status" "content_status" DEFAULT 'ingested' NOT NULL,
	"original_title" text,
	"display_headline" text,
	"plain_subheading" text,
	"slug" text,
	"primary_publication_date" date,
	"last_source_update" timestamp with time zone,
	"first_ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"primary_source_key" text,
	"primary_source_url" text,
	"peer_reviewed" boolean,
	"population_type" "population_type" DEFAULT 'unknown' NOT NULL,
	"study_category" "study_category" DEFAULT 'unknown' NOT NULL,
	"evidence_strength" "evidence_strength" DEFAULT 'insufficient_information' NOT NULL,
	"actionability" "actionability" DEFAULT 'no_action' NOT NULL,
	"sample_size" integer,
	"human_review_status" "review_status",
	"requires_human_review" boolean DEFAULT false NOT NULL,
	"generated_summary_status" text,
	"rights_status" text,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((((COALESCE(display_headline, ''::text) || ' '::text) || COALESCE(plain_subheading, ''::text)) || ' '::text) || COALESCE(original_title, ''::text)))) STORED,
	CONSTRAINT "content_items_slug_key" UNIQUE("slug"),
	CONSTRAINT "content_items_sample_size_check" CHECK (sample_size >= 0)
);
--> statement-breakpoint
CREATE TABLE "research_papers" (
	"content_item_id" uuid PRIMARY KEY NOT NULL,
	"doi" text,
	"pmid" text,
	"pmcid" text,
	"openalex_id" text,
	"journal" text,
	"authors" jsonb,
	"abstract" text,
	"publication_types" text[] DEFAULT '{""}' NOT NULL,
	"mesh_terms" text[] DEFAULT '{""}' NOT NULL,
	"language" text,
	"is_preprint" boolean DEFAULT false NOT NULL,
	"retraction_status" text,
	"open_access" boolean,
	"license" text,
	"citation_count" integer,
	"grants" jsonb,
	"reference_ids" jsonb
);
--> statement-breakpoint
CREATE TABLE "clinical_trials" (
	"content_item_id" uuid PRIMARY KEY NOT NULL,
	"nct_number" text NOT NULL,
	"brief_title" text,
	"official_title" text,
	"sponsor" text,
	"study_type" text,
	"phase" text,
	"recruitment_status" text,
	"conditions" text[] DEFAULT '{""}' NOT NULL,
	"interventions" jsonb,
	"primary_outcomes" jsonb,
	"secondary_outcomes" jsonb,
	"enrollment" integer,
	"eligibility_text" text,
	"minimum_age_years" numeric(5, 2),
	"maximum_age_years" numeric(5, 2),
	"requires_study_partner" boolean,
	"start_date" date,
	"completion_date" date,
	"results_posted" boolean DEFAULT false NOT NULL,
	"contacts" jsonb,
	"last_update_posted" date
);
--> statement-breakpoint
CREATE TABLE "clinical_trial_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"facility" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"location_status" text
);
--> statement-breakpoint
CREATE TABLE "clinical_trial_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"change_type" "trial_change_type" NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb
);
--> statement-breakpoint
CREATE TABLE "research_grants" (
	"content_item_id" uuid PRIMARY KEY NOT NULL,
	"project_number" text NOT NULL,
	"project_title" text,
	"abstract" text,
	"principal_investigators" jsonb,
	"organization" text,
	"funding_agency" text,
	"fiscal_year" integer,
	"award_amount" numeric(14, 2),
	"start_date" date,
	"end_date" date,
	"terms" text[] DEFAULT '{""}' NOT NULL,
	"related_publication_ids" jsonb,
	"clinical_study_links" jsonb
);
--> statement-breakpoint
CREATE TABLE "regulatory_updates" (
	"content_item_id" uuid PRIMARY KEY NOT NULL,
	"agency" text DEFAULT 'FDA' NOT NULL,
	"action_type" text NOT NULL,
	"official_identifier" text,
	"drug_names" text[] DEFAULT '{""}' NOT NULL,
	"effective_date" date,
	"detail" jsonb
);
--> statement-breakpoint
CREATE TABLE "news_mentions" (
	"content_item_id" uuid PRIMARY KEY NOT NULL,
	"publisher" text,
	"article_url" text NOT NULL,
	"language" text,
	"country" text,
	"extracted_entities" jsonb,
	"discovery_query" text
);
--> statement-breakpoint
CREATE TABLE "story_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"primary_content_item_id" uuid,
	"locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "duplicate_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_a" uuid NOT NULL,
	"content_item_b" uuid NOT NULL,
	"match_score" numeric(5, 4) NOT NULL,
	"match_features" jsonb,
	"status" "duplicate_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "duplicate_candidates_content_item_a_content_item_b_key" UNIQUE("content_item_a","content_item_b"),
	CONSTRAINT "duplicate_candidates_check" CHECK (content_item_a <> content_item_b),
	CONSTRAINT "duplicate_candidates_match_score_check" CHECK ((match_score >= (0)::numeric) AND (match_score <= (1)::numeric))
);
--> statement-breakpoint
CREATE TABLE "evidence_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"study_category" "study_category" NOT NULL,
	"evidence_strength" "evidence_strength" NOT NULL,
	"actionability" "actionability" NOT NULL,
	"method" text NOT NULL,
	"rationale" jsonb,
	"assessed_by" uuid,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_key" text NOT NULL,
	"version_number" integer NOT NULL,
	"prompt_body" text NOT NULL,
	"model_hint" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_versions_prompt_key_version_number_key" UNIQUE("prompt_key","version_number")
);
--> statement-breakpoint
CREATE TABLE "generated_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"prompt_version_id" uuid,
	"model" text NOT NULL,
	"payload" jsonb NOT NULL,
	"validation_status" text DEFAULT 'pending' NOT NULL,
	"validation_errors" jsonb,
	"input_tokens" integer,
	"output_tokens" integer,
	"cost_usd" numeric(10, 6),
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generated_summary_id" uuid NOT NULL,
	"claim_text" text NOT NULL,
	"payload_field" text NOT NULL,
	"source_record_id" uuid,
	"source_field" text,
	"supporting_excerpt" text,
	"source_url" text
);
--> statement-breakpoint
CREATE TABLE "household_feed_preferences" (
	"household_id" uuid PRIMARY KEY NOT NULL,
	"trial_radius_km" integer,
	"trial_center_postal_code" text,
	"include_preliminary" boolean DEFAULT true NOT NULL,
	"include_animal_studies" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "household_feed_preferences_trial_radius_km_check" CHECK (trial_radius_km > 0)
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_versions_content_item_id_version_number_key" UNIQUE("content_item_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "content_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"assigned_by" uuid,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"high_risk" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_topic_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"preference" text DEFAULT 'follow' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_topic_preferences_user_id_topic_id_key" UNIQUE("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "followed_trials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "followed_trials_user_id_content_item_id_key" UNIQUE("user_id","content_item_id")
);
--> statement-breakpoint
CREATE TABLE "followed_treatments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "followed_treatments_user_id_topic_id_key" UNIQUE("user_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "saved_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_content_user_id_content_item_id_key" UNIQUE("user_id","content_item_id")
);
--> statement-breakpoint
CREATE TABLE "hidden_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hidden_content_user_id_content_item_id_key" UNIQUE("user_id","content_item_id")
);
--> statement-breakpoint
CREATE TABLE "feed_impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"feed_tab" text NOT NULL,
	"relevance_score" numeric(8, 4),
	"relevance_reasons" jsonb,
	"shown_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"household_id" uuid,
	"category" text NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"as_digest" boolean DEFAULT false NOT NULL,
	CONSTRAINT "notification_preferences_user_id_household_id_category_chan_key" UNIQUE("user_id","household_id","category","channel")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"household_id" uuid,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"content_item_id" uuid,
	"task_id" uuid,
	"appointment_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"status" "delivery_status" DEFAULT 'queued' NOT NULL,
	"provider_message_id" text,
	"attempted_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"error_detail" text
);
--> statement-breakpoint
CREATE TABLE "support_access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"support_user_id" uuid NOT NULL,
	"household_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "support_access_grants_check" CHECK (expires_at > granted_at)
);
--> statement-breakpoint
CREATE TABLE "digest_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"sections" jsonb,
	"status" "delivery_status" DEFAULT 'queued' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "digest_runs_check" CHECK (period_end >= period_start)
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_type" text DEFAULT 'user' NOT NULL,
	"household_id" uuid,
	"event_type" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" "inet",
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_key" text NOT NULL,
	"description" text NOT NULL,
	"default_enabled" boolean DEFAULT false NOT NULL,
	"overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_flag_key_key" UNIQUE("flag_key")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_failures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_name" text NOT NULL,
	"job_id" text NOT NULL,
	"job_name" text,
	"payload" jsonb,
	"error_message" text,
	"error_stack" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"failed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retried_at" timestamp with time zone,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "educational_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body_markdown" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "educational_content_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resource_directory_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"street_address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'US' NOT NULL,
	"service_area" text,
	"latitude" double precision,
	"longitude" double precision,
	"phone" text,
	"website" text,
	"eligibility_notes" text,
	"cost_notes" text,
	"source" text,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"last_verified_on" date,
	"admin_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((((name || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE(service_area, ''::text)))) STORED
);
--> statement-breakpoint
CREATE TABLE "appointment_observations" (
	"appointment_id" uuid NOT NULL,
	"observation_id" uuid NOT NULL,
	CONSTRAINT "appointment_observations_pkey" PRIMARY KEY("appointment_id","observation_id")
);
--> statement-breakpoint
CREATE TABLE "decision_participants" (
	"decision_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	CONSTRAINT "decision_participants_pkey" PRIMARY KEY("decision_id","membership_id")
);
--> statement-breakpoint
CREATE TABLE "appointment_documents" (
	"appointment_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	CONSTRAINT "appointment_documents_pkey" PRIMARY KEY("appointment_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "decision_documents" (
	"decision_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	CONSTRAINT "decision_documents_pkey" PRIMARY KEY("decision_id","document_id")
);
--> statement-breakpoint
CREATE TABLE "observation_contexts" (
	"observation_id" uuid NOT NULL,
	"factor" "context_factor" NOT NULL,
	"note" text,
	CONSTRAINT "observation_contexts_pkey" PRIMARY KEY("observation_id","factor")
);
--> statement-breakpoint
CREATE TABLE "content_sources" (
	"content_item_id" uuid NOT NULL,
	"source_record_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "content_sources_pkey" PRIMARY KEY("content_item_id","source_record_id")
);
--> statement-breakpoint
CREATE TABLE "content_topics" (
	"content_item_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"assigned_by" text DEFAULT 'rule' NOT NULL,
	CONSTRAINT "content_topics_pkey" PRIMARY KEY("content_item_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "story_cluster_members" (
	"story_cluster_id" uuid NOT NULL,
	"content_item_id" uuid NOT NULL,
	"member_role" text DEFAULT 'coverage' NOT NULL,
	"added_by" text DEFAULT 'auto' NOT NULL,
	CONSTRAINT "story_cluster_members_pkey" PRIMARY KEY("story_cluster_id","content_item_id")
);
--> statement-breakpoint
ALTER TABLE "external_auth_identities" ADD CONSTRAINT "external_auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_memberships" ADD CONSTRAINT "household_memberships_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_memberships" ADD CONSTRAINT "household_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_recipients" ADD CONSTRAINT "care_recipients_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_recipients" ADD CONSTRAINT "care_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_assignments" ADD CONSTRAINT "admin_role_assignments_admin_role_id_fkey" FOREIGN KEY ("admin_role_id") REFERENCES "public"."admin_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_assignments" ADD CONSTRAINT "admin_role_assignments_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_assignments" ADD CONSTRAINT "admin_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_attendee_membership_id_fkey" FOREIGN KEY ("attendee_membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_next_appointment_id_fkey" FOREIGN KEY ("next_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_questions" ADD CONSTRAINT "appointment_questions_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_questions" ADD CONSTRAINT "appointment_questions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_briefs" ADD CONSTRAINT "clinician_briefs_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_briefs" ADD CONSTRAINT "clinician_briefs_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_briefs" ADD CONSTRAINT "clinician_briefs_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "fk_observations_attachment" FOREIGN KEY ("attachment_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_observer_membership_id_fkey" FOREIGN KEY ("observer_membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_revisions" ADD CONSTRAINT "observation_revisions_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_revisions" ADD CONSTRAINT "observation_revisions_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_comments" ADD CONSTRAINT "observation_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_comments" ADD CONSTRAINT "observation_comments_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_events" ADD CONSTRAINT "medication_events_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_events" ADD CONSTRAINT "medication_events_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_events" ADD CONSTRAINT "medication_events_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_context_events" ADD CONSTRAINT "health_context_events_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_context_events" ADD CONSTRAINT "health_context_events_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_context_events" ADD CONSTRAINT "health_context_events_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_share_links" ADD CONSTRAINT "clinician_share_links_brief_id_fkey" FOREIGN KEY ("brief_id") REFERENCES "public"."clinician_briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_share_links" ADD CONSTRAINT "clinician_share_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_share_links" ADD CONSTRAINT "clinician_share_links_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_access_events" ADD CONSTRAINT "share_link_access_events_share_link_id_fkey" FOREIGN KEY ("share_link_id") REFERENCES "public"."clinician_share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_roadmap_item" FOREIGN KEY ("roadmap_item_id") REFERENCES "public"."roadmap_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_membership_id_fkey" FOREIGN KEY ("assignee_membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_comments" ADD CONSTRAINT "decision_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_comments" ADD CONSTRAINT "decision_comments_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_updates" ADD CONSTRAINT "family_updates_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_updates" ADD CONSTRAINT "family_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_updates" ADD CONSTRAINT "family_updates_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_updates" ADD CONSTRAINT "family_updates_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_updates" ADD CONSTRAINT "family_updates_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_update_comments" ADD CONSTRAINT "family_update_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_update_comments" ADD CONSTRAINT "family_update_comments_family_update_id_fkey" FOREIGN KEY ("family_update_id") REFERENCES "public"."family_updates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_checkins" ADD CONSTRAINT "caregiver_checkins_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_checkins" ADD CONSTRAINT "caregiver_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_checkup_templates" ADD CONSTRAINT "safety_checkup_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_assessments" ADD CONSTRAINT "safety_assessments_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_assessments" ADD CONSTRAINT "safety_assessments_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_assessments" ADD CONSTRAINT "safety_assessments_started_by_fkey" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_assessments" ADD CONSTRAINT "safety_assessments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."safety_checkup_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_responses" ADD CONSTRAINT "safety_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."safety_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_templates" ADD CONSTRAINT "roadmap_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_assignee_membership_id_fkey" FOREIGN KEY ("assignee_membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."roadmap_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_scripts" ADD CONSTRAINT "communication_scripts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_scripts" ADD CONSTRAINT "saved_scripts_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "public"."communication_scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_scripts" ADD CONSTRAINT "saved_scripts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_care_recipient_id_fkey" FOREIGN KEY ("care_recipient_id") REFERENCES "public"."care_recipients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_events" ADD CONSTRAINT "document_access_events_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_events" ADD CONSTRAINT "document_access_events_share_link_id_fkey" FOREIGN KEY ("share_link_id") REFERENCES "public"."clinician_share_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_events" ADD CONSTRAINT "document_access_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracted_document_text" ADD CONSTRAINT "extracted_document_text_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "public"."consents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracted_document_text" ADD CONSTRAINT "extracted_document_text_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_synonyms" ADD CONSTRAINT "topic_synonyms_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_queries" ADD CONSTRAINT "source_queries_source_connector_id_fkey" FOREIGN KEY ("source_connector_id") REFERENCES "public"."source_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_queries" ADD CONSTRAINT "source_queries_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_query_versions" ADD CONSTRAINT "source_query_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_query_versions" ADD CONSTRAINT "source_query_versions_source_query_id_fkey" FOREIGN KEY ("source_query_id") REFERENCES "public"."source_queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_cursors" ADD CONSTRAINT "source_cursors_source_connector_id_fkey" FOREIGN KEY ("source_connector_id") REFERENCES "public"."source_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_cursors" ADD CONSTRAINT "source_cursors_source_query_id_fkey" FOREIGN KEY ("source_query_id") REFERENCES "public"."source_queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_connector_id_fkey" FOREIGN KEY ("source_connector_id") REFERENCES "public"."source_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_query_version_id_fkey" FOREIGN KEY ("source_query_version_id") REFERENCES "public"."source_query_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_source_connector_id_fkey" FOREIGN KEY ("source_connector_id") REFERENCES "public"."source_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_source_query_version_id_fkey" FOREIGN KEY ("source_query_version_id") REFERENCES "public"."source_query_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_papers" ADD CONSTRAINT "research_papers_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_trials" ADD CONSTRAINT "clinical_trials_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_trial_locations" ADD CONSTRAINT "clinical_trial_locations_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."clinical_trials"("content_item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_trial_changes" ADD CONSTRAINT "clinical_trial_changes_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."clinical_trials"("content_item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_grants" ADD CONSTRAINT "research_grants_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_mentions" ADD CONSTRAINT "news_mentions_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_clusters" ADD CONSTRAINT "story_clusters_primary_content_item_id_fkey" FOREIGN KEY ("primary_content_item_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_content_item_a_fkey" FOREIGN KEY ("content_item_a") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_content_item_b_fkey" FOREIGN KEY ("content_item_b") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_assessments" ADD CONSTRAINT "evidence_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_assessments" ADD CONSTRAINT "evidence_assessments_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_summaries" ADD CONSTRAINT "generated_summaries_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_summaries" ADD CONSTRAINT "generated_summaries_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_claims" ADD CONSTRAINT "generated_claims_generated_summary_id_fkey" FOREIGN KEY ("generated_summary_id") REFERENCES "public"."generated_summaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_claims" ADD CONSTRAINT "generated_claims_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_feed_preferences" ADD CONSTRAINT "household_feed_preferences_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_preferences" ADD CONSTRAINT "user_topic_preferences_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_preferences" ADD CONSTRAINT "user_topic_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_trials" ADD CONSTRAINT "followed_trials_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."clinical_trials"("content_item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_trials" ADD CONSTRAINT "followed_trials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_treatments" ADD CONSTRAINT "followed_treatments_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followed_treatments" ADD CONSTRAINT "followed_treatments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_content" ADD CONSTRAINT "saved_content_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_content" ADD CONSTRAINT "saved_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_content" ADD CONSTRAINT "hidden_content_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_content" ADD CONSTRAINT "hidden_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_impressions" ADD CONSTRAINT "feed_impressions_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_impressions" ADD CONSTRAINT "feed_impressions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_grants" ADD CONSTRAINT "support_access_grants_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_grants" ADD CONSTRAINT "support_access_grants_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_grants" ADD CONSTRAINT "support_access_grants_support_user_id_fkey" FOREIGN KEY ("support_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digest_runs" ADD CONSTRAINT "digest_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educational_content" ADD CONSTRAINT "educational_content_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_observations" ADD CONSTRAINT "appointment_observations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_observations" ADD CONSTRAINT "appointment_observations_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_participants" ADD CONSTRAINT "decision_participants_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_participants" ADD CONSTRAINT "decision_participants_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "public"."household_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_documents" ADD CONSTRAINT "appointment_documents_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_documents" ADD CONSTRAINT "appointment_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_documents" ADD CONSTRAINT "decision_documents_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_documents" ADD CONSTRAINT "decision_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_contexts" ADD CONSTRAINT "observation_contexts_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_topics" ADD CONSTRAINT "content_topics_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_topics" ADD CONSTRAINT "content_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_cluster_members" ADD CONSTRAINT "story_cluster_members_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_cluster_members" ADD CONSTRAINT "story_cluster_members_story_cluster_id_fkey" FOREIGN KEY ("story_cluster_id") REFERENCES "public"."story_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ext_auth_user" ON "external_auth_identities" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_membership_user" ON "household_memberships" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_household_single_owner" ON "household_memberships" USING btree ("household_id" uuid_ops) WHERE ((role = 'owner'::household_role) AND is_active);--> statement-breakpoint
CREATE INDEX "idx_invitations_email" ON "invitations" USING btree ("email" citext_ops) WHERE (status = 'pending'::invitation_status);--> statement-breakpoint
CREATE INDEX "idx_invitations_household" ON "invitations" USING btree ("household_id" enum_ops,"status" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_care_recipients_household" ON "care_recipients" USING btree ("household_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consents_household" ON "consents" USING btree ("household_id" uuid_ops,"consent_type" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_consents_user" ON "consents" USING btree ("user_id" text_ops,"consent_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_appointments_household" ON "appointments" USING btree ("household_id" timestamptz_ops,"starts_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_appointment_questions" ON "appointment_questions" USING btree ("appointment_id" int4_ops,"position" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_briefs_household" ON "clinician_briefs" USING btree ("household_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_observations_category" ON "observations" USING btree ("household_id" uuid_ops,"category" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_observations_household_time" ON "observations" USING btree ("household_id" timestamptz_ops,"observed_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_observations_search" ON "observations" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_observation_revisions" ON "observation_revisions" USING btree ("observation_id" timestamptz_ops,"edited_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_observation_comments" ON "observation_comments" USING btree ("observation_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_medications_household" ON "medications" USING btree ("household_id" bool_ops,"is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_medication_events" ON "medication_events" USING btree ("household_id" timestamptz_ops,"occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_health_context" ON "health_context_events" USING btree ("household_id" date_ops,"occurred_on" date_ops);--> statement-breakpoint
CREATE INDEX "idx_share_links_brief" ON "clinician_share_links" USING btree ("brief_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_share_link_access" ON "share_link_access_events" USING btree ("share_link_id" timestamptz_ops,"accessed_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_assignee" ON "tasks" USING btree ("assignee_membership_id" uuid_ops) WHERE (status = ANY (ARRAY['open'::task_status, 'in_progress'::task_status]));--> statement-breakpoint
CREATE INDEX "idx_tasks_household_status" ON "tasks" USING btree ("household_id" uuid_ops,"status" uuid_ops,"due_on" date_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_search" ON "tasks" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_task_comments" ON "task_comments" USING btree ("task_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_decisions_household" ON "decisions" USING btree ("household_id" date_ops,"decided_on" date_ops);--> statement-breakpoint
CREATE INDEX "idx_decisions_search" ON "decisions" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_family_updates" ON "family_updates" USING btree ("household_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_family_update_comments" ON "family_update_comments" USING btree ("family_update_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_caregiver_checkins" ON "caregiver_checkins" USING btree ("household_id" timestamptz_ops,"user_id" uuid_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_safety_assessments" ON "safety_assessments" USING btree ("household_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_roadmap_items" ON "roadmap_items" USING btree ("household_id" enum_ops,"status" uuid_ops,"priority" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_comm_scripts_situation" ON "communication_scripts" USING btree ("situation_key" text_ops) WHERE is_active;--> statement-breakpoint
CREATE INDEX "idx_documents_expiry" ON "documents" USING btree ("expires_on" date_ops) WHERE ((expires_on IS NOT NULL) AND (deleted_at IS NULL));--> statement-breakpoint
CREATE INDEX "idx_documents_household" ON "documents" USING btree ("household_id" enum_ops,"record_type" enum_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_documents_search" ON "documents" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_document_access" ON "document_access_events" USING btree ("document_id" timestamptz_ops,"occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_extracted_text_search" ON "extracted_document_text" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_topics_kind" ON "topics" USING btree ("kind" enum_ops) WHERE is_active;--> statement-breakpoint
CREATE INDEX "idx_topics_name_trgm" ON "topics" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_ingestion_runs" ON "ingestion_runs" USING btree ("source_connector_id" timestamptz_ops,"started_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_source_records_ext" ON "source_records" USING btree ("source_connector_id" text_ops,"external_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_source_records_status" ON "source_records" USING btree ("processing_status" enum_ops) WHERE (processing_status = ANY (ARRAY['pending'::processing_status, 'failed'::processing_status]));--> statement-breakpoint
CREATE INDEX "idx_content_evidence" ON "content_items" USING btree ("evidence_strength" enum_ops,"actionability" enum_ops) WHERE (status = 'published'::content_status);--> statement-breakpoint
CREATE INDEX "idx_content_pubdate" ON "content_items" USING btree ("primary_publication_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_content_published" ON "content_items" USING btree ("published_at" timestamptz_ops) WHERE (status = 'published'::content_status);--> statement-breakpoint
CREATE INDEX "idx_content_search" ON "content_items" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_content_status" ON "content_items" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_content_type" ON "content_items" USING btree ("content_type" enum_ops,"status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_papers_pmcid" ON "research_papers" USING btree ("pmcid" text_ops) WHERE (pmcid IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_papers_doi" ON "research_papers" USING btree ("doi" text_ops) WHERE (doi IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_papers_pmid" ON "research_papers" USING btree ("pmid" text_ops) WHERE (pmid IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_trials_status" ON "clinical_trials" USING btree ("recruitment_status" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_trials_nct" ON "clinical_trials" USING btree ("nct_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_trial_locations" ON "clinical_trial_locations" USING btree ("content_item_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_trial_locations_geo" ON "clinical_trial_locations" USING btree ("country" text_ops,"state" text_ops,"city" text_ops);--> statement-breakpoint
CREATE INDEX "idx_trial_changes" ON "clinical_trial_changes" USING btree ("content_item_id" timestamptz_ops,"detected_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_grants_project" ON "research_grants" USING btree ("project_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_regulatory_action" ON "regulatory_updates" USING btree ("action_type" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_news_url" ON "news_mentions" USING btree ("article_url" text_ops);--> statement-breakpoint
CREATE INDEX "idx_dupes_pending" ON "duplicate_candidates" USING btree ("status" enum_ops) WHERE (status = 'pending'::duplicate_status);--> statement-breakpoint
CREATE INDEX "idx_evidence_item" ON "evidence_assessments" USING btree ("content_item_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_summaries_item" ON "generated_summaries" USING btree ("content_item_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_claims_summary" ON "generated_claims" USING btree ("generated_summary_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_reviews_pending" ON "content_reviews" USING btree ("status" timestamptz_ops,"created_at" timestamptz_ops) WHERE (status = 'pending'::review_status);--> statement-breakpoint
CREATE INDEX "idx_topic_prefs_user" ON "user_topic_preferences" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_followed_trials_item" ON "followed_trials" USING btree ("content_item_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_impressions_item" ON "feed_impressions" USING btree ("content_item_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_impressions_user" ON "feed_impressions" USING btree ("user_id" timestamptz_ops,"shown_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("user_id" uuid_ops) WHERE (read_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_deliveries_status" ON "notification_deliveries" USING btree ("status" enum_ops) WHERE (status = ANY (ARRAY['queued'::delivery_status, 'failed'::delivery_status]));--> statement-breakpoint
CREATE INDEX "idx_support_grants_active" ON "support_access_grants" USING btree ("household_id" uuid_ops) WHERE (revoked_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_digest_runs_user" ON "digest_runs" USING btree ("user_id" date_ops,"period_end" date_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_events" USING btree ("actor_user_id" timestamptz_ops,"occurred_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_household" ON "audit_events" USING btree ("household_id" uuid_ops,"occurred_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_type" ON "audit_events" USING btree ("event_type" timestamptz_ops,"occurred_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_failures_open" ON "job_failures" USING btree ("queue_name" text_ops,"failed_at" text_ops) WHERE (NOT resolved);--> statement-breakpoint
CREATE INDEX "idx_edu_status" ON "educational_content" USING btree ("category" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_resources_geo" ON "resource_directory_entries" USING btree ("state" text_ops,"city" text_ops) WHERE is_active;--> statement-breakpoint
CREATE INDEX "idx_resources_name_trgm" ON "resource_directory_entries" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_resources_search" ON "resource_directory_entries" USING gin ("search_tsv" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_resources_type" ON "resource_directory_entries" USING btree ("resource_type" text_ops) WHERE is_active;--> statement-breakpoint
CREATE INDEX "idx_content_sources_record" ON "content_sources" USING btree ("source_record_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_content_topics_topic" ON "content_topics" USING btree ("topic_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_cluster_members_item" ON "story_cluster_members" USING btree ("content_item_id" uuid_ops);
*/
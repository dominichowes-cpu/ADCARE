# ARCHITECTURE — Clarity Path (data layer, session 2)

Delivered so far: PostgreSQL schema in db/migrations/*.sql (apply in filename
order), seed data in db/seed.sql, design rationale in db/README.md.

Domain map:
- Identity & tenancy: users, external_auth_identities, households,
  household_memberships, invitations, care_recipients, consents, admin_role*
- Care: observations*, medications*, health_context_events, appointments*,
  clinician_briefs, clinician_share_links, tasks*, decisions*, family_updates*,
  caregiver_checkins, safety_*, roadmap_*, communication_scripts
- Records vault: documents, document_versions, document_permissions,
  document_access_events, extracted_document_text
- Research platform: source_connectors → source_queries → source_query_versions →
  ingestion_runs/source_cursors → source_records → content_items (+ subtype
  tables research_papers, clinical_trials(+locations,+changes), research_grants,
  regulatory_updates, news_mentions) → story_clusters, duplicate_candidates,
  evidence_assessments, generated_summaries(+claims), content_versions/reviews,
  prompt_versions, topics/topic_synonyms/content_topics
- Personalization: user_topic_preferences, household_feed_preferences,
  followed_trials, followed_treatments, saved_content, hidden_content,
  feed_impressions
- Notifications: notification_preferences, notifications,
  notification_deliveries, digest_runs
- Ops: audit_events, feature_flags, system_settings, job_failures,
  support_access_grants, resource_directory_entries, educational_content

Planned app architecture (next sessions): per master prompt §4 — Next.js App
Router monorepo (pnpm), Drizzle over this schema, BullMQ worker, Auth0 + dev
login, MinIO/S3, Mailpit/provider email, provider-agnostic AI layer.

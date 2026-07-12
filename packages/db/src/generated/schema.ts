import { pgTable, unique, uuid, text, jsonb, boolean, timestamp, index, foreignKey, uniqueIndex, check, smallint, integer, date, inet, numeric, bigint, doublePrecision, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const actionability = pgEnum("actionability", ['no_action', 'worth_watching', 'ask_clinician', 'care_planning_relevant', 'official_safety', 'administrative'])
export const adminRoleKey = pgEnum("admin_role_key", ['super_admin', 'clinical_editor', 'content_editor', 'ingestion_operator', 'support_agent'])
export const contentStatus = pgEnum("content_status", ['ingested', 'normalized', 'enrichment_pending', 'ai_processing', 'draft', 'needs_review', 'approved', 'published', 'rejected', 'archived', 'error'])
export const contentType = pgEnum("content_type", ['research_paper', 'clinical_trial', 'research_grant', 'regulatory_update', 'news_mention', 'caregiving_guidance', 'system_announcement'])
export const contextFactor = pgEnum("context_factor", ['poor_sleep', 'travel', 'illness', 'medication_change', 'stress', 'alcohol', 'pain', 'dehydration', 'disrupted_routine', 'other'])
export const deliveryStatus = pgEnum("delivery_status", ['queued', 'sent', 'delivered', 'failed', 'suppressed'])
export const documentAccessAction = pgEnum("document_access_action", ['view', 'download', 'delete', 'restore', 'share_link_view'])
export const documentRecordType = pgEnum("document_record_type", ['medication_list', 'lab_result', 'imaging_report', 'neuropsych_report', 'visit_summary', 'insurance', 'advance_directive', 'healthcare_poa', 'financial_poa', 'ltc_policy', 'emergency_info', 'other'])
export const duplicateStatus = pgEnum("duplicate_status", ['pending', 'merged', 'rejected'])
export const evidenceStrength = pgEnum("evidence_strength", ['strong', 'moderate', 'preliminary', 'very_preliminary', 'not_applicable', 'insufficient_information'])
export const familyUpdateType = pgEnum("family_update_type", ['appointment_update', 'observation_summary', 'task_update', 'decision_update', 'general_note'])
export const healthContextType = pgEnum("health_context_type", ['sleep_quality', 'cpap_use', 'illness', 'fall', 'routine_disruption', 'medical_event', 'other'])
export const householdRole = pgEnum("household_role", ['owner', 'care_coordinator', 'contributor', 'read_only', 'care_recipient'])
export const ingestionRunStatus = pgEnum("ingestion_run_status", ['running', 'succeeded', 'failed', 'partial'])
export const invitationStatus = pgEnum("invitation_status", ['pending', 'accepted', 'expired', 'revoked'])
export const medicationEventType = pgEnum("medication_event_type", ['started', 'stopped', 'dose_changed', 'missed_dose', 'refill_problem', 'possible_side_effect', 'family_note'])
export const navigationPhase = pgEnum("navigation_phase", ['noticing_changes', 'preparing_evaluation', 'evaluation_underway', 'mci_or_uncertain', 'diagnosed_independent', 'increasing_assistance', 'advanced_care', 'not_sure'])
export const notificationChannel = pgEnum("notification_channel", ['in_app', 'email'])
export const observationCategory = pgEnum("observation_category", ['memory_repetition', 'word_finding', 'orientation', 'planning_organization', 'medication_management', 'finances', 'driving_navigation', 'cooking_household', 'personal_care', 'mood_anxiety', 'sleep', 'balance_falls', 'illness_infection', 'social_engagement', 'positive_stable', 'other'])
export const populationType = pgEnum("population_type", ['human', 'animal', 'laboratory', 'mixed', 'unknown'])
export const priorityLevel = pgEnum("priority_level", ['low', 'medium', 'high'])
export const processingStatus = pgEnum("processing_status", ['pending', 'processing', 'processed', 'failed', 'skipped'])
export const reviewStatus = pgEnum("review_status", ['pending', 'approved', 'changes_requested', 'rejected'])
export const roadmapCategory = pgEnum("roadmap_category", ['medical_evaluation', 'daily_life', 'safety', 'legal_planning', 'financial_planning', 'family_coordination', 'caregiver_support', 'home_preparation', 'long_term_planning'])
export const roadmapStatus = pgEnum("roadmap_status", ['suggested', 'in_progress', 'completed', 'deferred', 'dismissed'])
export const studyCategory = pgEnum("study_category", ['regulatory_action', 'clinical_guideline', 'systematic_review', 'meta_analysis', 'randomized_controlled_trial', 'phase_3_trial', 'phase_2_trial', 'phase_1_trial', 'other_interventional', 'prospective_cohort', 'retrospective_observational', 'cross_sectional', 'case_control', 'case_series', 'case_report', 'qualitative_study', 'caregiver_intervention', 'preclinical_animal', 'in_vitro_laboratory', 'computational_modeling', 'preprint', 'expert_commentary', 'news_report', 'grant_announcement', 'unknown'])
export const taskStatus = pgEnum("task_status", ['open', 'in_progress', 'completed', 'deferred', 'cancelled'])
export const topicKind = pgEnum("topic_kind", ['topic', 'dementia_type', 'treatment', 'institution', 'country'])
export const trialChangeType = pgEnum("trial_change_type", ['newly_posted', 'recruitment_opened', 'recruitment_closed', 'status_changed', 'location_added', 'results_posted', 'completion_date_changed', 'eligibility_changed', 'other'])
export const visibilityLevel = pgEnum("visibility_level", ['household', 'coordinators_only', 'private'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text("email").notNull(),
	displayName: text("display_name").notNull(),
	pronouns: text(),
	timezone: text().default('America/Chicago').notNull(),
	quietHours: jsonb("quiet_hours"),
	isActive: boolean("is_active").default(true).notNull(),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const externalAuthIdentities = pgTable("external_auth_identities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	provider: text().notNull(),
	providerSubject: text("provider_subject").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ext_auth_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "external_auth_identities_user_id_fkey"
		}).onDelete("cascade"),
	unique("external_auth_identities_provider_provider_subject_key").on(table.provider, table.providerSubject),
]);

export const households = pgTable("households", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	navigationPhase: navigationPhase("navigation_phase").default('not_sure').notNull(),
	priorities: text().array().default([""]).notNull(),
	onboardingState: jsonb("onboarding_state"),
	createdBy: uuid("created_by"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "households_created_by_fkey"
		}).onDelete("set null"),
]);

export const householdMemberships = pgTable("household_memberships", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: householdRole().notNull(),
	relationship: text(),
	canInvite: boolean("can_invite").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_membership_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_household_single_owner").using("btree", table.householdId.asc().nullsLast().op("uuid_ops")).where(sql`((role = 'owner'::household_role) AND is_active)`),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "household_memberships_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "household_memberships_user_id_fkey"
		}).onDelete("cascade"),
	unique("household_memberships_household_id_user_id_key").on(table.householdId, table.userId),
]);

export const invitations = pgTable("invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	email: text("email").notNull(),
	role: householdRole().notNull(),
	invitedBy: uuid("invited_by").notNull(),
	tokenHash: text("token_hash").notNull(),
	status: invitationStatus().default('pending').notNull(),
	message: text(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	acceptedBy: uuid("accepted_by"),
	acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_invitations_email").using("btree", table.email.asc().nullsLast().op("citext_ops")).where(sql`(status = 'pending'::invitation_status)`),
	index("idx_invitations_household").using("btree", table.householdId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.acceptedBy],
			foreignColumns: [users.id],
			name: "invitations_accepted_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "invitations_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "invitations_invited_by_fkey"
		}).onDelete("cascade"),
	unique("invitations_token_hash_key").on(table.tokenHash),
]);

export const careRecipients = pgTable("care_recipients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	preferredName: text("preferred_name").notNull(),
	birthYear: smallint("birth_year"),
	generalLocation: text("general_location"),
	postalCode: text("postal_code"),
	pronouns: text(),
	userId: uuid("user_id"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_care_recipients_household").using("btree", table.householdId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "care_recipients_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "care_recipients_user_id_fkey"
		}).onDelete("set null"),
	unique("care_recipients_user_id_key").on(table.userId),
	check("care_recipients_birth_year_check", sql`(birth_year >= 1900) AND (birth_year <= 2100)`),
]);

export const consents = pgTable("consents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id"),
	userId: uuid("user_id"),
	consentType: text("consent_type").notNull(),
	granted: boolean().notNull(),
	grantedAt: timestamp("granted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
	details: jsonb(),
}, (table) => [
	index("idx_consents_household").using("btree", table.householdId.asc().nullsLast().op("uuid_ops"), table.consentType.asc().nullsLast().op("uuid_ops")),
	index("idx_consents_user").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.consentType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "consents_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "consents_user_id_fkey"
		}).onDelete("cascade"),
	check("consents_check", sql`(household_id IS NOT NULL) OR (user_id IS NOT NULL)`),
]);

export const adminRoleAssignments = pgTable("admin_role_assignments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	adminRoleId: uuid("admin_role_id").notNull(),
	grantedBy: uuid("granted_by"),
	grantedAt: timestamp("granted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.adminRoleId],
			foreignColumns: [adminRoles.id],
			name: "admin_role_assignments_admin_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: "admin_role_assignments_granted_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admin_role_assignments_user_id_fkey"
		}).onDelete("cascade"),
	unique("admin_role_assignments_user_id_admin_role_id_key").on(table.userId, table.adminRoleId),
]);

export const adminRoles = pgTable("admin_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: adminRoleKey().notNull(),
	description: text().notNull(),
}, (table) => [
	unique("admin_roles_key_key").on(table.key),
]);

export const appointments = pgTable("appointments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id").notNull(),
	startsAt: timestamp("starts_at", { withTimezone: true, mode: 'string' }).notNull(),
	clinicianName: text("clinician_name"),
	specialty: text(),
	location: text(),
	purpose: text(),
	attendeeMembershipId: uuid("attendee_membership_id"),
	notes: text(),
	nextAppointmentId: uuid("next_appointment_id"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_appointments_household").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.startsAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.attendeeMembershipId],
			foreignColumns: [householdMemberships.id],
			name: "appointments_attendee_membership_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "appointments_care_recipient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "appointments_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "appointments_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.nextAppointmentId],
			foreignColumns: [table.id],
			name: "appointments_next_appointment_id_fkey"
		}).onDelete("set null"),
]);

export const appointmentQuestions = pgTable("appointment_questions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	question: text().notNull(),
	position: integer().default(0).notNull(),
	addedBy: uuid("added_by"),
	answerNote: text("answer_note"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_appointment_questions").using("btree", table.appointmentId.asc().nullsLast().op("int4_ops"), table.position.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.addedBy],
			foreignColumns: [users.id],
			name: "appointment_questions_added_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "appointment_questions_appointment_id_fkey"
		}).onDelete("cascade"),
]);

export const clinicianBriefs = pgTable("clinician_briefs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	dateRangeStart: date("date_range_start").notNull(),
	dateRangeEnd: date("date_range_end").notNull(),
	contentSnapshot: jsonb("content_snapshot").notNull(),
	pdfStorageKey: text("pdf_storage_key"),
	generatedBy: uuid("generated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_briefs_household").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "clinician_briefs_appointment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.generatedBy],
			foreignColumns: [users.id],
			name: "clinician_briefs_generated_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "clinician_briefs_household_id_fkey"
		}).onDelete("cascade"),
	check("clinician_briefs_check", sql`date_range_end >= date_range_start`),
]);

export const observations = pgTable("observations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id").notNull(),
	category: observationCategory().notNull(),
	description: text().notNull(),
	observedAt: timestamp("observed_at", { withTimezone: true, mode: 'string' }).notNull(),
	timeApproximate: boolean("time_approximate").default(false).notNull(),
	observerMembershipId: uuid("observer_membership_id"),
	locationContext: text("location_context"),
	durationMinutes: integer("duration_minutes"),
	isRecurring: boolean("is_recurring").default(false).notNull(),
	functionalImpact: text("functional_impact"),
	visibility: visibilityLevel().default('household').notNull(),
	includeInBrief: boolean("include_in_brief").default(false).notNull(),
	attachmentDocumentId: uuid("attachment_document_id"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_observations_category").using("btree", table.householdId.asc().nullsLast().op("uuid_ops"), table.category.asc().nullsLast().op("enum_ops")),
	index("idx_observations_household_time").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.observedAt.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.attachmentDocumentId],
			foreignColumns: [documents.id],
			name: "fk_observations_attachment"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "observations_care_recipient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "observations_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "observations_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.observerMembershipId],
			foreignColumns: [householdMemberships.id],
			name: "observations_observer_membership_id_fkey"
		}).onDelete("set null"),
	check("observations_duration_minutes_check", sql`duration_minutes > 0`),
]);

export const observationRevisions = pgTable("observation_revisions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	observationId: uuid("observation_id").notNull(),
	snapshot: jsonb().notNull(),
	editedBy: uuid("edited_by"),
	editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_observation_revisions").using("btree", table.observationId.asc().nullsLast().op("timestamptz_ops"), table.editedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.editedBy],
			foreignColumns: [users.id],
			name: "observation_revisions_edited_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.observationId],
			foreignColumns: [observations.id],
			name: "observation_revisions_observation_id_fkey"
		}).onDelete("cascade"),
]);

export const observationComments = pgTable("observation_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	observationId: uuid("observation_id").notNull(),
	authorId: uuid("author_id").notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_observation_comments").using("btree", table.observationId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "observation_comments_author_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.observationId],
			foreignColumns: [observations.id],
			name: "observation_comments_observation_id_fkey"
		}).onDelete("cascade"),
]);

export const medications = pgTable("medications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id").notNull(),
	name: text().notNull(),
	genericName: text("generic_name"),
	dosageText: text("dosage_text"),
	frequencyText: text("frequency_text"),
	prescriber: text(),
	reason: text(),
	startedOn: date("started_on"),
	endedOn: date("ended_on"),
	isActive: boolean("is_active").default(true).notNull(),
	infoSource: text("info_source"),
	lastConfirmedOn: date("last_confirmed_on"),
	notes: text(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_medications_household").using("btree", table.householdId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "medications_care_recipient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "medications_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "medications_household_id_fkey"
		}).onDelete("cascade"),
	check("medications_check", sql`(ended_on IS NULL) OR (started_on IS NULL) OR (ended_on >= started_on)`),
]);

export const medicationEvents = pgTable("medication_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	medicationId: uuid("medication_id").notNull(),
	eventType: medicationEventType("event_type").notNull(),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).notNull(),
	note: text(),
	recordedBy: uuid("recorded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_medication_events").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "medication_events_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.medicationId],
			foreignColumns: [medications.id],
			name: "medication_events_medication_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [users.id],
			name: "medication_events_recorded_by_fkey"
		}).onDelete("set null"),
]);

export const healthContextEvents = pgTable("health_context_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id").notNull(),
	contextType: healthContextType("context_type").notNull(),
	occurredOn: date("occurred_on").notNull(),
	value: jsonb(),
	note: text(),
	recordedBy: uuid("recorded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_health_context").using("btree", table.householdId.asc().nullsLast().op("date_ops"), table.occurredOn.desc().nullsFirst().op("date_ops")),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "health_context_events_care_recipient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "health_context_events_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [users.id],
			name: "health_context_events_recorded_by_fkey"
		}).onDelete("set null"),
]);

export const clinicianShareLinks = pgTable("clinician_share_links", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	briefId: uuid("brief_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	label: text(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_share_links_brief").using("btree", table.briefId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.briefId],
			foreignColumns: [clinicianBriefs.id],
			name: "clinician_share_links_brief_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "clinician_share_links_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "clinician_share_links_household_id_fkey"
		}).onDelete("cascade"),
	unique("clinician_share_links_token_hash_key").on(table.tokenHash),
]);

export const shareLinkAccessEvents = pgTable("share_link_access_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shareLinkId: uuid("share_link_id").notNull(),
	accessedAt: timestamp("accessed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: inet("ip_address"),
	userAgent: text("user_agent"),
}, (table) => [
	index("idx_share_link_access").using("btree", table.shareLinkId.asc().nullsLast().op("timestamptz_ops"), table.accessedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.shareLinkId],
			foreignColumns: [clinicianShareLinks.id],
			name: "share_link_access_events_share_link_id_fkey"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id"),
	title: text().notNull(),
	description: text(),
	category: roadmapCategory(),
	assigneeMembershipId: uuid("assignee_membership_id"),
	dueOn: date("due_on"),
	recurrenceRule: text("recurrence_rule"),
	priority: priorityLevel().default('medium').notNull(),
	status: taskStatus().default('open').notNull(),
	appointmentId: uuid("appointment_id"),
	roadmapItemId: uuid("roadmap_item_id"),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	completedBy: uuid("completed_by"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_tasks_assignee").using("btree", table.assigneeMembershipId.asc().nullsLast().op("uuid_ops")).where(sql`(status = ANY (ARRAY['open'::task_status, 'in_progress'::task_status]))`),
	index("idx_tasks_household_status").using("btree", table.householdId.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("uuid_ops"), table.dueOn.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.roadmapItemId],
			foreignColumns: [roadmapItems.id],
			name: "fk_tasks_roadmap_item"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "tasks_appointment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assigneeMembershipId],
			foreignColumns: [householdMemberships.id],
			name: "tasks_assignee_membership_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "tasks_care_recipient_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.completedBy],
			foreignColumns: [users.id],
			name: "tasks_completed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "tasks_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "tasks_household_id_fkey"
		}).onDelete("cascade"),
]);

export const taskComments = pgTable("task_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	authorId: uuid("author_id").notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_task_comments").using("btree", table.taskId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "task_comments_author_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_comments_task_id_fkey"
		}).onDelete("cascade"),
]);

export const decisions = pgTable("decisions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	title: text().notNull(),
	decidedOn: date("decided_on").notNull(),
	background: text(),
	agreedPlan: text("agreed_plan").notNull(),
	reconsiderConditions: text("reconsider_conditions"),
	followUpOn: date("follow_up_on"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_decisions_household").using("btree", table.householdId.asc().nullsLast().op("date_ops"), table.decidedOn.desc().nullsFirst().op("date_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "decisions_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "decisions_household_id_fkey"
		}).onDelete("cascade"),
]);

export const decisionComments = pgTable("decision_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	decisionId: uuid("decision_id").notNull(),
	authorId: uuid("author_id").notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "decision_comments_author_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.decisionId],
			foreignColumns: [decisions.id],
			name: "decision_comments_decision_id_fkey"
		}).onDelete("cascade"),
]);

export const familyUpdates = pgTable("family_updates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	authorId: uuid("author_id").notNull(),
	updateType: familyUpdateType("update_type").notNull(),
	title: text(),
	body: text().notNull(),
	appointmentId: uuid("appointment_id"),
	taskId: uuid("task_id"),
	decisionId: uuid("decision_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_family_updates").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "family_updates_appointment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "family_updates_author_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.decisionId],
			foreignColumns: [decisions.id],
			name: "family_updates_decision_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "family_updates_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "family_updates_task_id_fkey"
		}).onDelete("set null"),
]);

export const familyUpdateComments = pgTable("family_update_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	familyUpdateId: uuid("family_update_id").notNull(),
	authorId: uuid("author_id").notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_family_update_comments").using("btree", table.familyUpdateId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "family_update_comments_author_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.familyUpdateId],
			foreignColumns: [familyUpdates.id],
			name: "family_update_comments_family_update_id_fkey"
		}).onDelete("cascade"),
]);

export const caregiverCheckins = pgTable("caregiver_checkins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	userId: uuid("user_id").notNull(),
	caregivingHoursWeek: numeric("caregiving_hours_week", { precision: 5, scale:  1 }),
	sleepDisruption: smallint("sleep_disruption"),
	workInterference: smallint("work_interference"),
	stressLevel: smallint("stress_level"),
	familyConflict: smallint("family_conflict"),
	hasBackupHelp: boolean("has_backup_help"),
	daysSinceBreak: integer("days_since_break"),
	feelingOverwhelmed: smallint("feeling_overwhelmed"),
	immediateSafetyConcern: boolean("immediate_safety_concern").default(false).notNull(),
	freeText: text("free_text"),
	generatedSummary: text("generated_summary"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_caregiver_checkins").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.userId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "caregiver_checkins_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "caregiver_checkins_user_id_fkey"
		}).onDelete("cascade"),
	check("caregiver_checkins_caregiving_hours_week_check", sql`caregiving_hours_week >= (0)::numeric`),
	check("caregiver_checkins_days_since_break_check", sql`days_since_break >= 0`),
	check("caregiver_checkins_family_conflict_check", sql`(family_conflict >= 0) AND (family_conflict <= 4)`),
	check("caregiver_checkins_feeling_overwhelmed_check", sql`(feeling_overwhelmed >= 0) AND (feeling_overwhelmed <= 4)`),
	check("caregiver_checkins_sleep_disruption_check", sql`(sleep_disruption >= 0) AND (sleep_disruption <= 4)`),
	check("caregiver_checkins_stress_level_check", sql`(stress_level >= 0) AND (stress_level <= 4)`),
	check("caregiver_checkins_work_interference_check", sql`(work_interference >= 0) AND (work_interference <= 4)`),
]);

export const safetyCheckupTemplates = pgTable("safety_checkup_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	version: integer().default(1).notNull(),
	title: text().notNull(),
	introText: text("intro_text"),
	questions: jsonb().notNull(),
	guidance: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "safety_checkup_templates_created_by_fkey"
		}).onDelete("set null"),
	unique("safety_checkup_templates_key_version_key").on(table.key, table.version),
]);

export const safetyAssessments = pgTable("safety_assessments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id").notNull(),
	templateId: uuid("template_id").notNull(),
	startedBy: uuid("started_by"),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_safety_assessments").using("btree", table.householdId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "safety_assessments_care_recipient_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "safety_assessments_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.startedBy],
			foreignColumns: [users.id],
			name: "safety_assessments_started_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [safetyCheckupTemplates.id],
			name: "safety_assessments_template_id_fkey"
		}).onDelete("restrict"),
]);

export const safetyResponses = pgTable("safety_responses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	assessmentId: uuid("assessment_id").notNull(),
	questionKey: text("question_key").notNull(),
	response: jsonb().notNull(),
	note: text(),
}, (table) => [
	foreignKey({
			columns: [table.assessmentId],
			foreignColumns: [safetyAssessments.id],
			name: "safety_responses_assessment_id_fkey"
		}).onDelete("cascade"),
	unique("safety_responses_assessment_id_question_key_key").on(table.assessmentId, table.questionKey),
]);

export const roadmapTemplates = pgTable("roadmap_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	explanation: text().notNull(),
	category: roadmapCategory().notNull(),
	applicablePhases: navigationPhase("applicable_phases").array().notNull(),
	defaultPriority: priorityLevel("default_priority").default('medium').notNull(),
	suggestedTiming: text("suggested_timing"),
	educationalSlug: text("educational_slug"),
	requiresRecordType: documentRecordType("requires_record_type"),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "roadmap_templates_created_by_fkey"
		}).onDelete("set null"),
]);

export const roadmapItems = pgTable("roadmap_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	templateId: uuid("template_id"),
	title: text().notNull(),
	explanation: text().notNull(),
	phase: navigationPhase().notNull(),
	category: roadmapCategory().notNull(),
	priority: priorityLevel().default('medium').notNull(),
	status: roadmapStatus().default('suggested').notNull(),
	suggestedTiming: text("suggested_timing"),
	assigneeMembershipId: uuid("assignee_membership_id"),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	deferredUntil: date("deferred_until"),
	dismissedReason: text("dismissed_reason"),
	dismissedAt: timestamp("dismissed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_roadmap_items").using("btree", table.householdId.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("uuid_ops"), table.priority.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assigneeMembershipId],
			foreignColumns: [householdMemberships.id],
			name: "roadmap_items_assignee_membership_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "roadmap_items_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [roadmapTemplates.id],
			name: "roadmap_items_template_id_fkey"
		}).onDelete("set null"),
]);

export const communicationScripts = pgTable("communication_scripts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	situationKey: text("situation_key").notNull(),
	title: text().notNull(),
	body: text().notNull(),
	guidance: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_comm_scripts_situation").using("btree", table.situationKey.asc().nullsLast().op("text_ops")).where(sql`is_active`),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "communication_scripts_created_by_fkey"
		}).onDelete("set null"),
]);

export const savedScripts = pgTable("saved_scripts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	scriptId: uuid("script_id").notNull(),
	personalizedBody: text("personalized_body"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scriptId],
			foreignColumns: [communicationScripts.id],
			name: "saved_scripts_script_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_scripts_user_id_fkey"
		}).onDelete("cascade"),
	unique("saved_scripts_user_id_script_id_key").on(table.userId, table.scriptId),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	householdId: uuid("household_id").notNull(),
	careRecipientId: uuid("care_recipient_id"),
	recordType: documentRecordType("record_type").notNull(),
	title: text().notNull(),
	storageKey: text("storage_key").notNull(),
	mimeType: text("mime_type").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	byteSize: bigint("byte_size", { mode: "number" }).notNull(),
	documentDate: date("document_date"),
	issuingOrganization: text("issuing_organization"),
	expiresOn: date("expires_on"),
	tags: text().array().default([""]).notNull(),
	visibility: visibilityLevel().default('household').notNull(),
	uploadedBy: uuid("uploaded_by"),
	virusScanStatus: text("virus_scan_status").default('pending').notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_documents_expiry").using("btree", table.expiresOn.asc().nullsLast().op("date_ops")).where(sql`((expires_on IS NOT NULL) AND (deleted_at IS NULL))`),
	index("idx_documents_household").using("btree", table.householdId.asc().nullsLast().op("enum_ops"), table.recordType.asc().nullsLast().op("enum_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.careRecipientId],
			foreignColumns: [careRecipients.id],
			name: "documents_care_recipient_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "documents_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "documents_uploaded_by_fkey"
		}).onDelete("set null"),
	check("documents_byte_size_check", sql`byte_size >= 0`),
]);

export const documentVersions = pgTable("document_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid("document_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	storageKey: text("storage_key").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	byteSize: bigint("byte_size", { mode: "number" }).notNull(),
	uploadedBy: uuid("uploaded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_versions_document_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "document_versions_uploaded_by_fkey"
		}).onDelete("set null"),
	unique("document_versions_document_id_version_number_key").on(table.documentId, table.versionNumber),
	check("document_versions_byte_size_check", sql`byte_size >= 0`),
]);

export const documentPermissions = pgTable("document_permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid("document_id").notNull(),
	membershipId: uuid("membership_id").notNull(),
	canView: boolean("can_view").default(true).notNull(),
	grantedBy: uuid("granted_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_permissions_document_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: "document_permissions_granted_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.membershipId],
			foreignColumns: [householdMemberships.id],
			name: "document_permissions_membership_id_fkey"
		}).onDelete("cascade"),
	unique("document_permissions_document_id_membership_id_key").on(table.documentId, table.membershipId),
]);

export const documentAccessEvents = pgTable("document_access_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid("document_id").notNull(),
	userId: uuid("user_id"),
	shareLinkId: uuid("share_link_id"),
	action: documentAccessAction().notNull(),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: inet("ip_address"),
}, (table) => [
	index("idx_document_access").using("btree", table.documentId.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_access_events_document_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shareLinkId],
			foreignColumns: [clinicianShareLinks.id],
			name: "document_access_events_share_link_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "document_access_events_user_id_fkey"
		}).onDelete("set null"),
]);

export const extractedDocumentText = pgTable("extracted_document_text", {
	documentId: uuid("document_id").primaryKey().notNull(),
	extractedText: text("extracted_text").notNull(),
	extractionMethod: text("extraction_method").notNull(),
	consentId: uuid("consent_id"),
	extractedAt: timestamp("extracted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.consentId],
			foreignColumns: [consents.id],
			name: "extracted_document_text_consent_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "extracted_document_text_document_id_fkey"
		}).onDelete("cascade"),
]);

export const topics = pgTable("topics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	kind: topicKind().default('topic').notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_topics_kind").using("btree", table.kind.asc().nullsLast().op("enum_ops")).where(sql`is_active`),
	index("idx_topics_name_trgm").using("gin", table.name.asc().nullsLast().op("gin_trgm_ops")),
	unique("topics_slug_key").on(table.slug),
]);

export const topicSynonyms = pgTable("topic_synonyms", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	topicId: uuid("topic_id").notNull(),
	synonym: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "topic_synonyms_topic_id_fkey"
		}).onDelete("cascade"),
	unique("topic_synonyms_topic_id_synonym_key").on(table.topicId, table.synonym),
]);

export const sourceConnectors = pgTable("source_connectors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceKey: text("source_key").notNull(),
	displayName: text("display_name").notNull(),
	enabled: boolean().default(true).notNull(),
	scheduleCron: text("schedule_cron").notNull(),
	throttleConfig: jsonb("throttle_config").default({}).notNull(),
	connectorVersion: text("connector_version").default('1.0.0').notNull(),
	lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true, mode: 'string' }),
	lastHealthStatus: text("last_health_status"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("source_connectors_source_key_key").on(table.sourceKey),
]);

export const sourceQueries = pgTable("source_queries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceConnectorId: uuid("source_connector_id").notNull(),
	topicId: uuid("topic_id"),
	name: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sourceConnectorId],
			foreignColumns: [sourceConnectors.id],
			name: "source_queries_source_connector_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "source_queries_topic_id_fkey"
		}).onDelete("set null"),
]);

export const sourceQueryVersions = pgTable("source_query_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceQueryId: uuid("source_query_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	queryBody: jsonb("query_body").notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "source_query_versions_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceQueryId],
			foreignColumns: [sourceQueries.id],
			name: "source_query_versions_source_query_id_fkey"
		}).onDelete("cascade"),
	unique("source_query_versions_source_query_id_version_number_key").on(table.sourceQueryId, table.versionNumber),
]);

export const sourceCursors = pgTable("source_cursors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceConnectorId: uuid("source_connector_id").notNull(),
	sourceQueryId: uuid("source_query_id"),
	cursorState: jsonb("cursor_state").default({}).notNull(),
	lastSuccessAt: timestamp("last_success_at", { withTimezone: true, mode: 'string' }),
	lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.sourceConnectorId],
			foreignColumns: [sourceConnectors.id],
			name: "source_cursors_source_connector_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceQueryId],
			foreignColumns: [sourceQueries.id],
			name: "source_cursors_source_query_id_fkey"
		}).onDelete("cascade"),
	unique("source_cursors_source_connector_id_source_query_id_key").on(table.sourceConnectorId, table.sourceQueryId),
]);

export const ingestionRuns = pgTable("ingestion_runs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceConnectorId: uuid("source_connector_id").notNull(),
	sourceQueryVersionId: uuid("source_query_version_id"),
	status: ingestionRunStatus().default('running').notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	finishedAt: timestamp("finished_at", { withTimezone: true, mode: 'string' }),
	recordsFetched: integer("records_fetched").default(0).notNull(),
	recordsNew: integer("records_new").default(0).notNull(),
	errorCount: integer("error_count").default(0).notNull(),
	errorDetail: jsonb("error_detail"),
	jobId: text("job_id"),
}, (table) => [
	index("idx_ingestion_runs").using("btree", table.sourceConnectorId.asc().nullsLast().op("timestamptz_ops"), table.startedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.sourceConnectorId],
			foreignColumns: [sourceConnectors.id],
			name: "ingestion_runs_source_connector_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceQueryVersionId],
			foreignColumns: [sourceQueryVersions.id],
			name: "ingestion_runs_source_query_version_id_fkey"
		}).onDelete("set null"),
]);

export const sourceRecords = pgTable("source_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceConnectorId: uuid("source_connector_id").notNull(),
	externalId: text("external_id").notNull(),
	sourceUrl: text("source_url"),
	rawPayload: jsonb("raw_payload").notNull(),
	rawHash: text("raw_hash").notNull(),
	retrievedAt: timestamp("retrieved_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true, mode: 'string' }),
	connectorVersion: text("connector_version").notNull(),
	sourceQueryVersionId: uuid("source_query_version_id"),
	rightsStatus: text("rights_status"),
	normalized: jsonb(),
	processingStatus: processingStatus("processing_status").default('pending').notNull(),
	processingError: text("processing_error"),
}, (table) => [
	index("idx_source_records_ext").using("btree", table.sourceConnectorId.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("uuid_ops")),
	index("idx_source_records_status").using("btree", table.processingStatus.asc().nullsLast().op("enum_ops")).where(sql`(processing_status = ANY (ARRAY['pending'::processing_status, 'failed'::processing_status]))`),
	foreignKey({
			columns: [table.sourceConnectorId],
			foreignColumns: [sourceConnectors.id],
			name: "source_records_source_connector_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceQueryVersionId],
			foreignColumns: [sourceQueryVersions.id],
			name: "source_records_source_query_version_id_fkey"
		}).onDelete("set null"),
	unique("source_records_source_connector_id_external_id_raw_hash_key").on(table.sourceConnectorId, table.externalId, table.rawHash),
]);

export const contentItems = pgTable("content_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentType: contentType("content_type").notNull(),
	status: contentStatus().default('ingested').notNull(),
	originalTitle: text("original_title"),
	displayHeadline: text("display_headline"),
	plainSubheading: text("plain_subheading"),
	slug: text(),
	primaryPublicationDate: date("primary_publication_date"),
	lastSourceUpdate: timestamp("last_source_update", { withTimezone: true, mode: 'string' }),
	firstIngestedAt: timestamp("first_ingested_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	primarySourceKey: text("primary_source_key"),
	primarySourceUrl: text("primary_source_url"),
	peerReviewed: boolean("peer_reviewed"),
	populationType: populationType("population_type").default('unknown').notNull(),
	studyCategory: studyCategory("study_category").default('unknown').notNull(),
	evidenceStrength: evidenceStrength("evidence_strength").default('insufficient_information').notNull(),
	actionability: actionability().default('no_action').notNull(),
	sampleSize: integer("sample_size"),
	humanReviewStatus: reviewStatus("human_review_status"),
	requiresHumanReview: boolean("requires_human_review").default(false).notNull(),
	generatedSummaryStatus: text("generated_summary_status"),
	rightsStatus: text("rights_status"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_evidence").using("btree", table.evidenceStrength.asc().nullsLast().op("enum_ops"), table.actionability.asc().nullsLast().op("enum_ops")).where(sql`(status = 'published'::content_status)`),
	index("idx_content_pubdate").using("btree", table.primaryPublicationDate.desc().nullsFirst().op("date_ops")),
	index("idx_content_published").using("btree", table.publishedAt.desc().nullsFirst().op("timestamptz_ops")).where(sql`(status = 'published'::content_status)`),
	index("idx_content_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_content_type").using("btree", table.contentType.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	unique("content_items_slug_key").on(table.slug),
	check("content_items_sample_size_check", sql`sample_size >= 0`),
]);

export const researchPapers = pgTable("research_papers", {
	contentItemId: uuid("content_item_id").primaryKey().notNull(),
	doi: text(),
	pmid: text(),
	pmcid: text(),
	openalexId: text("openalex_id"),
	journal: text(),
	authors: jsonb(),
	abstract: text(),
	publicationTypes: text("publication_types").array().default([""]).notNull(),
	meshTerms: text("mesh_terms").array().default([""]).notNull(),
	language: text(),
	isPreprint: boolean("is_preprint").default(false).notNull(),
	retractionStatus: text("retraction_status"),
	openAccess: boolean("open_access"),
	license: text(),
	citationCount: integer("citation_count"),
	grants: jsonb(),
	referenceIds: jsonb("reference_ids"),
}, (table) => [
	index("idx_papers_pmcid").using("btree", table.pmcid.asc().nullsLast().op("text_ops")).where(sql`(pmcid IS NOT NULL)`),
	uniqueIndex("uq_papers_doi").using("btree", table.doi.asc().nullsLast().op("text_ops")).where(sql`(doi IS NOT NULL)`),
	uniqueIndex("uq_papers_pmid").using("btree", table.pmid.asc().nullsLast().op("text_ops")).where(sql`(pmid IS NOT NULL)`),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "research_papers_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const clinicalTrials = pgTable("clinical_trials", {
	contentItemId: uuid("content_item_id").primaryKey().notNull(),
	nctNumber: text("nct_number").notNull(),
	briefTitle: text("brief_title"),
	officialTitle: text("official_title"),
	sponsor: text(),
	studyType: text("study_type"),
	phase: text(),
	recruitmentStatus: text("recruitment_status"),
	conditions: text().array().default([""]).notNull(),
	interventions: jsonb(),
	primaryOutcomes: jsonb("primary_outcomes"),
	secondaryOutcomes: jsonb("secondary_outcomes"),
	enrollment: integer(),
	eligibilityText: text("eligibility_text"),
	minimumAgeYears: numeric("minimum_age_years", { precision: 5, scale:  2 }),
	maximumAgeYears: numeric("maximum_age_years", { precision: 5, scale:  2 }),
	requiresStudyPartner: boolean("requires_study_partner"),
	startDate: date("start_date"),
	completionDate: date("completion_date"),
	resultsPosted: boolean("results_posted").default(false).notNull(),
	contacts: jsonb(),
	lastUpdatePosted: date("last_update_posted"),
}, (table) => [
	index("idx_trials_status").using("btree", table.recruitmentStatus.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_trials_nct").using("btree", table.nctNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "clinical_trials_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const clinicalTrialLocations = pgTable("clinical_trial_locations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	facility: text(),
	city: text(),
	state: text(),
	country: text(),
	postalCode: text("postal_code"),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	locationStatus: text("location_status"),
}, (table) => [
	index("idx_trial_locations").using("btree", table.contentItemId.asc().nullsLast().op("uuid_ops")),
	index("idx_trial_locations_geo").using("btree", table.country.asc().nullsLast().op("text_ops"), table.state.asc().nullsLast().op("text_ops"), table.city.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [clinicalTrials.contentItemId],
			name: "clinical_trial_locations_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const clinicalTrialChanges = pgTable("clinical_trial_changes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	changeType: trialChangeType("change_type").notNull(),
	detectedAt: timestamp("detected_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	oldValue: jsonb("old_value"),
	newValue: jsonb("new_value"),
}, (table) => [
	index("idx_trial_changes").using("btree", table.contentItemId.asc().nullsLast().op("timestamptz_ops"), table.detectedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [clinicalTrials.contentItemId],
			name: "clinical_trial_changes_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const researchGrants = pgTable("research_grants", {
	contentItemId: uuid("content_item_id").primaryKey().notNull(),
	projectNumber: text("project_number").notNull(),
	projectTitle: text("project_title"),
	abstract: text(),
	principalInvestigators: jsonb("principal_investigators"),
	organization: text(),
	fundingAgency: text("funding_agency"),
	fiscalYear: integer("fiscal_year"),
	awardAmount: numeric("award_amount", { precision: 14, scale:  2 }),
	startDate: date("start_date"),
	endDate: date("end_date"),
	terms: text().array().default([""]).notNull(),
	relatedPublicationIds: jsonb("related_publication_ids"),
	clinicalStudyLinks: jsonb("clinical_study_links"),
}, (table) => [
	uniqueIndex("uq_grants_project").using("btree", table.projectNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "research_grants_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const regulatoryUpdates = pgTable("regulatory_updates", {
	contentItemId: uuid("content_item_id").primaryKey().notNull(),
	agency: text().default('FDA').notNull(),
	actionType: text("action_type").notNull(),
	officialIdentifier: text("official_identifier"),
	drugNames: text("drug_names").array().default([""]).notNull(),
	effectiveDate: date("effective_date"),
	detail: jsonb(),
}, (table) => [
	index("idx_regulatory_action").using("btree", table.actionType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "regulatory_updates_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const newsMentions = pgTable("news_mentions", {
	contentItemId: uuid("content_item_id").primaryKey().notNull(),
	publisher: text(),
	articleUrl: text("article_url").notNull(),
	language: text(),
	country: text(),
	extractedEntities: jsonb("extracted_entities"),
	discoveryQuery: text("discovery_query"),
}, (table) => [
	uniqueIndex("uq_news_url").using("btree", table.articleUrl.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "news_mentions_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const storyClusters = pgTable("story_clusters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text(),
	primaryContentItemId: uuid("primary_content_item_id"),
	locked: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.primaryContentItemId],
			foreignColumns: [contentItems.id],
			name: "story_clusters_primary_content_item_id_fkey"
		}).onDelete("set null"),
]);

export const duplicateCandidates = pgTable("duplicate_candidates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemA: uuid("content_item_a").notNull(),
	contentItemB: uuid("content_item_b").notNull(),
	matchScore: numeric("match_score", { precision: 5, scale:  4 }).notNull(),
	matchFeatures: jsonb("match_features"),
	status: duplicateStatus().default('pending').notNull(),
	resolvedBy: uuid("resolved_by"),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_dupes_pending").using("btree", table.status.asc().nullsLast().op("enum_ops")).where(sql`(status = 'pending'::duplicate_status)`),
	foreignKey({
			columns: [table.contentItemA],
			foreignColumns: [contentItems.id],
			name: "duplicate_candidates_content_item_a_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentItemB],
			foreignColumns: [contentItems.id],
			name: "duplicate_candidates_content_item_b_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "duplicate_candidates_resolved_by_fkey"
		}).onDelete("set null"),
	unique("duplicate_candidates_content_item_a_content_item_b_key").on(table.contentItemA, table.contentItemB),
	check("duplicate_candidates_check", sql`content_item_a <> content_item_b`),
	check("duplicate_candidates_match_score_check", sql`(match_score >= (0)::numeric) AND (match_score <= (1)::numeric)`),
]);

export const evidenceAssessments = pgTable("evidence_assessments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	studyCategory: studyCategory("study_category").notNull(),
	evidenceStrength: evidenceStrength("evidence_strength").notNull(),
	actionability: actionability().notNull(),
	method: text().notNull(),
	rationale: jsonb(),
	assessedBy: uuid("assessed_by"),
	isCurrent: boolean("is_current").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_evidence_item").using("btree", table.contentItemId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.assessedBy],
			foreignColumns: [users.id],
			name: "evidence_assessments_assessed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "evidence_assessments_content_item_id_fkey"
		}).onDelete("cascade"),
]);

export const promptVersions = pgTable("prompt_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	promptKey: text("prompt_key").notNull(),
	versionNumber: integer("version_number").notNull(),
	promptBody: text("prompt_body").notNull(),
	modelHint: text("model_hint"),
	status: text().default('draft').notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "prompt_versions_created_by_fkey"
		}).onDelete("set null"),
	unique("prompt_versions_prompt_key_version_number_key").on(table.promptKey, table.versionNumber),
]);

export const generatedSummaries = pgTable("generated_summaries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	promptVersionId: uuid("prompt_version_id"),
	model: text().notNull(),
	payload: jsonb().notNull(),
	validationStatus: text("validation_status").default('pending').notNull(),
	validationErrors: jsonb("validation_errors"),
	inputTokens: integer("input_tokens"),
	outputTokens: integer("output_tokens"),
	costUsd: numeric("cost_usd", { precision: 10, scale:  6 }),
	isCurrent: boolean("is_current").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_summaries_item").using("btree", table.contentItemId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "generated_summaries_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.promptVersionId],
			foreignColumns: [promptVersions.id],
			name: "generated_summaries_prompt_version_id_fkey"
		}).onDelete("set null"),
]);

export const generatedClaims = pgTable("generated_claims", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	generatedSummaryId: uuid("generated_summary_id").notNull(),
	claimText: text("claim_text").notNull(),
	payloadField: text("payload_field").notNull(),
	sourceRecordId: uuid("source_record_id"),
	sourceField: text("source_field"),
	supportingExcerpt: text("supporting_excerpt"),
	sourceUrl: text("source_url"),
}, (table) => [
	index("idx_claims_summary").using("btree", table.generatedSummaryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.generatedSummaryId],
			foreignColumns: [generatedSummaries.id],
			name: "generated_claims_generated_summary_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceRecordId],
			foreignColumns: [sourceRecords.id],
			name: "generated_claims_source_record_id_fkey"
		}).onDelete("set null"),
]);

export const householdFeedPreferences = pgTable("household_feed_preferences", {
	householdId: uuid("household_id").primaryKey().notNull(),
	trialRadiusKm: integer("trial_radius_km"),
	trialCenterPostalCode: text("trial_center_postal_code"),
	includePreliminary: boolean("include_preliminary").default(true).notNull(),
	includeAnimalStudies: boolean("include_animal_studies").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "household_feed_preferences_household_id_fkey"
		}).onDelete("cascade"),
	check("household_feed_preferences_trial_radius_km_check", sql`trial_radius_km > 0`),
]);

export const contentVersions = pgTable("content_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	snapshot: jsonb().notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "content_versions_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "content_versions_created_by_fkey"
		}).onDelete("set null"),
	unique("content_versions_content_item_id_version_number_key").on(table.contentItemId, table.versionNumber),
]);

export const contentReviews = pgTable("content_reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	reviewerId: uuid("reviewer_id"),
	assignedBy: uuid("assigned_by"),
	status: reviewStatus().default('pending').notNull(),
	notes: text(),
	highRisk: boolean("high_risk").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_reviews_pending").using("btree", table.status.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(status = 'pending'::review_status)`),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "content_reviews_assigned_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "content_reviews_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.id],
			name: "content_reviews_reviewer_id_fkey"
		}).onDelete("set null"),
]);

export const userTopicPreferences = pgTable("user_topic_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	topicId: uuid("topic_id").notNull(),
	preference: text().default('follow').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_topic_prefs_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "user_topic_preferences_topic_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_topic_preferences_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_topic_preferences_user_id_topic_id_key").on(table.userId, table.topicId),
]);

export const followedTrials = pgTable("followed_trials", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_followed_trials_item").using("btree", table.contentItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [clinicalTrials.contentItemId],
			name: "followed_trials_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "followed_trials_user_id_fkey"
		}).onDelete("cascade"),
	unique("followed_trials_user_id_content_item_id_key").on(table.userId, table.contentItemId),
]);

export const followedTreatments = pgTable("followed_treatments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	topicId: uuid("topic_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "followed_treatments_topic_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "followed_treatments_user_id_fkey"
		}).onDelete("cascade"),
	unique("followed_treatments_user_id_topic_id_key").on(table.userId, table.topicId),
]);

export const savedContent = pgTable("saved_content", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	note: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "saved_content_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_content_user_id_fkey"
		}).onDelete("cascade"),
	unique("saved_content_user_id_content_item_id_key").on(table.userId, table.contentItemId),
]);

export const hiddenContent = pgTable("hidden_content", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "hidden_content_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "hidden_content_user_id_fkey"
		}).onDelete("cascade"),
	unique("hidden_content_user_id_content_item_id_key").on(table.userId, table.contentItemId),
]);

export const feedImpressions = pgTable("feed_impressions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	feedTab: text("feed_tab").notNull(),
	relevanceScore: numeric("relevance_score", { precision: 8, scale:  4 }),
	relevanceReasons: jsonb("relevance_reasons"),
	shownAt: timestamp("shown_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_impressions_item").using("btree", table.contentItemId.asc().nullsLast().op("uuid_ops")),
	index("idx_impressions_user").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.shownAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "feed_impressions_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feed_impressions_user_id_fkey"
		}).onDelete("cascade"),
]);

export const notificationPreferences = pgTable("notification_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	householdId: uuid("household_id"),
	category: text().notNull(),
	channel: notificationChannel().notNull(),
	enabled: boolean().default(true).notNull(),
	asDigest: boolean("as_digest").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "notification_preferences_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_preferences_user_id_fkey"
		}).onDelete("cascade"),
	unique("notification_preferences_user_id_household_id_category_chan_key").on(table.userId, table.householdId, table.category, table.channel),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	householdId: uuid("household_id"),
	category: text().notNull(),
	title: text().notNull(),
	body: text(),
	contentItemId: uuid("content_item_id"),
	taskId: uuid("task_id"),
	appointmentId: uuid("appointment_id"),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_notifications_unread").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`(read_at IS NULL)`),
	index("idx_notifications_user").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "notifications_appointment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "notifications_content_item_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "notifications_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "notifications_task_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const notificationDeliveries = pgTable("notification_deliveries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	notificationId: uuid("notification_id").notNull(),
	channel: notificationChannel().notNull(),
	status: deliveryStatus().default('queued').notNull(),
	providerMessageId: text("provider_message_id"),
	attemptedAt: timestamp("attempted_at", { withTimezone: true, mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	errorDetail: text("error_detail"),
}, (table) => [
	index("idx_deliveries_status").using("btree", table.status.asc().nullsLast().op("enum_ops")).where(sql`(status = ANY (ARRAY['queued'::delivery_status, 'failed'::delivery_status]))`),
	foreignKey({
			columns: [table.notificationId],
			foreignColumns: [notifications.id],
			name: "notification_deliveries_notification_id_fkey"
		}).onDelete("cascade"),
]);

export const supportAccessGrants = pgTable("support_access_grants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	supportUserId: uuid("support_user_id").notNull(),
	householdId: uuid("household_id").notNull(),
	reason: text().notNull(),
	grantedBy: uuid("granted_by"),
	grantedAt: timestamp("granted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_support_grants_active").using("btree", table.householdId.asc().nullsLast().op("uuid_ops")).where(sql`(revoked_at IS NULL)`),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: "support_access_grants_granted_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "support_access_grants_household_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.supportUserId],
			foreignColumns: [users.id],
			name: "support_access_grants_support_user_id_fkey"
		}).onDelete("cascade"),
	check("support_access_grants_check", sql`expires_at > granted_at`),
]);

export const digestRuns = pgTable("digest_runs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	periodStart: date("period_start").notNull(),
	periodEnd: date("period_end").notNull(),
	itemCount: integer("item_count").default(0).notNull(),
	sections: jsonb(),
	status: deliveryStatus().default('queued').notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_digest_runs_user").using("btree", table.userId.asc().nullsLast().op("date_ops"), table.periodEnd.desc().nullsFirst().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "digest_runs_user_id_fkey"
		}).onDelete("cascade"),
	check("digest_runs_check", sql`period_end >= period_start`),
]);

export const auditEvents = pgTable("audit_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	actorUserId: uuid("actor_user_id"),
	actorType: text("actor_type").default('user').notNull(),
	householdId: uuid("household_id"),
	eventType: text("event_type").notNull(),
	entityType: text("entity_type"),
	entityId: uuid("entity_id"),
	metadata: jsonb(),
	ipAddress: inet("ip_address"),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_actor").using("btree", table.actorUserId.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_audit_household").using("btree", table.householdId.asc().nullsLast().op("uuid_ops"), table.occurredAt.desc().nullsFirst().op("uuid_ops")),
	index("idx_audit_type").using("btree", table.eventType.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.desc().nullsFirst().op("text_ops")),
	foreignKey({
			columns: [table.actorUserId],
			foreignColumns: [users.id],
			name: "audit_events_actor_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.householdId],
			foreignColumns: [households.id],
			name: "audit_events_household_id_fkey"
		}).onDelete("set null"),
]);

export const featureFlags = pgTable("feature_flags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	flagKey: text("flag_key").notNull(),
	description: text().notNull(),
	defaultEnabled: boolean("default_enabled").default(false).notNull(),
	overrides: jsonb().default({}).notNull(),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "feature_flags_updated_by_fkey"
		}).onDelete("set null"),
	unique("feature_flags_flag_key_key").on(table.flagKey),
]);

export const systemSettings = pgTable("system_settings", {
	key: text().primaryKey().notNull(),
	value: jsonb().notNull(),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "system_settings_updated_by_fkey"
		}).onDelete("set null"),
]);

export const jobFailures = pgTable("job_failures", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	queueName: text("queue_name").notNull(),
	jobId: text("job_id").notNull(),
	jobName: text("job_name"),
	payload: jsonb(),
	errorMessage: text("error_message"),
	errorStack: text("error_stack"),
	attempts: integer().default(0).notNull(),
	failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	retriedAt: timestamp("retried_at", { withTimezone: true, mode: 'string' }),
	resolved: boolean().default(false).notNull(),
}, (table) => [
	index("idx_job_failures_open").using("btree", table.queueName.asc().nullsLast().op("text_ops"), table.failedAt.desc().nullsFirst().op("text_ops")).where(sql`(NOT resolved)`),
]);

export const educationalContent = pgTable("educational_content", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	bodyMarkdown: text("body_markdown").notNull(),
	category: text().notNull(),
	status: text().default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_edu_status").using("btree", table.category.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "educational_content_created_by_fkey"
		}).onDelete("set null"),
	unique("educational_content_slug_key").on(table.slug),
]);

export const resourceDirectoryEntries = pgTable("resource_directory_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	resourceType: text("resource_type").notNull(),
	name: text().notNull(),
	description: text(),
	streetAddress: text("street_address"),
	city: text(),
	state: text(),
	postalCode: text("postal_code"),
	country: text().default('US').notNull(),
	serviceArea: text("service_area"),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	phone: text(),
	website: text(),
	eligibilityNotes: text("eligibility_notes"),
	costNotes: text("cost_notes"),
	source: text(),
	verificationStatus: text("verification_status").default('unverified').notNull(),
	lastVerifiedOn: date("last_verified_on"),
	adminNotes: text("admin_notes"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_resources_geo").using("btree", table.state.asc().nullsLast().op("text_ops"), table.city.asc().nullsLast().op("text_ops")).where(sql`is_active`),
	index("idx_resources_name_trgm").using("gin", table.name.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_resources_type").using("btree", table.resourceType.asc().nullsLast().op("text_ops")).where(sql`is_active`),
]);

export const appointmentObservations = pgTable("appointment_observations", {
	appointmentId: uuid("appointment_id").notNull(),
	observationId: uuid("observation_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "appointment_observations_appointment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.observationId],
			foreignColumns: [observations.id],
			name: "appointment_observations_observation_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.appointmentId, table.observationId], name: "appointment_observations_pkey"}),
]);

export const decisionParticipants = pgTable("decision_participants", {
	decisionId: uuid("decision_id").notNull(),
	membershipId: uuid("membership_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.decisionId],
			foreignColumns: [decisions.id],
			name: "decision_participants_decision_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.membershipId],
			foreignColumns: [householdMemberships.id],
			name: "decision_participants_membership_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.decisionId, table.membershipId], name: "decision_participants_pkey"}),
]);

export const appointmentDocuments = pgTable("appointment_documents", {
	appointmentId: uuid("appointment_id").notNull(),
	documentId: uuid("document_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "appointment_documents_appointment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "appointment_documents_document_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.appointmentId, table.documentId], name: "appointment_documents_pkey"}),
]);

export const decisionDocuments = pgTable("decision_documents", {
	decisionId: uuid("decision_id").notNull(),
	documentId: uuid("document_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.decisionId],
			foreignColumns: [decisions.id],
			name: "decision_documents_decision_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "decision_documents_document_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.decisionId, table.documentId], name: "decision_documents_pkey"}),
]);

export const observationContexts = pgTable("observation_contexts", {
	observationId: uuid("observation_id").notNull(),
	factor: contextFactor().notNull(),
	note: text(),
}, (table) => [
	foreignKey({
			columns: [table.observationId],
			foreignColumns: [observations.id],
			name: "observation_contexts_observation_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.observationId, table.factor], name: "observation_contexts_pkey"}),
]);

export const contentSources = pgTable("content_sources", {
	contentItemId: uuid("content_item_id").notNull(),
	sourceRecordId: uuid("source_record_id").notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
	index("idx_content_sources_record").using("btree", table.sourceRecordId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "content_sources_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceRecordId],
			foreignColumns: [sourceRecords.id],
			name: "content_sources_source_record_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentItemId, table.sourceRecordId], name: "content_sources_pkey"}),
]);

export const contentTopics = pgTable("content_topics", {
	contentItemId: uuid("content_item_id").notNull(),
	topicId: uuid("topic_id").notNull(),
	assignedBy: text("assigned_by").default('rule').notNull(),
}, (table) => [
	index("idx_content_topics_topic").using("btree", table.topicId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "content_topics_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "content_topics_topic_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentItemId, table.topicId], name: "content_topics_pkey"}),
]);

export const storyClusterMembers = pgTable("story_cluster_members", {
	storyClusterId: uuid("story_cluster_id").notNull(),
	contentItemId: uuid("content_item_id").notNull(),
	memberRole: text("member_role").default('coverage').notNull(),
	addedBy: text("added_by").default('auto').notNull(),
}, (table) => [
	index("idx_cluster_members_item").using("btree", table.contentItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentItemId],
			foreignColumns: [contentItems.id],
			name: "story_cluster_members_content_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.storyClusterId],
			foreignColumns: [storyClusters.id],
			name: "story_cluster_members_story_cluster_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.storyClusterId, table.contentItemId], name: "story_cluster_members_pkey"}),
]);

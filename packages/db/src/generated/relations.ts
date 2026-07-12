import { relations } from "drizzle-orm/relations";
import { users, externalAuthIdentities, households, householdMemberships, invitations, careRecipients, consents, adminRoles, adminRoleAssignments, appointments, appointmentQuestions, clinicianBriefs, documents, observations, observationRevisions, observationComments, medications, medicationEvents, healthContextEvents, clinicianShareLinks, shareLinkAccessEvents, roadmapItems, tasks, taskComments, decisions, decisionComments, familyUpdates, familyUpdateComments, caregiverCheckins, safetyCheckupTemplates, safetyAssessments, safetyResponses, roadmapTemplates, communicationScripts, savedScripts, documentVersions, documentPermissions, documentAccessEvents, extractedDocumentText, topics, topicSynonyms, sourceConnectors, sourceQueries, sourceQueryVersions, sourceCursors, ingestionRuns, sourceRecords, contentItems, researchPapers, clinicalTrials, clinicalTrialLocations, clinicalTrialChanges, researchGrants, regulatoryUpdates, newsMentions, storyClusters, duplicateCandidates, evidenceAssessments, promptVersions, generatedSummaries, generatedClaims, householdFeedPreferences, contentVersions, contentReviews, userTopicPreferences, followedTrials, followedTreatments, savedContent, hiddenContent, feedImpressions, notificationPreferences, notifications, notificationDeliveries, supportAccessGrants, digestRuns, auditEvents, featureFlags, systemSettings, educationalContent, appointmentObservations, decisionParticipants, appointmentDocuments, decisionDocuments, observationContexts, contentSources, contentTopics, storyClusterMembers } from "./schema";

export const externalAuthIdentitiesRelations = relations(externalAuthIdentities, ({one}) => ({
	user: one(users, {
		fields: [externalAuthIdentities.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	externalAuthIdentities: many(externalAuthIdentities),
	households: many(households),
	householdMemberships: many(householdMemberships),
	invitations_acceptedBy: many(invitations, {
		relationName: "invitations_acceptedBy_users_id"
	}),
	invitations_invitedBy: many(invitations, {
		relationName: "invitations_invitedBy_users_id"
	}),
	careRecipients: many(careRecipients),
	consents: many(consents),
	adminRoleAssignments_grantedBy: many(adminRoleAssignments, {
		relationName: "adminRoleAssignments_grantedBy_users_id"
	}),
	adminRoleAssignments_userId: many(adminRoleAssignments, {
		relationName: "adminRoleAssignments_userId_users_id"
	}),
	appointments: many(appointments),
	appointmentQuestions: many(appointmentQuestions),
	clinicianBriefs: many(clinicianBriefs),
	observations: many(observations),
	observationRevisions: many(observationRevisions),
	observationComments: many(observationComments),
	medications: many(medications),
	medicationEvents: many(medicationEvents),
	healthContextEvents: many(healthContextEvents),
	clinicianShareLinks: many(clinicianShareLinks),
	tasks_completedBy: many(tasks, {
		relationName: "tasks_completedBy_users_id"
	}),
	tasks_createdBy: many(tasks, {
		relationName: "tasks_createdBy_users_id"
	}),
	taskComments: many(taskComments),
	decisions: many(decisions),
	decisionComments: many(decisionComments),
	familyUpdates: many(familyUpdates),
	familyUpdateComments: many(familyUpdateComments),
	caregiverCheckins: many(caregiverCheckins),
	safetyCheckupTemplates: many(safetyCheckupTemplates),
	safetyAssessments: many(safetyAssessments),
	roadmapTemplates: many(roadmapTemplates),
	communicationScripts: many(communicationScripts),
	savedScripts: many(savedScripts),
	documents: many(documents),
	documentVersions: many(documentVersions),
	documentPermissions: many(documentPermissions),
	documentAccessEvents: many(documentAccessEvents),
	sourceQueryVersions: many(sourceQueryVersions),
	duplicateCandidates: many(duplicateCandidates),
	evidenceAssessments: many(evidenceAssessments),
	promptVersions: many(promptVersions),
	contentVersions: many(contentVersions),
	contentReviews_assignedBy: many(contentReviews, {
		relationName: "contentReviews_assignedBy_users_id"
	}),
	contentReviews_reviewerId: many(contentReviews, {
		relationName: "contentReviews_reviewerId_users_id"
	}),
	userTopicPreferences: many(userTopicPreferences),
	followedTrials: many(followedTrials),
	followedTreatments: many(followedTreatments),
	savedContents: many(savedContent),
	hiddenContents: many(hiddenContent),
	feedImpressions: many(feedImpressions),
	notificationPreferences: many(notificationPreferences),
	notifications: many(notifications),
	supportAccessGrants_grantedBy: many(supportAccessGrants, {
		relationName: "supportAccessGrants_grantedBy_users_id"
	}),
	supportAccessGrants_supportUserId: many(supportAccessGrants, {
		relationName: "supportAccessGrants_supportUserId_users_id"
	}),
	digestRuns: many(digestRuns),
	auditEvents: many(auditEvents),
	featureFlags: many(featureFlags),
	systemSettings: many(systemSettings),
	educationalContents: many(educationalContent),
}));

export const householdsRelations = relations(households, ({one, many}) => ({
	user: one(users, {
		fields: [households.createdBy],
		references: [users.id]
	}),
	householdMemberships: many(householdMemberships),
	invitations: many(invitations),
	careRecipients: many(careRecipients),
	consents: many(consents),
	appointments: many(appointments),
	clinicianBriefs: many(clinicianBriefs),
	observations: many(observations),
	medications: many(medications),
	medicationEvents: many(medicationEvents),
	healthContextEvents: many(healthContextEvents),
	clinicianShareLinks: many(clinicianShareLinks),
	tasks: many(tasks),
	decisions: many(decisions),
	familyUpdates: many(familyUpdates),
	caregiverCheckins: many(caregiverCheckins),
	safetyAssessments: many(safetyAssessments),
	roadmapItems: many(roadmapItems),
	documents: many(documents),
	householdFeedPreferences: many(householdFeedPreferences),
	notificationPreferences: many(notificationPreferences),
	notifications: many(notifications),
	supportAccessGrants: many(supportAccessGrants),
	auditEvents: many(auditEvents),
}));

export const householdMembershipsRelations = relations(householdMemberships, ({one, many}) => ({
	household: one(households, {
		fields: [householdMemberships.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [householdMemberships.userId],
		references: [users.id]
	}),
	appointments: many(appointments),
	observations: many(observations),
	tasks: many(tasks),
	roadmapItems: many(roadmapItems),
	documentPermissions: many(documentPermissions),
	decisionParticipants: many(decisionParticipants),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	user_acceptedBy: one(users, {
		fields: [invitations.acceptedBy],
		references: [users.id],
		relationName: "invitations_acceptedBy_users_id"
	}),
	household: one(households, {
		fields: [invitations.householdId],
		references: [households.id]
	}),
	user_invitedBy: one(users, {
		fields: [invitations.invitedBy],
		references: [users.id],
		relationName: "invitations_invitedBy_users_id"
	}),
}));

export const careRecipientsRelations = relations(careRecipients, ({one, many}) => ({
	household: one(households, {
		fields: [careRecipients.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [careRecipients.userId],
		references: [users.id]
	}),
	appointments: many(appointments),
	observations: many(observations),
	medications: many(medications),
	healthContextEvents: many(healthContextEvents),
	tasks: many(tasks),
	safetyAssessments: many(safetyAssessments),
	documents: many(documents),
}));

export const consentsRelations = relations(consents, ({one, many}) => ({
	household: one(households, {
		fields: [consents.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [consents.userId],
		references: [users.id]
	}),
	extractedDocumentTexts: many(extractedDocumentText),
}));

export const adminRoleAssignmentsRelations = relations(adminRoleAssignments, ({one}) => ({
	adminRole: one(adminRoles, {
		fields: [adminRoleAssignments.adminRoleId],
		references: [adminRoles.id]
	}),
	user_grantedBy: one(users, {
		fields: [adminRoleAssignments.grantedBy],
		references: [users.id],
		relationName: "adminRoleAssignments_grantedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [adminRoleAssignments.userId],
		references: [users.id],
		relationName: "adminRoleAssignments_userId_users_id"
	}),
}));

export const adminRolesRelations = relations(adminRoles, ({many}) => ({
	adminRoleAssignments: many(adminRoleAssignments),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	householdMembership: one(householdMemberships, {
		fields: [appointments.attendeeMembershipId],
		references: [householdMemberships.id]
	}),
	careRecipient: one(careRecipients, {
		fields: [appointments.careRecipientId],
		references: [careRecipients.id]
	}),
	user: one(users, {
		fields: [appointments.createdBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [appointments.householdId],
		references: [households.id]
	}),
	appointment: one(appointments, {
		fields: [appointments.nextAppointmentId],
		references: [appointments.id],
		relationName: "appointments_nextAppointmentId_appointments_id"
	}),
	appointments: many(appointments, {
		relationName: "appointments_nextAppointmentId_appointments_id"
	}),
	appointmentQuestions: many(appointmentQuestions),
	clinicianBriefs: many(clinicianBriefs),
	tasks: many(tasks),
	familyUpdates: many(familyUpdates),
	notifications: many(notifications),
	appointmentObservations: many(appointmentObservations),
	appointmentDocuments: many(appointmentDocuments),
}));

export const appointmentQuestionsRelations = relations(appointmentQuestions, ({one}) => ({
	user: one(users, {
		fields: [appointmentQuestions.addedBy],
		references: [users.id]
	}),
	appointment: one(appointments, {
		fields: [appointmentQuestions.appointmentId],
		references: [appointments.id]
	}),
}));

export const clinicianBriefsRelations = relations(clinicianBriefs, ({one, many}) => ({
	appointment: one(appointments, {
		fields: [clinicianBriefs.appointmentId],
		references: [appointments.id]
	}),
	user: one(users, {
		fields: [clinicianBriefs.generatedBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [clinicianBriefs.householdId],
		references: [households.id]
	}),
	clinicianShareLinks: many(clinicianShareLinks),
}));

export const observationsRelations = relations(observations, ({one, many}) => ({
	document: one(documents, {
		fields: [observations.attachmentDocumentId],
		references: [documents.id]
	}),
	careRecipient: one(careRecipients, {
		fields: [observations.careRecipientId],
		references: [careRecipients.id]
	}),
	user: one(users, {
		fields: [observations.createdBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [observations.householdId],
		references: [households.id]
	}),
	householdMembership: one(householdMemberships, {
		fields: [observations.observerMembershipId],
		references: [householdMemberships.id]
	}),
	observationRevisions: many(observationRevisions),
	observationComments: many(observationComments),
	appointmentObservations: many(appointmentObservations),
	observationContexts: many(observationContexts),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	observations: many(observations),
	careRecipient: one(careRecipients, {
		fields: [documents.careRecipientId],
		references: [careRecipients.id]
	}),
	household: one(households, {
		fields: [documents.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [documents.uploadedBy],
		references: [users.id]
	}),
	documentVersions: many(documentVersions),
	documentPermissions: many(documentPermissions),
	documentAccessEvents: many(documentAccessEvents),
	extractedDocumentTexts: many(extractedDocumentText),
	appointmentDocuments: many(appointmentDocuments),
	decisionDocuments: many(decisionDocuments),
}));

export const observationRevisionsRelations = relations(observationRevisions, ({one}) => ({
	user: one(users, {
		fields: [observationRevisions.editedBy],
		references: [users.id]
	}),
	observation: one(observations, {
		fields: [observationRevisions.observationId],
		references: [observations.id]
	}),
}));

export const observationCommentsRelations = relations(observationComments, ({one}) => ({
	user: one(users, {
		fields: [observationComments.authorId],
		references: [users.id]
	}),
	observation: one(observations, {
		fields: [observationComments.observationId],
		references: [observations.id]
	}),
}));

export const medicationsRelations = relations(medications, ({one, many}) => ({
	careRecipient: one(careRecipients, {
		fields: [medications.careRecipientId],
		references: [careRecipients.id]
	}),
	user: one(users, {
		fields: [medications.createdBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [medications.householdId],
		references: [households.id]
	}),
	medicationEvents: many(medicationEvents),
}));

export const medicationEventsRelations = relations(medicationEvents, ({one}) => ({
	household: one(households, {
		fields: [medicationEvents.householdId],
		references: [households.id]
	}),
	medication: one(medications, {
		fields: [medicationEvents.medicationId],
		references: [medications.id]
	}),
	user: one(users, {
		fields: [medicationEvents.recordedBy],
		references: [users.id]
	}),
}));

export const healthContextEventsRelations = relations(healthContextEvents, ({one}) => ({
	careRecipient: one(careRecipients, {
		fields: [healthContextEvents.careRecipientId],
		references: [careRecipients.id]
	}),
	household: one(households, {
		fields: [healthContextEvents.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [healthContextEvents.recordedBy],
		references: [users.id]
	}),
}));

export const clinicianShareLinksRelations = relations(clinicianShareLinks, ({one, many}) => ({
	clinicianBrief: one(clinicianBriefs, {
		fields: [clinicianShareLinks.briefId],
		references: [clinicianBriefs.id]
	}),
	user: one(users, {
		fields: [clinicianShareLinks.createdBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [clinicianShareLinks.householdId],
		references: [households.id]
	}),
	shareLinkAccessEvents: many(shareLinkAccessEvents),
	documentAccessEvents: many(documentAccessEvents),
}));

export const shareLinkAccessEventsRelations = relations(shareLinkAccessEvents, ({one}) => ({
	clinicianShareLink: one(clinicianShareLinks, {
		fields: [shareLinkAccessEvents.shareLinkId],
		references: [clinicianShareLinks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	roadmapItem: one(roadmapItems, {
		fields: [tasks.roadmapItemId],
		references: [roadmapItems.id]
	}),
	appointment: one(appointments, {
		fields: [tasks.appointmentId],
		references: [appointments.id]
	}),
	householdMembership: one(householdMemberships, {
		fields: [tasks.assigneeMembershipId],
		references: [householdMemberships.id]
	}),
	careRecipient: one(careRecipients, {
		fields: [tasks.careRecipientId],
		references: [careRecipients.id]
	}),
	user_completedBy: one(users, {
		fields: [tasks.completedBy],
		references: [users.id],
		relationName: "tasks_completedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [tasks.createdBy],
		references: [users.id],
		relationName: "tasks_createdBy_users_id"
	}),
	household: one(households, {
		fields: [tasks.householdId],
		references: [households.id]
	}),
	taskComments: many(taskComments),
	familyUpdates: many(familyUpdates),
	notifications: many(notifications),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({one, many}) => ({
	tasks: many(tasks),
	householdMembership: one(householdMemberships, {
		fields: [roadmapItems.assigneeMembershipId],
		references: [householdMemberships.id]
	}),
	household: one(households, {
		fields: [roadmapItems.householdId],
		references: [households.id]
	}),
	roadmapTemplate: one(roadmapTemplates, {
		fields: [roadmapItems.templateId],
		references: [roadmapTemplates.id]
	}),
}));

export const taskCommentsRelations = relations(taskComments, ({one}) => ({
	user: one(users, {
		fields: [taskComments.authorId],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id]
	}),
}));

export const decisionsRelations = relations(decisions, ({one, many}) => ({
	user: one(users, {
		fields: [decisions.createdBy],
		references: [users.id]
	}),
	household: one(households, {
		fields: [decisions.householdId],
		references: [households.id]
	}),
	decisionComments: many(decisionComments),
	familyUpdates: many(familyUpdates),
	decisionParticipants: many(decisionParticipants),
	decisionDocuments: many(decisionDocuments),
}));

export const decisionCommentsRelations = relations(decisionComments, ({one}) => ({
	user: one(users, {
		fields: [decisionComments.authorId],
		references: [users.id]
	}),
	decision: one(decisions, {
		fields: [decisionComments.decisionId],
		references: [decisions.id]
	}),
}));

export const familyUpdatesRelations = relations(familyUpdates, ({one, many}) => ({
	appointment: one(appointments, {
		fields: [familyUpdates.appointmentId],
		references: [appointments.id]
	}),
	user: one(users, {
		fields: [familyUpdates.authorId],
		references: [users.id]
	}),
	decision: one(decisions, {
		fields: [familyUpdates.decisionId],
		references: [decisions.id]
	}),
	household: one(households, {
		fields: [familyUpdates.householdId],
		references: [households.id]
	}),
	task: one(tasks, {
		fields: [familyUpdates.taskId],
		references: [tasks.id]
	}),
	familyUpdateComments: many(familyUpdateComments),
}));

export const familyUpdateCommentsRelations = relations(familyUpdateComments, ({one}) => ({
	user: one(users, {
		fields: [familyUpdateComments.authorId],
		references: [users.id]
	}),
	familyUpdate: one(familyUpdates, {
		fields: [familyUpdateComments.familyUpdateId],
		references: [familyUpdates.id]
	}),
}));

export const caregiverCheckinsRelations = relations(caregiverCheckins, ({one}) => ({
	household: one(households, {
		fields: [caregiverCheckins.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [caregiverCheckins.userId],
		references: [users.id]
	}),
}));

export const safetyCheckupTemplatesRelations = relations(safetyCheckupTemplates, ({one, many}) => ({
	user: one(users, {
		fields: [safetyCheckupTemplates.createdBy],
		references: [users.id]
	}),
	safetyAssessments: many(safetyAssessments),
}));

export const safetyAssessmentsRelations = relations(safetyAssessments, ({one, many}) => ({
	careRecipient: one(careRecipients, {
		fields: [safetyAssessments.careRecipientId],
		references: [careRecipients.id]
	}),
	household: one(households, {
		fields: [safetyAssessments.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [safetyAssessments.startedBy],
		references: [users.id]
	}),
	safetyCheckupTemplate: one(safetyCheckupTemplates, {
		fields: [safetyAssessments.templateId],
		references: [safetyCheckupTemplates.id]
	}),
	safetyResponses: many(safetyResponses),
}));

export const safetyResponsesRelations = relations(safetyResponses, ({one}) => ({
	safetyAssessment: one(safetyAssessments, {
		fields: [safetyResponses.assessmentId],
		references: [safetyAssessments.id]
	}),
}));

export const roadmapTemplatesRelations = relations(roadmapTemplates, ({one, many}) => ({
	user: one(users, {
		fields: [roadmapTemplates.createdBy],
		references: [users.id]
	}),
	roadmapItems: many(roadmapItems),
}));

export const communicationScriptsRelations = relations(communicationScripts, ({one, many}) => ({
	user: one(users, {
		fields: [communicationScripts.createdBy],
		references: [users.id]
	}),
	savedScripts: many(savedScripts),
}));

export const savedScriptsRelations = relations(savedScripts, ({one}) => ({
	communicationScript: one(communicationScripts, {
		fields: [savedScripts.scriptId],
		references: [communicationScripts.id]
	}),
	user: one(users, {
		fields: [savedScripts.userId],
		references: [users.id]
	}),
}));

export const documentVersionsRelations = relations(documentVersions, ({one}) => ({
	document: one(documents, {
		fields: [documentVersions.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentVersions.uploadedBy],
		references: [users.id]
	}),
}));

export const documentPermissionsRelations = relations(documentPermissions, ({one}) => ({
	document: one(documents, {
		fields: [documentPermissions.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentPermissions.grantedBy],
		references: [users.id]
	}),
	householdMembership: one(householdMemberships, {
		fields: [documentPermissions.membershipId],
		references: [householdMemberships.id]
	}),
}));

export const documentAccessEventsRelations = relations(documentAccessEvents, ({one}) => ({
	document: one(documents, {
		fields: [documentAccessEvents.documentId],
		references: [documents.id]
	}),
	clinicianShareLink: one(clinicianShareLinks, {
		fields: [documentAccessEvents.shareLinkId],
		references: [clinicianShareLinks.id]
	}),
	user: one(users, {
		fields: [documentAccessEvents.userId],
		references: [users.id]
	}),
}));

export const extractedDocumentTextRelations = relations(extractedDocumentText, ({one}) => ({
	consent: one(consents, {
		fields: [extractedDocumentText.consentId],
		references: [consents.id]
	}),
	document: one(documents, {
		fields: [extractedDocumentText.documentId],
		references: [documents.id]
	}),
}));

export const topicSynonymsRelations = relations(topicSynonyms, ({one}) => ({
	topic: one(topics, {
		fields: [topicSynonyms.topicId],
		references: [topics.id]
	}),
}));

export const topicsRelations = relations(topics, ({many}) => ({
	topicSynonyms: many(topicSynonyms),
	sourceQueries: many(sourceQueries),
	userTopicPreferences: many(userTopicPreferences),
	followedTreatments: many(followedTreatments),
	contentTopics: many(contentTopics),
}));

export const sourceQueriesRelations = relations(sourceQueries, ({one, many}) => ({
	sourceConnector: one(sourceConnectors, {
		fields: [sourceQueries.sourceConnectorId],
		references: [sourceConnectors.id]
	}),
	topic: one(topics, {
		fields: [sourceQueries.topicId],
		references: [topics.id]
	}),
	sourceQueryVersions: many(sourceQueryVersions),
	sourceCursors: many(sourceCursors),
}));

export const sourceConnectorsRelations = relations(sourceConnectors, ({many}) => ({
	sourceQueries: many(sourceQueries),
	sourceCursors: many(sourceCursors),
	ingestionRuns: many(ingestionRuns),
	sourceRecords: many(sourceRecords),
}));

export const sourceQueryVersionsRelations = relations(sourceQueryVersions, ({one, many}) => ({
	user: one(users, {
		fields: [sourceQueryVersions.createdBy],
		references: [users.id]
	}),
	sourceQuery: one(sourceQueries, {
		fields: [sourceQueryVersions.sourceQueryId],
		references: [sourceQueries.id]
	}),
	ingestionRuns: many(ingestionRuns),
	sourceRecords: many(sourceRecords),
}));

export const sourceCursorsRelations = relations(sourceCursors, ({one}) => ({
	sourceConnector: one(sourceConnectors, {
		fields: [sourceCursors.sourceConnectorId],
		references: [sourceConnectors.id]
	}),
	sourceQuery: one(sourceQueries, {
		fields: [sourceCursors.sourceQueryId],
		references: [sourceQueries.id]
	}),
}));

export const ingestionRunsRelations = relations(ingestionRuns, ({one}) => ({
	sourceConnector: one(sourceConnectors, {
		fields: [ingestionRuns.sourceConnectorId],
		references: [sourceConnectors.id]
	}),
	sourceQueryVersion: one(sourceQueryVersions, {
		fields: [ingestionRuns.sourceQueryVersionId],
		references: [sourceQueryVersions.id]
	}),
}));

export const sourceRecordsRelations = relations(sourceRecords, ({one, many}) => ({
	sourceConnector: one(sourceConnectors, {
		fields: [sourceRecords.sourceConnectorId],
		references: [sourceConnectors.id]
	}),
	sourceQueryVersion: one(sourceQueryVersions, {
		fields: [sourceRecords.sourceQueryVersionId],
		references: [sourceQueryVersions.id]
	}),
	generatedClaims: many(generatedClaims),
	contentSources: many(contentSources),
}));

export const researchPapersRelations = relations(researchPapers, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [researchPapers.contentItemId],
		references: [contentItems.id]
	}),
}));

export const contentItemsRelations = relations(contentItems, ({many}) => ({
	researchPapers: many(researchPapers),
	clinicalTrials: many(clinicalTrials),
	researchGrants: many(researchGrants),
	regulatoryUpdates: many(regulatoryUpdates),
	newsMentions: many(newsMentions),
	storyClusters: many(storyClusters),
	duplicateCandidates_contentItemA: many(duplicateCandidates, {
		relationName: "duplicateCandidates_contentItemA_contentItems_id"
	}),
	duplicateCandidates_contentItemB: many(duplicateCandidates, {
		relationName: "duplicateCandidates_contentItemB_contentItems_id"
	}),
	evidenceAssessments: many(evidenceAssessments),
	generatedSummaries: many(generatedSummaries),
	contentVersions: many(contentVersions),
	contentReviews: many(contentReviews),
	savedContents: many(savedContent),
	hiddenContents: many(hiddenContent),
	feedImpressions: many(feedImpressions),
	notifications: many(notifications),
	contentSources: many(contentSources),
	contentTopics: many(contentTopics),
	storyClusterMembers: many(storyClusterMembers),
}));

export const clinicalTrialsRelations = relations(clinicalTrials, ({one, many}) => ({
	contentItem: one(contentItems, {
		fields: [clinicalTrials.contentItemId],
		references: [contentItems.id]
	}),
	clinicalTrialLocations: many(clinicalTrialLocations),
	clinicalTrialChanges: many(clinicalTrialChanges),
	followedTrials: many(followedTrials),
}));

export const clinicalTrialLocationsRelations = relations(clinicalTrialLocations, ({one}) => ({
	clinicalTrial: one(clinicalTrials, {
		fields: [clinicalTrialLocations.contentItemId],
		references: [clinicalTrials.contentItemId]
	}),
}));

export const clinicalTrialChangesRelations = relations(clinicalTrialChanges, ({one}) => ({
	clinicalTrial: one(clinicalTrials, {
		fields: [clinicalTrialChanges.contentItemId],
		references: [clinicalTrials.contentItemId]
	}),
}));

export const researchGrantsRelations = relations(researchGrants, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [researchGrants.contentItemId],
		references: [contentItems.id]
	}),
}));

export const regulatoryUpdatesRelations = relations(regulatoryUpdates, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [regulatoryUpdates.contentItemId],
		references: [contentItems.id]
	}),
}));

export const newsMentionsRelations = relations(newsMentions, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [newsMentions.contentItemId],
		references: [contentItems.id]
	}),
}));

export const storyClustersRelations = relations(storyClusters, ({one, many}) => ({
	contentItem: one(contentItems, {
		fields: [storyClusters.primaryContentItemId],
		references: [contentItems.id]
	}),
	storyClusterMembers: many(storyClusterMembers),
}));

export const duplicateCandidatesRelations = relations(duplicateCandidates, ({one}) => ({
	contentItem_contentItemA: one(contentItems, {
		fields: [duplicateCandidates.contentItemA],
		references: [contentItems.id],
		relationName: "duplicateCandidates_contentItemA_contentItems_id"
	}),
	contentItem_contentItemB: one(contentItems, {
		fields: [duplicateCandidates.contentItemB],
		references: [contentItems.id],
		relationName: "duplicateCandidates_contentItemB_contentItems_id"
	}),
	user: one(users, {
		fields: [duplicateCandidates.resolvedBy],
		references: [users.id]
	}),
}));

export const evidenceAssessmentsRelations = relations(evidenceAssessments, ({one}) => ({
	user: one(users, {
		fields: [evidenceAssessments.assessedBy],
		references: [users.id]
	}),
	contentItem: one(contentItems, {
		fields: [evidenceAssessments.contentItemId],
		references: [contentItems.id]
	}),
}));

export const promptVersionsRelations = relations(promptVersions, ({one, many}) => ({
	user: one(users, {
		fields: [promptVersions.createdBy],
		references: [users.id]
	}),
	generatedSummaries: many(generatedSummaries),
}));

export const generatedSummariesRelations = relations(generatedSummaries, ({one, many}) => ({
	contentItem: one(contentItems, {
		fields: [generatedSummaries.contentItemId],
		references: [contentItems.id]
	}),
	promptVersion: one(promptVersions, {
		fields: [generatedSummaries.promptVersionId],
		references: [promptVersions.id]
	}),
	generatedClaims: many(generatedClaims),
}));

export const generatedClaimsRelations = relations(generatedClaims, ({one}) => ({
	generatedSummary: one(generatedSummaries, {
		fields: [generatedClaims.generatedSummaryId],
		references: [generatedSummaries.id]
	}),
	sourceRecord: one(sourceRecords, {
		fields: [generatedClaims.sourceRecordId],
		references: [sourceRecords.id]
	}),
}));

export const householdFeedPreferencesRelations = relations(householdFeedPreferences, ({one}) => ({
	household: one(households, {
		fields: [householdFeedPreferences.householdId],
		references: [households.id]
	}),
}));

export const contentVersionsRelations = relations(contentVersions, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [contentVersions.contentItemId],
		references: [contentItems.id]
	}),
	user: one(users, {
		fields: [contentVersions.createdBy],
		references: [users.id]
	}),
}));

export const contentReviewsRelations = relations(contentReviews, ({one}) => ({
	user_assignedBy: one(users, {
		fields: [contentReviews.assignedBy],
		references: [users.id],
		relationName: "contentReviews_assignedBy_users_id"
	}),
	contentItem: one(contentItems, {
		fields: [contentReviews.contentItemId],
		references: [contentItems.id]
	}),
	user_reviewerId: one(users, {
		fields: [contentReviews.reviewerId],
		references: [users.id],
		relationName: "contentReviews_reviewerId_users_id"
	}),
}));

export const userTopicPreferencesRelations = relations(userTopicPreferences, ({one}) => ({
	topic: one(topics, {
		fields: [userTopicPreferences.topicId],
		references: [topics.id]
	}),
	user: one(users, {
		fields: [userTopicPreferences.userId],
		references: [users.id]
	}),
}));

export const followedTrialsRelations = relations(followedTrials, ({one}) => ({
	clinicalTrial: one(clinicalTrials, {
		fields: [followedTrials.contentItemId],
		references: [clinicalTrials.contentItemId]
	}),
	user: one(users, {
		fields: [followedTrials.userId],
		references: [users.id]
	}),
}));

export const followedTreatmentsRelations = relations(followedTreatments, ({one}) => ({
	topic: one(topics, {
		fields: [followedTreatments.topicId],
		references: [topics.id]
	}),
	user: one(users, {
		fields: [followedTreatments.userId],
		references: [users.id]
	}),
}));

export const savedContentRelations = relations(savedContent, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [savedContent.contentItemId],
		references: [contentItems.id]
	}),
	user: one(users, {
		fields: [savedContent.userId],
		references: [users.id]
	}),
}));

export const hiddenContentRelations = relations(hiddenContent, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [hiddenContent.contentItemId],
		references: [contentItems.id]
	}),
	user: one(users, {
		fields: [hiddenContent.userId],
		references: [users.id]
	}),
}));

export const feedImpressionsRelations = relations(feedImpressions, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [feedImpressions.contentItemId],
		references: [contentItems.id]
	}),
	user: one(users, {
		fields: [feedImpressions.userId],
		references: [users.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	household: one(households, {
		fields: [notificationPreferences.householdId],
		references: [households.id]
	}),
	user: one(users, {
		fields: [notificationPreferences.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	appointment: one(appointments, {
		fields: [notifications.appointmentId],
		references: [appointments.id]
	}),
	contentItem: one(contentItems, {
		fields: [notifications.contentItemId],
		references: [contentItems.id]
	}),
	household: one(households, {
		fields: [notifications.householdId],
		references: [households.id]
	}),
	task: one(tasks, {
		fields: [notifications.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	notificationDeliveries: many(notificationDeliveries),
}));

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationDeliveries.notificationId],
		references: [notifications.id]
	}),
}));

export const supportAccessGrantsRelations = relations(supportAccessGrants, ({one}) => ({
	user_grantedBy: one(users, {
		fields: [supportAccessGrants.grantedBy],
		references: [users.id],
		relationName: "supportAccessGrants_grantedBy_users_id"
	}),
	household: one(households, {
		fields: [supportAccessGrants.householdId],
		references: [households.id]
	}),
	user_supportUserId: one(users, {
		fields: [supportAccessGrants.supportUserId],
		references: [users.id],
		relationName: "supportAccessGrants_supportUserId_users_id"
	}),
}));

export const digestRunsRelations = relations(digestRuns, ({one}) => ({
	user: one(users, {
		fields: [digestRuns.userId],
		references: [users.id]
	}),
}));

export const auditEventsRelations = relations(auditEvents, ({one}) => ({
	user: one(users, {
		fields: [auditEvents.actorUserId],
		references: [users.id]
	}),
	household: one(households, {
		fields: [auditEvents.householdId],
		references: [households.id]
	}),
}));

export const featureFlagsRelations = relations(featureFlags, ({one}) => ({
	user: one(users, {
		fields: [featureFlags.updatedBy],
		references: [users.id]
	}),
}));

export const systemSettingsRelations = relations(systemSettings, ({one}) => ({
	user: one(users, {
		fields: [systemSettings.updatedBy],
		references: [users.id]
	}),
}));

export const educationalContentRelations = relations(educationalContent, ({one}) => ({
	user: one(users, {
		fields: [educationalContent.createdBy],
		references: [users.id]
	}),
}));

export const appointmentObservationsRelations = relations(appointmentObservations, ({one}) => ({
	appointment: one(appointments, {
		fields: [appointmentObservations.appointmentId],
		references: [appointments.id]
	}),
	observation: one(observations, {
		fields: [appointmentObservations.observationId],
		references: [observations.id]
	}),
}));

export const decisionParticipantsRelations = relations(decisionParticipants, ({one}) => ({
	decision: one(decisions, {
		fields: [decisionParticipants.decisionId],
		references: [decisions.id]
	}),
	householdMembership: one(householdMemberships, {
		fields: [decisionParticipants.membershipId],
		references: [householdMemberships.id]
	}),
}));

export const appointmentDocumentsRelations = relations(appointmentDocuments, ({one}) => ({
	appointment: one(appointments, {
		fields: [appointmentDocuments.appointmentId],
		references: [appointments.id]
	}),
	document: one(documents, {
		fields: [appointmentDocuments.documentId],
		references: [documents.id]
	}),
}));

export const decisionDocumentsRelations = relations(decisionDocuments, ({one}) => ({
	decision: one(decisions, {
		fields: [decisionDocuments.decisionId],
		references: [decisions.id]
	}),
	document: one(documents, {
		fields: [decisionDocuments.documentId],
		references: [documents.id]
	}),
}));

export const observationContextsRelations = relations(observationContexts, ({one}) => ({
	observation: one(observations, {
		fields: [observationContexts.observationId],
		references: [observations.id]
	}),
}));

export const contentSourcesRelations = relations(contentSources, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [contentSources.contentItemId],
		references: [contentItems.id]
	}),
	sourceRecord: one(sourceRecords, {
		fields: [contentSources.sourceRecordId],
		references: [sourceRecords.id]
	}),
}));

export const contentTopicsRelations = relations(contentTopics, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [contentTopics.contentItemId],
		references: [contentItems.id]
	}),
	topic: one(topics, {
		fields: [contentTopics.topicId],
		references: [topics.id]
	}),
}));

export const storyClusterMembersRelations = relations(storyClusterMembers, ({one}) => ({
	contentItem: one(contentItems, {
		fields: [storyClusterMembers.contentItemId],
		references: [contentItems.id]
	}),
	storyCluster: one(storyClusters, {
		fields: [storyClusterMembers.storyClusterId],
		references: [storyClusters.id]
	}),
}));
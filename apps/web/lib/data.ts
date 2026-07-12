import type { Session } from "@/lib/session";
import {
  db,
  appointments,
  appointmentQuestions,
  careRecipients,
  contentItems,
  documents,
  familyUpdates,
  householdFeedPreferences,
  householdMemberships,
  households,
  medicationEvents,
  medications,
  observationContexts,
  observations,
  tasks,
  users,
  eq,
  and,
  desc,
  asc,
  sql,
  inArray,
  isNull,
  count,
} from "@clarity/db";

const MARIA = "00000000-0000-4000-a000-000000000001";
const CARLOS = "00000000-0000-4000-a000-000000000002";
const JEN = "00000000-0000-4000-a000-000000000003";
const HOUSEHOLD = "10000000-0000-4000-a000-000000000001";
const RECIPIENT = "20000000-0000-4000-a000-000000000001";

type DemoUser = {
  id: string;
  name: string;
  role: string;
  relationship: string | null;
};

const demoUsers: DemoUser[] = [
  { id: CARLOS, name: "Carlos Delgado", role: "care_coordinator", relationship: "son" },
  { id: JEN, name: "Jen Alvarez", role: "contributor", relationship: "daughter" },
  { id: MARIA, name: "Maria Delgado", role: "owner", relationship: "spouse" },
];

const demoSessionByUser: Record<string, Session> = Object.fromEntries(
  demoUsers.map((u) => [
    u.id,
    {
      user: {
        id: u.id,
        displayName: u.name,
        email: `${u.name.split(" ")[0].toLowerCase()}@example.test`,
      },
      membership: {
        id: `30000000-0000-4000-a000-${u.id.slice(-12)}`,
        role: u.role,
        relationship: u.relationship,
      },
      household: {
        id: HOUSEHOLD,
        name: "Delgado family",
        navigationPhase: "preparing_evaluation",
      },
      recipient: {
        id: RECIPIENT,
        preferredName: "Elena",
        birthYear: 1948,
        generalLocation: "Austin, TX",
        pronouns: "she/her",
      },
    } satisfies Session,
  ]),
);

const now = Date.now();
const daysFromNow = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000);

const fixture = {
  nextAppointment: {
    id: "fixture-appt-1",
    clinicianName: "Dr. Nisha Patel",
    specialty: "Neurology",
    location: "Austin Memory Clinic",
    startsAt: daysFromNow(6),
    purpose: "Initial memory evaluation and medication review",
    notes: null as string | null,
  },
  upcomingAppointments: [
    {
      id: "fixture-appt-1",
      clinicianName: "Dr. Nisha Patel",
      specialty: "Neurology",
      location: "Austin Memory Clinic",
      startsAt: daysFromNow(6),
      purpose: "Initial memory evaluation and medication review",
      notes: null as string | null,
    },
    {
      id: "fixture-appt-2",
      clinicianName: "Dr. Aaron Kim",
      specialty: "Primary care",
      location: "Telehealth",
      startsAt: daysFromNow(18),
      purpose: "Review blood pressure and sleep notes",
      notes: null as string | null,
    },
  ],
  pastAppointments: [
    {
      id: "fixture-appt-past-1",
      clinicianName: "Dr. Aaron Kim",
      specialty: "Primary care",
      location: "Cedar Family Medicine",
      startsAt: daysFromNow(-21),
      purpose: "Annual visit",
      notes: "Family asked whether a memory clinic referral made sense.",
    },
  ],
  appointmentQuestions: [
    {
      id: "fixture-question-1",
      appointmentId: "fixture-appt-1",
      question: "Which changes should we track before the follow-up?",
    },
    {
      id: "fixture-question-2",
      appointmentId: "fixture-appt-1",
      question: "Could sleep or medication timing be affecting memory?",
    },
    {
      id: "fixture-question-3",
      appointmentId: "fixture-appt-1",
      question: "What should prompt an urgent call?",
    },
  ],
  openTasks: [
    { id: "fixture-task-1", title: "Bring updated medication list", priority: "high", dueOn: daysFromNow(4) },
    { id: "fixture-task-2", title: "Ask Jen to upload power of attorney scan", priority: "medium", dueOn: daysFromNow(10) },
    { id: "fixture-task-3", title: "Write down examples of word-finding trouble", priority: "medium", dueOn: null },
  ],
  observations: [
    {
      id: "fixture-obs-1",
      category: "word_finding",
      description: "Paused several times while telling a story and substituted broad words like \"thing\".",
      observedAt: daysFromNow(-1),
      isRecurring: true,
      functionalImpact: "Conversation needed extra time but stayed warm and understandable.",
      includeInBrief: true,
      observer: "Maria Delgado",
    },
    {
      id: "fixture-obs-2",
      category: "positive_stable",
      description: "Cooked a familiar soup recipe with only light help gathering ingredients.",
      observedAt: daysFromNow(-3),
      isRecurring: false,
      functionalImpact: null as string | null,
      includeInBrief: false,
      observer: "Carlos Delgado",
    },
    {
      id: "fixture-obs-3",
      category: "orientation",
      description: "Asked twice whether the appointment was today after seeing the calendar reminder.",
      observedAt: daysFromNow(-5),
      isRecurring: true,
      functionalImpact: "Needed reassurance and a written note on the kitchen counter.",
      includeInBrief: true,
      observer: "Jen Alvarez",
    },
  ],
  observationContexts: new Map([
    ["fixture-obs-1", ["Tired", "Evening"]],
    ["fixture-obs-3", ["Calendar change"]],
  ]),
  familyUpdate: {
    title: "Good walk after lunch",
    body: "Elena seemed more relaxed after a short walk and remembered Carlos was visiting tomorrow.",
    createdAt: daysFromNow(-1),
    author: "Maria Delgado",
  },
  medications: [
    {
      id: "fixture-med-1",
      name: "Lisinopril",
      dosageText: "10 mg",
      frequencyText: "Once each morning",
      reason: "blood pressure",
      prescriber: "Dr. Aaron Kim",
      infoSource: "family list",
      lastConfirmedOn: daysFromNow(-14),
    },
    {
      id: "fixture-med-2",
      name: "Vitamin D3",
      dosageText: "1000 IU",
      frequencyText: "Daily",
      reason: "supplement",
      prescriber: null as string | null,
      infoSource: "bottle label",
      lastConfirmedOn: daysFromNow(-12),
    },
  ],
  medicationEvents: [
    {
      id: "fixture-med-event-1",
      type: "missed_dose",
      occurredAt: daysFromNow(-2),
      note: "Morning dose skipped before lab appointment.",
      medication: "Lisinopril",
    },
    {
      id: "fixture-med-event-2",
      type: "confirmed_taken",
      occurredAt: daysFromNow(-4),
      note: "Confirmed from pill organizer.",
      medication: "Vitamin D3",
    },
  ],
  documents: [
    {
      id: "fixture-doc-1",
      title: "Medication list - June update",
      recordType: "medication_list",
      issuingOrganization: "Cedar Family Medicine",
      documentDate: daysFromNow(-18),
      byteSize: 284000,
      virusScanStatus: "clean",
    },
    {
      id: "fixture-doc-2",
      title: "Neurology referral",
      recordType: "referral",
      issuingOrganization: "Cedar Family Medicine",
      documentDate: daysFromNow(-9),
      byteSize: 176000,
      virusScanStatus: "clean",
    },
  ],
  research: [
    {
      id: "fixture-content-1",
      contentType: "research_paper",
      evidenceStrength: "moderate",
      populationType: "human",
      displayHeadline: "Structured caregiver notes may improve memory clinic visit quality",
      plainSubheading: "A study found that specific examples helped clinicians understand day-to-day function faster.",
      actionability: "care_planning_relevant",
      primaryPublicationDate: daysFromNow(-20),
      primarySourceUrl: "https://example.test/research/caregiver-notes",
    },
    {
      id: "fixture-content-2",
      contentType: "clinical_trial",
      evidenceStrength: "not_applicable",
      populationType: "human",
      displayHeadline: "Austin trial recruiting people with mild cognitive impairment",
      plainSubheading: "This is a listing, not a treatment recommendation. Ask a clinician before acting.",
      actionability: "ask_clinician",
      primaryPublicationDate: daysFromNow(-35),
      primarySourceUrl: "https://example.test/trials/austin-mci",
    },
    {
      id: "fixture-content-3",
      contentType: "research_paper",
      evidenceStrength: "very_preliminary",
      populationType: "animal",
      displayHeadline: "Animal study explores inflammation markers",
      plainSubheading: "Interesting early science, but not yet evidence for people or care decisions.",
      actionability: "worth_watching",
      primaryPublicationDate: daysFromNow(-42),
      primarySourceUrl: null as string | null,
    },
  ],
  members: demoUsers.map((u) => ({
    id: `30000000-0000-4000-a000-${u.id.slice(-12)}`,
    role: u.role,
    relationship: u.relationship,
    name: u.name,
    email: `${u.name.split(" ")[0].toLowerCase()}@example.test`,
  })),
  feedPreferences: {
    trialRadiusKm: 80,
    trialCenterPostalCode: "78704",
    includePreliminary: true,
    includeAnimalStudies: false,
  },
};

export function usingFixtureData(): boolean {
  return process.env.CLARITY_DATA_MODE === "fixture" || !process.env.DATABASE_URL;
}

export async function getLoginUsers(): Promise<DemoUser[]> {
  if (usingFixtureData()) return demoUsers;

  return db
    .select({
      id: users.id,
      name: users.displayName,
      role: householdMemberships.role,
      relationship: householdMemberships.relationship,
    })
    .from(users)
    .innerJoin(householdMemberships, eq(householdMemberships.userId, users.id))
    .orderBy(users.displayName);
}

export async function isValidLoginUser(userId: string): Promise<boolean> {
  if (usingFixtureData()) return Boolean(demoSessionByUser[userId]);

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(
      householdMemberships,
      and(eq(householdMemberships.userId, users.id), eq(householdMemberships.isActive, true)),
    )
    .where(eq(users.id, userId))
    .limit(1);

  return Boolean(rows[0]);
}

export async function getSessionForUser(userId: string): Promise<Session | null> {
  if (usingFixtureData()) return demoSessionByUser[userId] ?? null;

  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      membershipId: householdMemberships.id,
      role: householdMemberships.role,
      relationship: householdMemberships.relationship,
      householdId: households.id,
      householdName: households.name,
      navigationPhase: households.navigationPhase,
    })
    .from(users)
    .innerJoin(
      householdMemberships,
      and(eq(householdMemberships.userId, users.id), eq(householdMemberships.isActive, true)),
    )
    .innerJoin(
      households,
      and(eq(households.id, householdMemberships.householdId), isNull(households.deletedAt)),
    )
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const recipients = await db
    .select({
      id: careRecipients.id,
      preferredName: careRecipients.preferredName,
      birthYear: careRecipients.birthYear,
      generalLocation: careRecipients.generalLocation,
      pronouns: careRecipients.pronouns,
    })
    .from(careRecipients)
    .where(eq(careRecipients.householdId, row.householdId))
    .limit(1);

  return {
    user: { id: row.userId, displayName: row.displayName, email: row.email as string },
    membership: { id: row.membershipId, role: row.role, relationship: row.relationship },
    household: { id: row.householdId, name: row.householdName, navigationPhase: row.navigationPhase },
    recipient: recipients[0] ?? null,
  };
}

export async function getDashboardData(session: Session) {
  if (usingFixtureData()) {
    return {
      nextAppt: fixture.nextAppointment,
      openTasks: fixture.openTasks,
      recentObs: fixture.observations.slice(0, 3),
      update: fixture.familyUpdate,
    };
  }

  const hh = session.household.id;
  const [nextAppt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.householdId, hh), sql`${appointments.startsAt} >= now()`))
    .orderBy(asc(appointments.startsAt))
    .limit(1);

  const openTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, hh), inArray(tasks.status, ["open", "in_progress"])))
    .orderBy(asc(tasks.dueOn))
    .limit(4);

  const recentObs = await db
    .select()
    .from(observations)
    .where(eq(observations.householdId, hh))
    .orderBy(desc(observations.observedAt))
    .limit(3);

  const updates = await db
    .select({
      title: familyUpdates.title,
      body: familyUpdates.body,
      createdAt: familyUpdates.createdAt,
      author: users.displayName,
    })
    .from(familyUpdates)
    .innerJoin(users, eq(users.id, familyUpdates.authorId))
    .where(eq(familyUpdates.householdId, hh))
    .orderBy(desc(familyUpdates.createdAt))
    .limit(1);

  return { nextAppt, openTasks, recentObs, update: updates[0] ?? null };
}

export async function getCareRecipientStats(session: Session) {
  if (usingFixtureData()) {
    return {
      observations: fixture.observations.length,
      medications: fixture.medications.length,
      documents: fixture.documents.length,
      appointments: fixture.upcomingAppointments.length,
      openTasks: fixture.openTasks.length,
    };
  }

  const hh = session.household.id;
  const [[obs], [meds], [docs], [appts], [openTasks]] = await Promise.all([
    db.select({ n: count() }).from(observations).where(eq(observations.householdId, hh)),
    db
      .select({ n: count() })
      .from(medications)
      .where(and(eq(medications.householdId, hh), eq(medications.isActive, true))),
    db
      .select({ n: count() })
      .from(documents)
      .where(and(eq(documents.householdId, hh), isNull(documents.deletedAt))),
    db
      .select({ n: count() })
      .from(appointments)
      .where(and(eq(appointments.householdId, hh), sql`${appointments.startsAt} >= now()`)),
    db
      .select({ n: count() })
      .from(tasks)
      .where(and(eq(tasks.householdId, hh), inArray(tasks.status, ["open", "in_progress"]))),
  ]);

  return {
    observations: obs.n,
    medications: meds.n,
    documents: docs.n,
    appointments: appts.n,
    openTasks: openTasks.n,
  };
}

export async function getObservationsData(session: Session) {
  if (usingFixtureData()) {
    return {
      rows: fixture.observations,
      contextsByObservation: fixture.observationContexts,
    };
  }

  const rows = await db
    .select({
      id: observations.id,
      category: observations.category,
      description: observations.description,
      observedAt: observations.observedAt,
      isRecurring: observations.isRecurring,
      functionalImpact: observations.functionalImpact,
      includeInBrief: observations.includeInBrief,
      observer: users.displayName,
    })
    .from(observations)
    .leftJoin(householdMemberships, eq(householdMemberships.id, observations.observerMembershipId))
    .leftJoin(users, eq(users.id, householdMemberships.userId))
    .where(eq(observations.householdId, session.household.id))
    .orderBy(desc(observations.observedAt));

  const ids = rows.map((r) => r.id);
  const contexts = ids.length
    ? await db.select().from(observationContexts).where(inArray(observationContexts.observationId, ids))
    : [];
  const contextsByObservation = new Map<string, string[]>();
  for (const c of contexts) {
    contextsByObservation.set(c.observationId, [
      ...(contextsByObservation.get(c.observationId) ?? []),
      c.factor.replaceAll("_", " ").replace(/^\w/, (ch) => ch.toUpperCase()),
    ]);
  }

  return { rows, contextsByObservation };
}

export async function getMedicationsData(session: Session) {
  if (usingFixtureData()) {
    return {
      meds: fixture.medications,
      events: fixture.medicationEvents,
    };
  }

  const hh = session.household.id;
  const meds = await db
    .select()
    .from(medications)
    .where(and(eq(medications.householdId, hh), eq(medications.isActive, true)))
    .orderBy(medications.name);

  const events = await db
    .select({
      id: medicationEvents.id,
      type: medicationEvents.eventType,
      occurredAt: medicationEvents.occurredAt,
      note: medicationEvents.note,
      medication: medications.name,
    })
    .from(medicationEvents)
    .innerJoin(medications, eq(medications.id, medicationEvents.medicationId))
    .where(eq(medicationEvents.householdId, hh))
    .orderBy(desc(medicationEvents.occurredAt))
    .limit(10);

  return { meds, events };
}

export async function getAppointmentsData(session: Session) {
  if (usingFixtureData()) {
    const qByAppt = new Map<string, typeof fixture.appointmentQuestions>();
    for (const q of fixture.appointmentQuestions) {
      qByAppt.set(q.appointmentId, [...(qByAppt.get(q.appointmentId) ?? []), q]);
    }
    return {
      upcoming: fixture.upcomingAppointments,
      past: fixture.pastAppointments,
      questionsByAppointment: qByAppt,
    };
  }

  const hh = session.household.id;
  const upcoming = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.householdId, hh), sql`${appointments.startsAt} >= now()`))
    .orderBy(asc(appointments.startsAt));

  const past = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.householdId, hh), sql`${appointments.startsAt} < now()`))
    .orderBy(desc(appointments.startsAt))
    .limit(10);

  const upcomingIds = upcoming.map((a) => a.id);
  const questions = upcomingIds.length
    ? await db
        .select()
        .from(appointmentQuestions)
        .where(inArray(appointmentQuestions.appointmentId, upcomingIds))
        .orderBy(asc(appointmentQuestions.position))
    : [];
  const questionsByAppointment = new Map<string, typeof questions>();
  for (const q of questions) {
    questionsByAppointment.set(q.appointmentId, [
      ...(questionsByAppointment.get(q.appointmentId) ?? []),
      q,
    ]);
  }

  return { upcoming, past, questionsByAppointment };
}

export async function getDocumentsData(session: Session) {
  if (usingFixtureData()) return fixture.documents;

  return db
    .select()
    .from(documents)
    .where(and(eq(documents.householdId, session.household.id), isNull(documents.deletedAt)))
    .orderBy(desc(documents.documentDate));
}

export async function getResearchData() {
  if (usingFixtureData()) return fixture.research;

  return db
    .select()
    .from(contentItems)
    .where(eq(contentItems.status, "published"))
    .orderBy(desc(contentItems.publishedAt))
    .limit(30);
}

export async function getSettingsData(session: Session) {
  if (usingFixtureData()) {
    return {
      members: fixture.members,
      prefs: fixture.feedPreferences,
    };
  }

  const hh = session.household.id;
  const members = await db
    .select({
      id: householdMemberships.id,
      role: householdMemberships.role,
      relationship: householdMemberships.relationship,
      name: users.displayName,
      email: users.email,
    })
    .from(householdMemberships)
    .innerJoin(users, eq(users.id, householdMemberships.userId))
    .where(and(eq(householdMemberships.householdId, hh), eq(householdMemberships.isActive, true)))
    .orderBy(users.displayName);

  const [prefs] = await db
    .select()
    .from(householdFeedPreferences)
    .where(eq(householdFeedPreferences.householdId, hh));

  return { members, prefs: prefs ?? null };
}

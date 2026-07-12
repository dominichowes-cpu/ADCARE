export function fmtDate(v: string | Date | null | undefined): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(v: string | Date | null | undefined): string {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function titleize(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export const phaseLabels: Record<string, string> = {
  noticing_changes: "Noticing changes",
  preparing_evaluation: "Preparing for evaluation",
  evaluation_underway: "Evaluation underway",
  mci_or_uncertain: "MCI or uncertain",
  diagnosed_independent: "Diagnosed, living independently",
  increasing_assistance: "Increasing assistance",
  advanced_care: "Advanced care",
  not_sure: "Not sure yet",
};

export const observationCategoryLabels: Record<string, string> = {
  memory_repetition: "Memory & repetition",
  word_finding: "Word finding",
  orientation: "Orientation",
  planning_organization: "Planning & organization",
  medication_management: "Medication management",
  finances: "Finances",
  driving_navigation: "Driving & navigation",
  cooking_household: "Cooking & household",
  personal_care: "Personal care",
  mood_anxiety: "Mood & anxiety",
  sleep: "Sleep",
  balance_falls: "Balance & falls",
  illness_infection: "Illness & infection",
  social_engagement: "Social engagement",
  positive_stable: "Positive & stable",
  other: "Other",
};

export const evidenceLabels: Record<string, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  preliminary: "Preliminary",
  very_preliminary: "Very preliminary",
  not_applicable: "Trial listing",
  insufficient_information: "Unrated",
};

export const actionabilityLabels: Record<string, string> = {
  no_action: "For awareness",
  worth_watching: "Worth watching",
  ask_clinician: "Worth asking a clinician about",
  care_planning_relevant: "Relevant to care planning",
  official_safety: "Official safety information",
  administrative: "Administrative",
};

export const contentTypeLabels: Record<string, string> = {
  research_paper: "Research",
  clinical_trial: "Clinical trial",
  research_grant: "Grant",
  regulatory_update: "Official update",
  news_mention: "News",
  caregiving_guidance: "Caregiving",
  system_announcement: "Announcement",
};

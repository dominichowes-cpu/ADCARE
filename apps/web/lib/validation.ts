// Shared validation for care-data writes. Deliberately dependency-free so the
// browser can validate before storing anything in the local private vault.

export const observationCategories = [
  "memory_repetition", "word_finding", "orientation", "planning_organization",
  "medication_management", "finances", "driving_navigation", "cooking_household",
  "personal_care", "mood_anxiety", "sleep", "balance_falls", "illness_infection",
  "social_engagement", "positive_stable", "other",
] as const;

export type ObservationCategory = (typeof observationCategories)[number];

export type ObservationInput = {
  category: ObservationCategory;
  description: string;
  observedAt: Date;
  isRecurring: boolean;
  functionalImpact: string | null;
  includeInBrief: boolean;
};

export type ValidationResult =
  | { ok: true; value: ObservationInput }
  | { ok: false; errors: Record<string, string> };

const MAX_DESCRIPTION = 2000;
const MAX_IMPACT = 1000;
const FUTURE_GRACE_MS = 5 * 60 * 1000; // small clock-skew allowance

export function validateObservationInput(form: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const rawCategory = String(form.get("category") ?? "");
  const category = observationCategories.find((c) => c === rawCategory);
  if (!category) errors.category = "Choose the area this belongs to.";

  const description = String(form.get("description") ?? "").trim();
  if (description.length < 3) {
    errors.description = "Describe what you noticed in a sentence or two.";
  } else if (description.length > MAX_DESCRIPTION) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION} characters.`;
  }

  const rawObservedAt = String(form.get("observedAt") ?? "");
  const observedAt = new Date(rawObservedAt);
  if (!rawObservedAt || Number.isNaN(observedAt.getTime())) {
    errors.observedAt = "Enter when this happened.";
  } else if (observedAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
    errors.observedAt = "The date can't be in the future.";
  } else if (observedAt.getFullYear() < 2000) {
    errors.observedAt = "That date looks too far in the past.";
  }

  const functionalImpactRaw = String(form.get("functionalImpact") ?? "").trim();
  if (functionalImpactRaw.length > MAX_IMPACT) {
    errors.functionalImpact = `Keep this under ${MAX_IMPACT} characters.`;
  }

  const isRecurring = String(form.get("recurrence") ?? "one_time") === "recurring";
  const includeInBrief = form.get("includeInBrief") === "on";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      category: category!,
      description,
      observedAt,
      isRecurring,
      functionalImpact: functionalImpactRaw || null,
      includeInBrief,
    },
  };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const taskPriorities = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof taskPriorities)[number];

export type TaskInput = {
  title: string;
  details: string | null;
  dueOn: string | null; // YYYY-MM-DD
  priority: TaskPriority;
  assignee: string | null;
};

export type TaskValidation = { ok: true; value: TaskInput } | { ok: false; errors: Record<string, string> };

export function validateTaskInput(form: FormData): TaskValidation {
  const errors: Record<string, string> = {};

  const title = String(form.get("title") ?? "").trim();
  if (title.length < 2) errors.title = "Give the task a short name.";
  else if (title.length > 200) errors.title = "Keep the title under 200 characters.";

  const details = String(form.get("details") ?? "").trim();
  if (details.length > 2000) errors.details = "Keep details under 2000 characters.";

  const dueOnRaw = String(form.get("dueOn") ?? "").trim();
  let dueOn: string | null = null;
  if (dueOnRaw) {
    const parsedDueOn = new Date(`${dueOnRaw}T00:00:00Z`);
    const validCalendarDate =
      !Number.isNaN(parsedDueOn.getTime()) && parsedDueOn.toISOString().slice(0, 10) === dueOnRaw;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueOnRaw) || !validCalendarDate) {
      errors.dueOn = "Enter a valid date.";
    } else {
      dueOn = dueOnRaw;
    }
  }

  const priorityRaw = String(form.get("priority") ?? "medium");
  const priority = taskPriorities.find((v) => v === priorityRaw);
  if (!priority) errors.priority = "Choose a priority.";

  const assignee = String(form.get("assignee") ?? "").trim();
  if (assignee.length > 120) errors.assignee = "Keep this under 120 characters.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { title, details: details || null, dueOn, priority: priority!, assignee: assignee || null },
  };
}

// ---------------------------------------------------------------------------
// Medication records (record-keeping only; no clinical logic anywhere)
// ---------------------------------------------------------------------------

export const medicationStatuses = ["active", "paused", "stopped"] as const;
export type MedicationStatus = (typeof medicationStatuses)[number];

export type MedicationRecordInput = {
  name: string;
  strength: string | null;
  instructions: string | null;
  purpose: string | null;
  prescriber: string | null;
  pharmacy: string | null;
  status: MedicationStatus;
  notes: string | null;
};

export type MedicationValidation =
  | { ok: true; value: MedicationRecordInput }
  | { ok: false; errors: Record<string, string> };

function optional(form: FormData, key: string, max: number, errors: Record<string, string>, label: string): string | null {
  const value = String(form.get(key) ?? "").trim();
  if (value.length > max) {
    errors[key] = `Keep ${label} under ${max} characters.`;
    return null;
  }
  return value || null;
}

export function validateMedicationInput(form: FormData): MedicationValidation {
  const errors: Record<string, string> = {};

  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) errors.name = "Enter the medication name as written on the label.";
  else if (name.length > 200) errors.name = "Keep the name under 200 characters.";

  const strength = optional(form, "strength", 200, errors, "strength");
  const instructions = optional(form, "instructions", 500, errors, "instructions");
  const purpose = optional(form, "purpose", 200, errors, "purpose");
  const prescriber = optional(form, "prescriber", 200, errors, "prescriber");
  const pharmacy = optional(form, "pharmacy", 200, errors, "pharmacy");
  const notes = optional(form, "notes", 2000, errors, "notes");

  const statusRaw = String(form.get("status") ?? "active");
  const status = medicationStatuses.find((v) => v === statusRaw);
  if (!status) errors.status = "Choose a status.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, strength, instructions, purpose, prescriber, pharmacy, status: status!, notes } };
}

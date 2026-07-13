// Server-side validation for care-data writes. Deliberately dependency-free.

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

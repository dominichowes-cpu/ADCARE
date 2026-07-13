"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { validateObservationInput } from "@/lib/validation";
import { createObservation } from "@/lib/data";

export type ObservationFormState = {
  errors: Record<string, string>;
  message: string | null;
};

export async function createObservationAction(
  _prev: ObservationFormState,
  formData: FormData,
): Promise<ObservationFormState> {
  const session = await requireSession();

  const validation = validateObservationInput(formData);
  if (!validation.ok) {
    return { errors: validation.errors, message: null };
  }

  const result = await createObservation(session, validation.value);
  if (!result.ok) {
    return { errors: {}, message: result.message };
  }

  redirect("/observations");
}

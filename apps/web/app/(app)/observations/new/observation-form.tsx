"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createObservationAction, type ObservationFormState } from "./actions";

const initialState: ObservationFormState = { errors: {}, message: null };

type CategoryOption = { value: string; label: string };

function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-bold">{label}</label>
      {hint ? <p className="mt-0.5 text-[0.9rem] text-mist">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-[0.9rem] text-clay">{error}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";

export function ObservationForm({
  categories, defaultObservedAt, recipientName, fixtureMode,
}: {
  categories: CategoryOption[];
  defaultObservedAt: string;
  recipientName: string;
  fixtureMode: boolean;
}) {
  const [state, formAction, pending] = useActionState(createObservationAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {fixtureMode ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-[0.95rem]">
          Preview mode: this entry will appear in the list but is kept in memory
          only and disappears when the server restarts. Nothing is saved.
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-clay/40 bg-clay/10 px-4 py-3">{state.message}</p>
      ) : null}

      <Field label="What area does this belong to?" error={state.errors.category}>
        <select name="category" className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="What did you notice?"
        hint={`Plain and specific beats clinical. "${recipientName} asked three times when the appointment was" is more useful than "memory was bad."`}
        error={state.errors.description}
      >
        <textarea name="description" rows={4} className={inputClass} maxLength={2000} />
      </Field>

      <Field label="When did this happen?" error={state.errors.observedAt}>
        <input
          type="datetime-local"
          name="observedAt"
          defaultValue={defaultObservedAt}
          className={inputClass}
        />
      </Field>

      <Field label="Is this new, or part of a pattern?">
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="recurrence" value="one_time" defaultChecked className="accent-teal" />
            One-time, so far
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="recurrence" value="recurring" className="accent-teal" />
            It keeps happening
          </label>
        </div>
      </Field>

      <Field
        label="Did it affect the day? (optional)"
        hint="For example: needed a reminder note, arrived late, chose not to drive."
        error={state.errors.functionalImpact}
      >
        <textarea name="functionalImpact" rows={2} className={inputClass} maxLength={1000} />
      </Field>

      <Field label="">
        <label className="flex items-start gap-2">
          <input type="checkbox" name="includeInBrief" className="mt-1.5 accent-teal" />
          <span>
            <span className="font-bold">Include in the next clinician brief</span>
            <span className="block text-[0.9rem] text-mist">
              Selected observations are gathered into the appointment summary you choose to share.
            </span>
          </span>
        </label>
      </Field>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal px-5 py-2.5 font-bold text-paper hover:bg-teal-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save observation"}
        </button>
        <Link href="/observations" className="text-mist underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

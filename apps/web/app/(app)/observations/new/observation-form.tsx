"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalVaultStatus, saveLocalObservation } from "@/lib/local-vault";
import { validateObservationInput } from "@/lib/validation";

type ObservationFormState = {
  errors: Record<string, string>;
  message: string | null;
};

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
  categories, defaultObservedAt, recipientName, observerName,
}: {
  categories: CategoryOption[];
  defaultObservedAt: string;
  recipientName: string;
  observerName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [vaultState, setVaultState] = useState<"checking" | "unconfigured" | "locked" | "unlocked">("checking");

  async function refreshVaultState() {
    const status = await getLocalVaultStatus();
    setVaultState(status.state);
  }

  useEffect(() => {
    void refreshVaultState();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialState);

    const formData = new FormData(event.currentTarget);
    const validation = validateObservationInput(formData);
    if (!validation.ok) {
      setState({ errors: validation.errors, message: null });
      setPending(false);
      return;
    }

    const result = await saveLocalObservation(validation.value, {
      observer: observerName,
      passphrase: String(formData.get("vaultPassphrase") ?? ""),
    });

    if (!result.ok) {
      setState({ errors: {}, message: result.message });
      setPending(false);
      return;
    }

    setPending(false);
    router.push("/observations");
  }

  const needsPassphrase = vaultState === "unconfigured" || vaultState === "locked";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <p className="rounded-lg border border-teal/25 bg-sage-soft px-4 py-3 text-[0.95rem]">
        Local-first mode: this observation is encrypted in this browser&apos;s private vault.
        It is not sent to ADCARE servers or Postgres.
      </p>
      {state.message ? (
        <p className="rounded-lg border border-clay/40 bg-clay/10 px-4 py-3">{state.message}</p>
      ) : null}

      {vaultState === "checking" ? (
        <p className="rounded-lg border border-line bg-card/75 px-4 py-3 text-[0.95rem] text-mist">
          Checking this browser&apos;s private vault...
        </p>
      ) : needsPassphrase ? (
        <Field
          label={vaultState === "unconfigured" ? "Create a private vault passphrase" : "Unlock private vault"}
          hint={
            vaultState === "unconfigured"
              ? "This passphrase protects data stored in this browser. ADCARE cannot recover it."
              : "Enter the passphrase for this browser's encrypted vault before saving."
          }
        >
          <input
            autoComplete="current-password"
            className={inputClass}
            minLength={8}
            name="vaultPassphrase"
            type="password"
          />
        </Field>
      ) : (
        <p className="rounded-lg border border-line bg-card/75 px-4 py-3 text-[0.95rem] text-mist">
          Private vault unlocked for this browser session.
        </p>
      )}

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

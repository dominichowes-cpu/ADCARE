"use client";

import { FormEvent, useId, useState } from "react";
import { Chip, Empty } from "@/components/ui";
import { fmtDate } from "@/lib/labels";
import { UnlockPrompt } from "@/components/local-observations";
import {
  ConfirmDelete, VaultPassphraseField, buttonClass, inputClass, primaryButtonClass, useLocalVault,
} from "@/components/local-shared";
import { validateMedicationInput } from "@/lib/validation";
import {
  deleteLocalMedicationRecord, saveLocalMedicationRecord, setLocalMedicationStatus,
  updateLocalMedicationRecord, type LocalMedicationRecord,
} from "@/lib/local-vault";

const statusTone: Record<string, "sage" | "amber" | "neutral"> = {
  active: "sage",
  paused: "amber",
  stopped: "neutral",
};

function MedFormFields({ initial, errors }: { initial?: LocalMedicationRecord; errors: Record<string, string> }) {
  const prefix = `med-${useId().replace(/:/g, "")}`;
  const fieldId = (name: string) => `${prefix}-${name}`;
  const text = (name: string, label: string, key: keyof LocalMedicationRecord, max: number, hint?: string) => (
    <div>
      <label className="block font-bold" htmlFor={fieldId(name)}>{label}</label>
      {hint ? <p className="mt-0.5 text-[0.9rem] text-mist">{hint}</p> : null}
      <input className={`${inputClass} mt-1.5`} defaultValue={(initial?.[key] as string | null) ?? ""} id={fieldId(name)} maxLength={max} name={String(key)} type="text" />
      {errors[String(key)] ? <p className="mt-1 text-[0.9rem] text-clay">{errors[String(key)]}</p> : null}
    </div>
  );

  return (
    <>
      {text("name", "Medication name", "name", 200, "Exactly as written on the label or pharmacy list.")}
      <div className="grid gap-3 sm:grid-cols-2">
        {text("strength", "Strength (optional)", "strength", 200, 'Free text — e.g. "10 mg tablets".')}
        {text("instructions", "Instructions (optional)", "instructions", 500, "As written; ADCARE never interprets them.")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {text("purpose", "What it's for (optional)", "purpose", 200)}
        {text("prescriber", "Prescriber (optional)", "prescriber", 200)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {text("pharmacy", "Pharmacy (optional)", "pharmacy", 200)}
        <div>
          <label className="block font-bold" htmlFor={fieldId("status")}>Status</label>
          <select className={`${inputClass} mt-1.5`} defaultValue={initial?.status ?? "active"} id={fieldId("status")} name="status">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block font-bold" htmlFor={fieldId("notes")}>Notes (optional)</label>
        <textarea className={`${inputClass} mt-1.5`} defaultValue={initial?.notes ?? ""} id={fieldId("notes")} maxLength={2000} name="notes" rows={2} />
        {errors.notes ? <p className="mt-1 text-[0.9rem] text-clay">{errors.notes}</p> : null}
      </div>
    </>
  );
}

function MedicationCard({ med, onChanged }: { med: LocalMedicationRecord; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function setStatus(status: "active" | "paused" | "stopped") {
    setMessage(null);
    const result = await setLocalMedicationStatus(med.id, status);
    if (!result.ok) setMessage(result.message);
    await onChanged();
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    const validation = validateMedicationInput(new FormData(event.currentTarget));
    if (!validation.ok) {
      setErrors(validation.errors);
      setPending(false);
      return;
    }
    const result = await updateLocalMedicationRecord(med.id, validation.value);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setEditing(false);
    await onChanged();
  }

  return (
    <li className="rounded-lg border border-line bg-card/95 p-4 shadow-[0_14px_45px_rgba(27,42,65,0.05)]">
      {editing ? (
        <form className="space-y-3" onSubmit={handleEdit}>
          <MedFormFields errors={errors} initial={med} />
          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} disabled={pending} type="submit">
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button className={buttonClass} onClick={() => setEditing(false)} type="button">Cancel</button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-lg font-semibold">
              {med.name}
              {med.strength ? <span className="text-mist"> · {med.strength}</span> : null}
            </p>
            <span className="flex items-center gap-2">
              <Chip tone={statusTone[med.status]}>{med.status}</Chip>
              <Chip tone="sage">Local only</Chip>
            </span>
          </div>
          {med.instructions ? <p className="mt-1">{med.instructions}</p> : null}
          <p className="mt-1 text-[0.9rem] text-mist">
            {[med.purpose ? `For ${med.purpose}` : null, med.prescriber ? `Prescribed by ${med.prescriber}` : null, med.pharmacy]
              .filter(Boolean)
              .join(" · ") || "No further details recorded."}
          </p>
          {med.notes ? <p className="mt-1 text-[0.9rem] text-mist">Notes: {med.notes}</p> : null}
          <p className="mt-1 text-[0.85rem] text-mist">
            Added {fmtDate(new Date(med.createdAt))}
            {med.updatedAt ? " · edited" : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {med.status !== "active" ? (
              <button className={buttonClass} onClick={() => setStatus("active")} type="button">Mark active</button>
            ) : null}
            {med.status === "active" ? (
              <button className={buttonClass} onClick={() => setStatus("paused")} type="button">Mark paused</button>
            ) : null}
            {med.status !== "stopped" ? (
              <button className={buttonClass} onClick={() => setStatus("stopped")} type="button">Mark stopped</button>
            ) : null}
            <button className={buttonClass} onClick={() => setEditing(true)} type="button">Edit</button>
            <ConfirmDelete
              confirmLabel="Delete this medication record?"
              label="Delete"
              onConfirm={async () => {
                const result = await deleteLocalMedicationRecord(med.id);
                if (!result.ok) setMessage(result.message);
                await onChanged();
              }}
            />
          </div>
        </div>
      )}
      {message ? <p className="mt-2 text-[0.9rem] text-clay">{message}</p> : null}
    </li>
  );
}

export function LocalMedications() {
  const [load, refresh] = useLocalVault();
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setErrors({});
    setMessage(null);
    const formData = new FormData(form);
    const validation = validateMedicationInput(formData);
    if (!validation.ok) {
      setErrors(validation.errors);
      setPending(false);
      return;
    }
    const result = await saveLocalMedicationRecord(validation.value, {
      passphrase: String(formData.get("vaultPassphrase") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    form.reset();
    setCreating(false);
    await refresh();
  }

  if (load.state === "loading") return <p className="text-mist">Checking this browser&apos;s private vault...</p>;

  if (load.state === "locked") {
    return (
      <div className="max-w-2xl rounded-lg border border-line bg-card/95 p-5">
        <UnlockPrompt onUnlocked={refresh}>
          <p className="font-bold">Unlock this browser&apos;s private vault</p>
          <p className="mt-1 text-mist">The medication list is encrypted on this device and loads once the vault is unlocked.</p>
        </UnlockPrompt>
      </div>
    );
  }

  if (load.state === "error") return <p className="text-clay">{load.message}</p>;

  const meds = load.state === "ready" ? load.medications : [];
  const active = meds.filter((m) => m.status === "active");
  const inactive = meds.filter((m) => m.status !== "active");
  const vaultState = load.state === "unconfigured" ? "unconfigured" : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button className={primaryButtonClass} onClick={() => setCreating((v) => !v)} type="button">
          {creating ? "Close" : "Add medication"}
        </button>
        <Chip tone="sage">Local only</Chip>
      </div>

      {creating ? (
        <form className="space-y-3 rounded-lg border border-line bg-card/95 p-4" onSubmit={handleCreate}>
          {vaultState ? <VaultPassphraseField vaultState={vaultState} /> : null}
          <MedFormFields errors={errors} />
          {message ? <p className="text-[0.9rem] text-clay">{message}</p> : null}
          <button className={primaryButtonClass} disabled={pending} type="submit">
            {pending ? "Saving…" : "Save medication"}
          </button>
        </form>
      ) : null}

      <section aria-label="Active medications">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-mist">Active ({active.length})</h2>
        {active.length ? (
          <ul className="space-y-3">{active.map((m) => <MedicationCard key={m.id} med={m} onChanged={refresh} />)}</ul>
        ) : (
          <Empty>No active medications recorded yet. Add them exactly as the label reads.</Empty>
        )}
      </section>

      {inactive.length ? (
        <section aria-label="Paused or stopped medications">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-mist">Paused or stopped ({inactive.length})</h2>
          <ul className="space-y-3">{inactive.map((m) => <MedicationCard key={m.id} med={m} onChanged={refresh} />)}</ul>
        </section>
      ) : null}
    </div>
  );
}

export function LocalMedicationCount() {
  const [load] = useLocalVault();
  if (load.state === "ready") return <>{load.medications.filter((m) => m.status === "active").length}</>;
  return <>Local</>;
}

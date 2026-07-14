"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Chip, Empty, StatPill } from "@/components/ui";
import { fmtDate, fmtDateTime, observationCategoryLabels } from "@/lib/labels";
import {
  changeVaultPassphrase,
  exportEncryptedVault,
  getLocalVaultStatus,
  importEncryptedVault,
  LocalObservation,
  lockLocalVault,
  readLocalObservations,
  resetLocalVault,
  subscribeLocalVault,
  unlockLocalVault,
} from "@/lib/local-vault";

type ObservationLoad =
  | { state: "loading"; observations: [] }
  | Awaited<ReturnType<typeof readLocalObservations>>;

const inputClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";

function useLocalObservationLoad(): [ObservationLoad, () => Promise<void>] {
  const [load, setLoad] = useState<ObservationLoad>({ state: "loading", observations: [] });

  async function refresh() {
    try {
      setLoad(await readLocalObservations());
    } catch (error) {
      setLoad({
        state: "error",
        observations: [],
        message: error instanceof Error ? error.message : "Unable to read the local vault.",
      });
    }
  }

  useEffect(() => {
    void refresh();
    return subscribeLocalVault(() => {
      void refresh();
    });
  }, []);

  return [load, refresh];
}

export function UnlockPrompt({
  children,
  onUnlocked,
}: {
  children: ReactNode;
  onUnlocked: () => Promise<void>;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await unlockLocalVault(passphrase);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPassphrase("");
    await onUnlocked();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>{children}</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Local vault passphrase"
          className={inputClass}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder="Local vault passphrase"
          type="password"
          value={passphrase}
        />
        <button
          className="rounded-lg bg-teal px-4 py-2 font-bold text-paper hover:bg-teal-deep disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Unlocking..." : "Unlock"}
        </button>
      </div>
      {message ? <p className="text-[0.9rem] text-clay">{message}</p> : null}
    </form>
  );
}

function ObservationItem({ observation, compact = false }: { observation: LocalObservation; compact?: boolean }) {
  const positive = observation.category === "positive_stable";

  if (compact) {
    return (
      <li className="rounded-lg border border-line/70 bg-paper/45 p-3">
        <Chip tone={positive ? "sage" : "neutral"}>
          {observationCategoryLabels[observation.category] ?? observation.category}
        </Chip>
        <p className="mt-1">{observation.description}</p>
        <p className="text-[0.85rem] text-mist">{fmtDate(new Date(observation.observedAt))} · local only</p>
      </li>
    );
  }

  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full ${positive ? "bg-teal" : "bg-clay"}`}
      />
      <div
        className={`rounded-lg border border-line p-4 shadow-[0_14px_45px_rgba(27,42,65,0.05)] ${
          positive ? "bg-sage-soft" : "bg-card/95"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={positive ? "sage" : "neutral"}>
            {observationCategoryLabels[observation.category] ?? observation.category}
          </Chip>
          {observation.isRecurring ? <Chip tone="amber">Recurring</Chip> : null}
          {observation.includeInBrief ? <Chip tone="teal">In clinician brief</Chip> : null}
          <Chip tone="sage">Local only</Chip>
        </div>
        <p className="mt-2">{observation.description}</p>
        {observation.functionalImpact ? (
          <p className="mt-1 text-[0.9rem] text-mist">Impact: {observation.functionalImpact}</p>
        ) : null}
        <p className="mt-2 text-[0.85rem] text-mist">
          {fmtDateTime(new Date(observation.observedAt))}
          {observation.observer ? ` · noticed by ${observation.observer}` : ""}
          {observation.updatedAt ? " · edited" : ""}
        </p>
        <p className="mt-2">
          <Link
            className="text-[0.9rem] text-teal-deep underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
            href={`/observations/${encodeURIComponent(observation.id)}/edit`}
          >
            Edit or delete
          </Link>
        </p>
      </div>
    </li>
  );
}

export function LocalObservationStatPill() {
  const [load] = useLocalObservationLoad();
  const value = load.state === "ready" ? load.observations.length : "Local";

  return <StatPill label="Private notes" value={value} />;
}

export function LocalObservationInlineCount() {
  const [load] = useLocalObservationLoad();
  if (load.state === "ready") return <>{load.observations.length}</>;
  return <>Local</>;
}

export function LocalRecentObservations({ limit = 3 }: { limit?: number }) {
  const [load, refresh] = useLocalObservationLoad();

  if (load.state === "loading") return <p className="text-mist">Checking this browser&apos;s private vault...</p>;

  if (load.state === "locked") {
    return (
      <UnlockPrompt onUnlocked={refresh}>
        <p className="font-bold">Unlock local notes</p>
        <p className="text-[0.9rem] text-mist">
          Private observations are encrypted in this browser and are not loaded until you unlock the vault.
        </p>
      </UnlockPrompt>
    );
  }

  if (load.state === "error") return <p className="text-clay">{load.message}</p>;

  if (load.state === "unconfigured" || !load.observations.length) {
    return <Empty>No local observations recorded yet.</Empty>;
  }

  return (
    <ul className="space-y-3">
      {load.observations.slice(0, limit).map((observation) => (
        <ObservationItem compact key={observation.id} observation={observation} />
      ))}
    </ul>
  );
}

export function LocalObservationsTimeline({ recipientName }: { recipientName: string }) {
  const [load, refresh] = useLocalObservationLoad();

  if (load.state === "loading") return <p className="text-mist">Checking this browser&apos;s private vault...</p>;

  if (load.state === "locked") {
    return (
      <div className="max-w-2xl rounded-lg border border-line bg-card/95 p-5">
        <UnlockPrompt onUnlocked={refresh}>
          <p className="font-bold">Unlock this browser&apos;s private vault</p>
          <p className="mt-1 text-mist">
            ADCARE does not fetch your observations from a cloud database. Unlock the vault on this device to view them.
          </p>
        </UnlockPrompt>
      </div>
    );
  }

  if (load.state === "error") return <p className="text-clay">{load.message}</p>;

  if (load.state === "unconfigured" || !load.observations.length) {
    return (
      <Empty>
        Nothing recorded yet. When you notice something about {recipientName} — concerning or reassuring —
        write it down here while it is fresh.
      </Empty>
    );
  }

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-sage pl-6">
      {load.observations.map((observation) => (
        <ObservationItem key={observation.id} observation={observation} />
      ))}
    </ol>
  );
}

const buttonClass =
  "rounded-lg border border-line bg-card px-4 py-2 font-bold text-ink hover:border-teal/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";
const dangerButtonClass =
  "rounded-lg border border-clay/50 px-4 py-2 font-bold text-clay hover:bg-clay/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay";

type PanelId = "unlock" | "passphrase" | "import" | "reset" | null;

export function LocalVaultControls() {
  const [status, setStatus] = useState<"loading" | "unconfigured" | "locked" | "unlocked">("loading");
  const [panel, setPanel] = useState<PanelId>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const [unlockPassphrase, setUnlockPassphrase] = useState("");
  const [currentPassphrase, setCurrentPassphrase] = useState("");
  const [nextPassphrase, setNextPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [importPayload, setImportPayload] = useState<{ name: string; contents: string } | null>(null);
  const [resetAcknowledged, setResetAcknowledged] = useState(false);

  async function refreshStatus() {
    const next = await getLocalVaultStatus();
    setStatus(next.state);
  }

  useEffect(() => {
    void refreshStatus();
    return subscribeLocalVault(() => {
      void refreshStatus();
    });
  }, []);

  function openPanel(next: PanelId) {
    setFeedback(null);
    setPanel((prev) => (prev === next ? null : next));
  }

  function closePanels() {
    setPanel(null);
    setUnlockPassphrase("");
    setCurrentPassphrase("");
    setNextPassphrase("");
    setConfirmPassphrase("");
    setImportPayload(null);
    setResetAcknowledged(false);
  }

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const result = await unlockLocalVault(unlockPassphrase);
    setPending(false);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message });
      return;
    }
    closePanels();
    setFeedback({ tone: "ok", text: "Vault unlocked for this browser session." });
  }

  function handleLock() {
    lockLocalVault();
    closePanels();
    setFeedback({ tone: "ok", text: "Vault locked. The key was cleared from memory." });
  }

  async function handleChangePassphrase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (nextPassphrase !== confirmPassphrase) {
      setFeedback({ tone: "error", text: "The new passphrases do not match." });
      return;
    }
    setPending(true);
    const result = await changeVaultPassphrase(currentPassphrase, nextPassphrase);
    setPending(false);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message });
      return;
    }
    closePanels();
    setFeedback({ tone: "ok", text: "Passphrase changed. The vault was re-encrypted with a fresh key." });
  }

  async function handleExport() {
    setFeedback(null);
    const result = await exportEncryptedVault();
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message });
      return;
    }

    const url = URL.createObjectURL(new Blob([result.contents], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setFeedback({ tone: "ok", text: "Encrypted backup exported. It stays unreadable without the passphrase." });
  }

  async function handleImportPick(event: ChangeEvent<HTMLInputElement>) {
    setFeedback(null);
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportPayload({ name: file.name, contents: await file.text() });
    setPanel("import");
  }

  async function handleImportConfirm() {
    if (!importPayload) return;
    setPending(true);
    setFeedback(null);
    const result = await importEncryptedVault(importPayload.contents);
    setPending(false);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message });
      return;
    }
    closePanels();
    setFeedback({ tone: "ok", text: "Backup imported. Unlock it with that backup's passphrase to view it." });
  }

  async function handleReset() {
    setPending(true);
    setFeedback(null);
    const result = await resetLocalVault();
    setPending(false);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.message });
      return;
    }
    closePanels();
    setFeedback({ tone: "ok", text: "Local vault removed from this browser." });
  }

  const hasVault = status === "locked" || status === "unlocked";

  return (
    <div>
      <div className="mb-4">
        <p className="font-bold">Local private vault</p>
        <p className="text-[0.9rem] text-mist">
          Status: {status === "loading" ? "checking" : status === "unconfigured" ? "not created yet" : status}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {status === "locked" ? (
          <button className={buttonClass} onClick={() => openPanel("unlock")} type="button">
            Unlock vault
          </button>
        ) : null}
        {status === "unlocked" ? (
          <button className={buttonClass} onClick={handleLock} type="button">
            Lock vault now
          </button>
        ) : null}
        {hasVault ? (
          <button className={buttonClass} onClick={() => openPanel("passphrase")} type="button">
            Change passphrase
          </button>
        ) : null}
        {hasVault ? (
          <button className={buttonClass} onClick={handleExport} type="button">
            Export encrypted backup
          </button>
        ) : null}
        <label className={`${buttonClass} inline-flex cursor-pointer items-center focus-within:outline focus-within:outline-2 focus-within:outline-teal`}>
          Import encrypted backup
          <input accept="application/json" className="sr-only" onChange={handleImportPick} type="file" />
        </label>
        {hasVault ? (
          <button className={dangerButtonClass} onClick={() => openPanel("reset")} type="button">
            Delete local vault
          </button>
        ) : null}
      </div>

      {panel === "unlock" ? (
        <form className="mt-4 max-w-md space-y-2 rounded-lg border border-line bg-paper/50 p-4" onSubmit={handleUnlock}>
          <label className="block font-bold" htmlFor="vault-unlock-passphrase">
            Vault passphrase
          </label>
          <input
            autoComplete="current-password"
            className={inputClass}
            id="vault-unlock-passphrase"
            onChange={(event) => setUnlockPassphrase(event.target.value)}
            type="password"
            value={unlockPassphrase}
          />
          <div className="flex gap-3 pt-1">
            <button className="rounded-lg bg-teal px-4 py-2 font-bold text-paper hover:bg-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal disabled:opacity-60" disabled={pending} type="submit">
              {pending ? "Unlocking…" : "Unlock"}
            </button>
            <button className={buttonClass} onClick={closePanels} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {panel === "passphrase" ? (
        <form className="mt-4 max-w-md space-y-3 rounded-lg border border-line bg-paper/50 p-4" onSubmit={handleChangePassphrase}>
          <div>
            <label className="block font-bold" htmlFor="vault-current-passphrase">Current passphrase</label>
            <input autoComplete="current-password" className={inputClass} id="vault-current-passphrase" onChange={(e) => setCurrentPassphrase(e.target.value)} type="password" value={currentPassphrase} />
          </div>
          <div>
            <label className="block font-bold" htmlFor="vault-next-passphrase">New passphrase (at least 8 characters)</label>
            <input autoComplete="new-password" className={inputClass} id="vault-next-passphrase" minLength={8} onChange={(e) => setNextPassphrase(e.target.value)} type="password" value={nextPassphrase} />
          </div>
          <div>
            <label className="block font-bold" htmlFor="vault-confirm-passphrase">Repeat new passphrase</label>
            <input autoComplete="new-password" className={inputClass} id="vault-confirm-passphrase" minLength={8} onChange={(e) => setConfirmPassphrase(e.target.value)} type="password" value={confirmPassphrase} />
          </div>
          <p className="text-[0.85rem] text-mist">
            The vault is decrypted with the current passphrase and re-encrypted with a fresh random salt.
            If the current passphrase is wrong, nothing changes.
          </p>
          <div className="flex gap-3">
            <button className="rounded-lg bg-teal px-4 py-2 font-bold text-paper hover:bg-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal disabled:opacity-60" disabled={pending} type="submit">
              {pending ? "Re-encrypting…" : "Change passphrase"}
            </button>
            <button className={buttonClass} onClick={closePanels} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {panel === "import" && importPayload ? (
        <div aria-describedby="vault-import-warning" className="mt-4 max-w-md space-y-3 rounded-lg border border-amber/40 bg-amber/10 p-4" role="alertdialog" aria-label="Confirm vault import">
          <p className="font-bold">Replace this browser&apos;s vault?</p>
          <p className="text-[0.9rem]" id="vault-import-warning">
            Importing <span className="font-bold">{importPayload.name}</span> replaces the vault currently in
            this browser. If the current vault has entries you want to keep, export a backup first.
          </p>
          <div className="flex gap-3">
            <button autoFocus className={buttonClass} onClick={closePanels} type="button">
              Cancel
            </button>
            <button className="rounded-lg bg-teal px-4 py-2 font-bold text-paper hover:bg-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal disabled:opacity-60" disabled={pending} onClick={handleImportConfirm} type="button">
              {pending ? "Importing…" : "Replace vault"}
            </button>
          </div>
        </div>
      ) : null}

      {panel === "reset" ? (
        <div aria-describedby="vault-reset-warning" className="mt-4 max-w-md space-y-3 rounded-lg border border-clay/40 bg-clay/10 p-4" role="alertdialog" aria-label="Confirm vault deletion">
          <p className="font-bold text-clay">Delete the local vault?</p>
          <p className="text-[0.9rem]" id="vault-reset-warning">
            This permanently removes every locally stored entry from this browser. ADCARE keeps no copy
            anywhere. An exported encrypted backup is the only way to restore it later.
          </p>
          <label className="flex items-start gap-2 text-[0.95rem]">
            <input checked={resetAcknowledged} className="mt-1 accent-clay" onChange={(e) => setResetAcknowledged(e.target.checked)} type="checkbox" />
            I understand this cannot be undone.
          </label>
          <div className="flex gap-3">
            <button autoFocus className={buttonClass} onClick={closePanels} type="button">
              Cancel
            </button>
            <button className="rounded-lg bg-clay px-4 py-2 font-bold text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay disabled:opacity-50" disabled={!resetAcknowledged || pending} onClick={handleReset} type="button">
              {pending ? "Deleting…" : "Delete vault"}
            </button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className={`mt-3 min-h-5 text-[0.9rem] ${feedback?.tone === "error" ? "text-clay" : "text-mist"}`} role="status">
        {feedback?.text ?? ""}
      </p>
      <p className="mt-2 text-[0.85rem] text-mist">
        Everything in the vault is encrypted with your passphrase before it touches this browser&apos;s storage.
        ADCARE cannot recover a forgotten passphrase.
      </p>
    </div>
  );
}

"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Chip, Empty, StatPill } from "@/components/ui";
import { fmtDate, fmtDateTime, observationCategoryLabels } from "@/lib/labels";
import {
  exportEncryptedVault,
  getLocalVaultStatus,
  importEncryptedVault,
  LocalObservation,
  readLocalObservations,
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

function UnlockPrompt({
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

export function LocalVaultControls() {
  const [status, setStatus] = useState<"loading" | "unconfigured" | "locked" | "unlocked">("loading");
  const [message, setMessage] = useState<string | null>(null);

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

  async function handleExport() {
    setMessage(null);
    const result = await exportEncryptedVault();
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    const url = URL.createObjectURL(new Blob([result.contents], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Encrypted backup exported.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await importEncryptedVault(await file.text());
    setMessage(result.ok ? "Encrypted backup imported. Unlock the vault to view it." : result.message);
    event.target.value = "";
    await refreshStatus();
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <div>
          <p className="font-bold">Local private vault</p>
          <p className="text-[0.9rem] text-mist">
            Status: {status === "loading" ? "checking" : status.replace("_", " ")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg border border-line bg-card px-4 py-2 font-bold text-ink hover:border-teal/40"
          onClick={handleExport}
          type="button"
        >
          Export encrypted backup
        </button>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-line bg-card px-4 py-2 font-bold text-ink hover:border-teal/40">
          Import encrypted backup
          <input accept="application/json" className="sr-only" onChange={handleImport} type="file" />
        </label>
      </div>
      {message ? <p className="mt-3 text-[0.9rem] text-mist">{message}</p> : null}
      <p className="mt-4 text-[0.85rem] text-mist">
        The backup file is still encrypted. Keep the passphrase separately; it cannot be recovered by ADCARE.
      </p>
    </div>
  );
}

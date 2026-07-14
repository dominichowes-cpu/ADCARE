"use client";

import { useEffect, useId, useState } from "react";
import { readLocalVaultData, subscribeLocalVault, type LocalVaultRead } from "@/lib/local-vault";

export const inputClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";
export const buttonClass =
  "rounded-lg border border-line bg-card px-3 py-1.5 text-[0.9rem] font-bold text-ink hover:border-teal/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";
export const primaryButtonClass =
  "rounded-lg bg-teal px-4 py-2 font-bold text-paper hover:bg-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal disabled:opacity-60";
export const dangerButtonClass =
  "rounded-lg border border-clay/50 px-3 py-1.5 text-[0.9rem] font-bold text-clay hover:bg-clay/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay";

export type VaultLoad = { state: "loading" } | LocalVaultRead;

export function useLocalVault(): [VaultLoad, () => Promise<void>] {
  const [load, setLoad] = useState<VaultLoad>({ state: "loading" });

  async function refresh() {
    try {
      setLoad(await readLocalVaultData());
    } catch (error) {
      setLoad({ state: "error", message: error instanceof Error ? error.message : "Unable to read the local vault." });
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

// Accessible two-step delete confirmation, shared by all local collections.
export function ConfirmDelete({
  label, confirmLabel, onConfirm,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!confirming) {
    return (
      <button className={dangerButtonClass} onClick={() => setConfirming(true)} type="button">
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="alertdialog" aria-label={confirmLabel}>
      <span className="text-[0.9rem] font-bold text-clay">{confirmLabel}</span>
      <button
        className="rounded-lg bg-clay px-3 py-1.5 text-[0.9rem] font-bold text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay disabled:opacity-60"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          await onConfirm();
          setPending(false);
          setConfirming(false);
        }}
        type="button"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button autoFocus className={buttonClass} onClick={() => setConfirming(false)} type="button">
        Keep it
      </button>
    </span>
  );
}

// Passphrase field shown by create forms when the vault is new or locked.
export function VaultPassphraseField({ vaultState }: { vaultState: "unconfigured" | "locked" }) {
  const fieldId = `vault-passphrase-${useId().replace(/:/g, "")}`;

  return (
    <div>
      <label className="block font-bold" htmlFor={fieldId}>
        {vaultState === "unconfigured" ? "Create a private vault passphrase" : "Unlock private vault"}
      </label>
      <p className="mt-0.5 text-[0.9rem] text-mist">
        {vaultState === "unconfigured"
          ? "This passphrase protects data stored in this browser. ADCARE cannot recover it."
          : "Enter the passphrase for this browser's encrypted vault before saving."}
      </p>
      <input
        autoComplete="current-password"
        className={`${inputClass} mt-1.5`}
        id={fieldId}
        minLength={8}
        name="vaultPassphrase"
        type="password"
      />
    </div>
  );
}

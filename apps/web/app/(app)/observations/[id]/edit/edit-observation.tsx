"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/ui";
import { UnlockPrompt } from "@/components/local-observations";
import { ObservationForm } from "../../new/observation-form";
import {
  deleteLocalObservation,
  readLocalObservation,
  subscribeLocalVault,
  type LocalObservationLookup,
} from "@/lib/local-vault";

type CategoryOption = { value: string; label: string };

function DeleteSection({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setMessage(null);
    const result = await deleteLocalObservation(id);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.push("/observations");
  }

  return (
    <section aria-labelledby="delete-observation-heading" className="mt-10 max-w-2xl rounded-lg border border-clay/30 bg-card/90 p-5">
      <h2 className="font-bold" id="delete-observation-heading">
        Delete this observation
      </h2>
      <p className="mt-1 text-[0.9rem] text-mist">
        This removes the entry from this browser&apos;s vault. There is no undo, and no copy exists anywhere else.
      </p>
      {confirming ? (
        <div className="mt-3" role="alertdialog" aria-labelledby="delete-observation-heading" aria-describedby="delete-observation-confirm">
          <p className="font-bold text-clay" id="delete-observation-confirm">
            Delete permanently?
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-clay px-4 py-2 font-bold text-paper hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay disabled:opacity-60"
              disabled={pending}
              onClick={handleDelete}
              type="button"
            >
              {pending ? "Deleting…" : "Yes, delete it"}
            </button>
            <button
              autoFocus
              className="rounded-lg border border-line bg-card px-4 py-2 font-bold hover:border-teal/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
              onClick={() => setConfirming(false)}
              type="button"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <button
          className="mt-3 rounded-lg border border-clay/50 px-4 py-2 font-bold text-clay hover:bg-clay/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-clay"
          onClick={() => setConfirming(true)}
          type="button"
        >
          Delete observation
        </button>
      )}
      {message ? <p className="mt-2 text-[0.9rem] text-clay">{message}</p> : null}
    </section>
  );
}

export function EditObservation({
  categories, id, observerName, recipientName,
}: {
  categories: CategoryOption[];
  id: string;
  observerName: string;
  recipientName: string;
}) {
  const [lookup, setLookup] = useState<LocalObservationLookup | { state: "loading" }>({ state: "loading" });

  async function refresh() {
    try {
      setLookup(await readLocalObservation(id));
    } catch (error) {
      setLookup({ state: "error", message: error instanceof Error ? error.message : "Unable to read the local vault." });
    }
  }

  useEffect(() => {
    void refresh();
    return subscribeLocalVault(() => {
      void refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (lookup.state === "loading") {
    return <p className="text-mist">Checking this browser&apos;s private vault...</p>;
  }

  if (lookup.state === "locked") {
    return (
      <div className="max-w-2xl rounded-lg border border-line bg-card/95 p-5">
        <UnlockPrompt onUnlocked={refresh}>
          <p className="font-bold">Unlock this browser&apos;s private vault</p>
          <p className="mt-1 text-mist">Observations stay encrypted on this device until you unlock the vault.</p>
        </UnlockPrompt>
      </div>
    );
  }

  if (lookup.state === "error") return <p className="text-clay">{lookup.message}</p>;

  if (lookup.state === "unconfigured" || lookup.state === "missing") {
    return (
      <div className="max-w-2xl space-y-4">
        <Empty>
          That observation isn&apos;t in this browser&apos;s vault. It may have been recorded on another
          device, or already removed.
        </Empty>
        <Link className="inline-block text-teal-deep underline underline-offset-4" href="/observations">
          Back to observations
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ObservationForm
        categories={categories}
        defaultObservedAt=""
        initial={lookup.observation}
        observerName={observerName}
        recipientName={recipientName}
      />
      <DeleteSection id={id} />
    </div>
  );
}

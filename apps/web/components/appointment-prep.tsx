"use client";

import { FormEvent, useState } from "react";
import { Chip } from "@/components/ui";
import { UnlockPrompt } from "@/components/local-observations";
import {
  ConfirmDelete, VaultPassphraseField, buttonClass, inputClass, primaryButtonClass, useLocalVault,
} from "@/components/local-shared";
import {
  addPrepItem, addPrepQuestion, deletePrepItem, deletePrepQuestion,
  setPrepItemPacked, setPrepNotes, setPrepQuestionStatus, updatePrepQuestion,
  type LocalAppointmentPrep,
} from "@/lib/local-vault";

function QuestionRow({
  appointmentId, question, onChanged,
}: {
  appointmentId: string;
  question: LocalAppointmentPrep["questions"][number];
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(question.text);
  const [message, setMessage] = useState<string | null>(null);
  const addressed = question.status === "addressed";

  async function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage(null);
    const result = await action();
    if (!result.ok && result.message) setMessage(result.message);
    await onChanged();
  }

  return (
    <li className="rounded-lg border border-line/70 bg-paper/45 p-3">
      {editing ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            await run(() => updatePrepQuestion(appointmentId, question.id, text));
            setEditing(false);
          }}
        >
          <input aria-label="Edit question" className={inputClass} onChange={(e) => setText(e.target.value)} value={text} />
          <span className="flex gap-2">
            <button className={primaryButtonClass} type="submit">Save</button>
            <button className={buttonClass} onClick={() => { setEditing(false); setText(question.text); }} type="button">Cancel</button>
          </span>
        </form>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className={`min-w-0 flex-1 ${addressed ? "text-mist line-through" : ""}`}>{question.text}</p>
          <span className="flex flex-wrap items-center gap-2">
            {addressed ? <Chip tone="sage">Addressed</Chip> : null}
            <button
              className={buttonClass}
              onClick={() => run(() => setPrepQuestionStatus(appointmentId, question.id, addressed ? "open" : "addressed"))}
              type="button"
            >
              {addressed ? "Reopen" : "Mark addressed"}
            </button>
            <button className={buttonClass} onClick={() => setEditing(true)} type="button">Edit</button>
            <ConfirmDelete
              confirmLabel="Delete this question?"
              label="Delete"
              onConfirm={() => run(() => deletePrepQuestion(appointmentId, question.id))}
            />
          </span>
        </div>
      )}
      {message ? <p className="mt-1 text-[0.9rem] text-clay">{message}</p> : null}
    </li>
  );
}

export function AppointmentPrep({ appointmentId }: { appointmentId: string }) {
  const [load, refresh] = useLocalVault();
  const [newQuestion, setNewQuestion] = useState("");
  const [newItem, setNewItem] = useState("");
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

  async function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage(null);
    const result = await action();
    if (!result.ok && result.message) setMessage(result.message);
    else await refresh();
    return result.ok;
  }

  if (load.state === "loading") return null;

  if (load.state === "error") {
    return <p className="mt-3 text-[0.9rem] text-clay">{load.message}</p>;
  }

  if (load.state === "locked") {
    return (
      <div className="mt-4 rounded-lg border border-line/70 bg-paper/45 p-3">
        {showUnlock ? (
          <UnlockPrompt onUnlocked={refresh}>
            <p className="font-bold">Unlock to see your visit prep</p>
          </UnlockPrompt>
        ) : (
          <button className={buttonClass} onClick={() => setShowUnlock(true)} type="button">
            Unlock private visit prep
          </button>
        )}
      </div>
    );
  }

  if (load.state === "unconfigured") {
    return (
      <form
        className="mt-4 space-y-3 rounded-lg border border-line/70 bg-paper/45 p-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          await run(() => setPrepNotes(appointmentId, "", {
            passphrase: String(formData.get("vaultPassphrase") ?? ""),
          }));
        }}
      >
        <p className="flex items-center gap-2 font-bold">
          Set up private visit prep <Chip tone="sage">Local only</Chip>
        </p>
        <p className="text-[0.9rem] text-mist">
          Questions, reminders, and notes stay encrypted in this browser.
        </p>
        <VaultPassphraseField vaultState="unconfigured" />
        <button className={primaryButtonClass} type="submit">Start private visit prep</button>
        {message ? <p className="text-[0.9rem] text-clay">{message}</p> : null}
      </form>
    );
  }

  const prep =
    load.appointmentPrep.find((p) => p.appointmentId === appointmentId);
  const questions = prep?.questions ?? [];
  const items = prep?.items ?? [];
  const notes = notesDraft ?? prep?.notes ?? "";
  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run(() => addPrepQuestion(appointmentId, newQuestion))) setNewQuestion("");
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await run(() => addPrepItem(appointmentId, newItem))) setNewItem("");
  }

  return (
    <div className="mt-4 space-y-4 border-t border-line/70 pt-4">
      <p className="flex items-center gap-2 text-[0.85rem] font-bold uppercase tracking-wide text-mist">
        Your visit prep <Chip tone="sage">Local only</Chip>
      </p>

      <section aria-label="Questions to ask">
        {questions.length ? (
          <ul className="space-y-2">
            {questions.map((q) => (
              <QuestionRow appointmentId={appointmentId} key={q.id} onChanged={refresh} question={q} />
            ))}
          </ul>
        ) : (
          <p className="text-[0.9rem] text-mist">No questions yet. Add the things you don&apos;t want to forget to ask.</p>
        )}
        <form className="mt-2 flex flex-col gap-2 sm:flex-row" onSubmit={handleAddQuestion}>
          <input
            aria-label="New question to ask"
            className={inputClass}
            maxLength={500}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a question to ask"
            value={newQuestion}
          />
          <button className={primaryButtonClass} type="submit">Add</button>
        </form>
      </section>

      <section aria-label="Items to bring">
        <p className="text-[0.85rem] font-bold uppercase tracking-wide text-mist">Bring along</p>
        {items.length ? (
          <ul className="mt-1 space-y-1.5">
            {items.map((item) => (
              <li className="flex flex-wrap items-center justify-between gap-2" key={item.id}>
                <label className="flex items-center gap-2">
                  <input
                    checked={item.packed}
                    className="accent-teal"
                    onChange={(e) => run(() => setPrepItemPacked(appointmentId, item.id, e.target.checked))}
                    type="checkbox"
                  />
                  <span className={item.packed ? "text-mist line-through" : ""}>{item.text}</span>
                </label>
                <ConfirmDelete
                  confirmLabel="Remove this item?"
                  label="Remove"
                  onConfirm={async () => {
                    await run(() => deletePrepItem(appointmentId, item.id));
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[0.9rem] text-mist">Nothing listed yet — medication list, insurance card, reading glasses.</p>
        )}
        <form className="mt-2 flex flex-col gap-2 sm:flex-row" onSubmit={handleAddItem}>
          <input
            aria-label="New item to bring"
            className={inputClass}
            maxLength={500}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item to bring"
            value={newItem}
          />
          <button className={primaryButtonClass} type="submit">Add</button>
        </form>
      </section>

      <section aria-label="Private preparation notes">
        <label className="text-[0.85rem] font-bold uppercase tracking-wide text-mist" htmlFor={`prep-notes-${appointmentId}`}>
          Private notes
        </label>
        <textarea
          className={`${inputClass} mt-1`}
          id={`prep-notes-${appointmentId}`}
          maxLength={2000}
          onChange={(e) => setNotesDraft(e.target.value)}
          rows={2}
          value={notes}
        />
        <button
          className={`${buttonClass} mt-2`}
          onClick={async () => {
            if (await run(() => setPrepNotes(appointmentId, notes))) setNotesDraft(null);
          }}
          type="button"
        >
          Save notes
        </button>
      </section>

      {message ? <p className="text-[0.9rem] text-clay">{message}</p> : null}
    </div>
  );
}

"use client";

import { FormEvent, useId, useState } from "react";
import { Chip, Empty } from "@/components/ui";
import { fmtDate, titleize } from "@/lib/labels";
import { UnlockPrompt } from "@/components/local-observations";
import {
  ConfirmDelete, VaultPassphraseField, buttonClass, inputClass, primaryButtonClass, useLocalVault,
} from "@/components/local-shared";
import { validateTaskInput, taskPriorities } from "@/lib/validation";
import {
  deleteLocalTask, saveLocalTask, setLocalTaskStatus, updateLocalTask, type LocalTask,
} from "@/lib/local-vault";

function TaskFormFields({ initial, errors }: { initial?: LocalTask; errors: Record<string, string> }) {
  const prefix = `task-${useId().replace(/:/g, "")}`;
  const fieldId = (name: string) => `${prefix}-${name}`;

  return (
    <>
      <div>
        <label className="block font-bold" htmlFor={fieldId("title")}>Task</label>
        <input className={`${inputClass} mt-1.5`} defaultValue={initial?.title ?? ""} id={fieldId("title")} maxLength={200} name="title" type="text" />
        {errors.title ? <p className="mt-1 text-[0.9rem] text-clay">{errors.title}</p> : null}
      </div>
      <div>
        <label className="block font-bold" htmlFor={fieldId("details")}>Details (optional)</label>
        <textarea className={`${inputClass} mt-1.5`} defaultValue={initial?.details ?? ""} id={fieldId("details")} maxLength={2000} name="details" rows={2} />
        {errors.details ? <p className="mt-1 text-[0.9rem] text-clay">{errors.details}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block font-bold" htmlFor={fieldId("due")}>Due date (optional)</label>
          <input className={`${inputClass} mt-1.5`} defaultValue={initial?.dueOn ?? ""} id={fieldId("due")} name="dueOn" type="date" />
          {errors.dueOn ? <p className="mt-1 text-[0.9rem] text-clay">{errors.dueOn}</p> : null}
        </div>
        <div>
          <label className="block font-bold" htmlFor={fieldId("priority")}>Priority</label>
          <select className={`${inputClass} mt-1.5`} defaultValue={initial?.priority ?? "medium"} id={fieldId("priority")} name="priority">
            {taskPriorities.map((p) => (
              <option key={p} value={p}>{titleize(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold" htmlFor={fieldId("assignee")}>Who&apos;s on it (optional)</label>
          <input className={`${inputClass} mt-1.5`} defaultValue={initial?.assignee ?? ""} id={fieldId("assignee")} maxLength={120} name="assignee" type="text" />
          {errors.assignee ? <p className="mt-1 text-[0.9rem] text-clay">{errors.assignee}</p> : null}
        </div>
      </div>
    </>
  );
}

function TaskRow({ task, onChanged }: { task: LocalTask; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const completed = task.status === "completed";

  async function toggle() {
    setMessage(null);
    const result = await setLocalTaskStatus(task.id, completed ? "open" : "completed");
    if (!result.ok) setMessage(result.message);
    await onChanged();
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    const validation = validateTaskInput(new FormData(event.currentTarget));
    if (!validation.ok) {
      setErrors(validation.errors);
      setPending(false);
      return;
    }
    const result = await updateLocalTask(task.id, validation.value);
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
          <TaskFormFields errors={errors} initial={task} />
          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} disabled={pending} type="submit">
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button className={buttonClass} onClick={() => setEditing(false)} type="button">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`font-bold ${completed ? "text-mist line-through" : ""}`}>{task.title}</p>
            {task.details ? <p className="mt-0.5 text-[0.95rem] text-mist">{task.details}</p> : null}
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.85rem] text-mist">
              <Chip tone={task.priority === "high" ? "amber" : "neutral"}>{titleize(task.priority)}</Chip>
              {task.dueOn ? <span>Due {fmtDate(new Date(`${task.dueOn}T12:00:00`))}</span> : null}
              {task.assignee ? <span>· {task.assignee}</span> : null}
              {completed && task.completedAt ? <span>· done {fmtDate(new Date(task.completedAt))}</span> : null}
              {task.updatedAt ? <span>· edited</span> : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className={buttonClass} onClick={toggle} type="button">
              {completed ? "Reopen" : "Mark done"}
            </button>
            <button className={buttonClass} onClick={() => setEditing(true)} type="button">Edit</button>
            <ConfirmDelete
              confirmLabel="Delete this task?"
              label="Delete"
              onConfirm={async () => {
                const result = await deleteLocalTask(task.id);
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

export function LocalTasks() {
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
    const validation = validateTaskInput(formData);
    if (!validation.ok) {
      setErrors(validation.errors);
      setPending(false);
      return;
    }
    const result = await saveLocalTask(validation.value, {
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
          <p className="mt-1 text-mist">Tasks are encrypted on this device and load once the vault is unlocked.</p>
        </UnlockPrompt>
      </div>
    );
  }

  if (load.state === "error") return <p className="text-clay">{load.message}</p>;

  const tasks = load.state === "ready" ? load.tasks : [];
  const open = tasks.filter((t) => t.status === "open");
  const completed = tasks.filter((t) => t.status === "completed");
  const vaultState = load.state === "unconfigured" ? "unconfigured" : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button className={primaryButtonClass} onClick={() => setCreating((v) => !v)} type="button">
          {creating ? "Close" : "New task"}
        </button>
        <Chip tone="sage">Local only</Chip>
      </div>

      {creating ? (
        <form className="space-y-3 rounded-lg border border-line bg-card/95 p-4" onSubmit={handleCreate}>
          {vaultState ? <VaultPassphraseField vaultState={vaultState} /> : null}
          <TaskFormFields errors={errors} />
          {message ? <p className="text-[0.9rem] text-clay">{message}</p> : null}
          <button className={primaryButtonClass} disabled={pending} type="submit">
            {pending ? "Saving…" : "Save task"}
          </button>
        </form>
      ) : null}

      <section aria-label="Open tasks">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-mist">Open ({open.length})</h2>
        {open.length ? (
          <ul className="space-y-3">{open.map((t) => <TaskRow key={t.id} onChanged={refresh} task={t} />)}</ul>
        ) : (
          <Empty>
            Nothing open. Add the next thing on the family&apos;s mind — even &quot;call the pharmacy back&quot; counts.
          </Empty>
        )}
      </section>

      {completed.length ? (
        <section aria-label="Completed tasks">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-mist">Completed ({completed.length})</h2>
          <ul className="space-y-3">{completed.map((t) => <TaskRow key={t.id} onChanged={refresh} task={t} />)}</ul>
        </section>
      ) : null}
    </div>
  );
}

export function LocalTaskStatPill() {
  const [load] = useLocalVault();
  const value = load.state === "ready" ? load.tasks.filter((t) => t.status === "open").length : "Local";
  return <>{value}</>;
}

export function LocalOpenTasksList({ limit = 4 }: { limit?: number }) {
  const [load] = useLocalVault();

  if (load.state === "loading") return <p className="text-mist">Checking this browser&apos;s private vault...</p>;
  if (load.state === "locked") return <p className="text-mist">Unlock the private vault to see tasks.</p>;
  if (load.state === "error") return <p className="text-clay">{load.message}</p>;

  const open = load.state === "ready" ? load.tasks.filter((t) => t.status === "open").slice(0, limit) : [];
  if (!open.length) return <Empty>Nothing on the list. Add a task when something comes up.</Empty>;

  return (
    <ul className="space-y-2">
      {open.map((t) => (
        <li className="flex items-start justify-between gap-3" key={t.id}>
          <span>{t.title}</span>
          <Chip tone={t.priority === "high" ? "amber" : "neutral"}>
            {t.dueOn ? fmtDate(new Date(`${t.dueOn}T12:00:00`)) : titleize(t.priority)}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

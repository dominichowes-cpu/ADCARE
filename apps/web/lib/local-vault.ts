"use client";

// Browser-local encrypted vault for private care data.
//
// Privacy boundary (non-negotiable): decrypted contents live only in this
// module's memory for the current tab session. Nothing decrypted is written to
// IndexedDB, localStorage, cookies, URLs, logs, or the network. IndexedDB
// holds exactly one record: the encrypted envelope plus non-sensitive
// crypto metadata (KDF name, iteration count, salt, IV).
//
// Forward compatibility: the envelope format is version 1 and unchanged, so
// existing vaults and exported backups continue to open. Inside the plaintext,
// unknown top-level fields and unknown per-record fields are preserved
// verbatim through every mutation, so future collections (medications,
// appointments, tasks) can be added without risking existing data. All writes
// go through one typed mutation helper; nothing else re-implements
// decrypt/edit/encrypt.

import { observationCategories } from "@/lib/validation";
import { medicationStatuses, taskPriorities } from "@/lib/validation";
import type {
  MedicationRecordInput,
  MedicationStatus,
  ObservationCategory,
  ObservationInput,
  TaskInput,
  TaskPriority,
} from "@/lib/validation";

const DB_NAME = "adcare-private-vault";
const STORE_NAME = "vault";
const VAULT_KEY = "primary";
const VAULT_EVENT = "adcare-vault-change";
const ITERATIONS = 210_000;
const MIN_PASSPHRASE = 8;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type LocalObservation = {
  id: string;
  category: ObservationCategory;
  description: string;
  observedAt: string;
  isRecurring: boolean;
  functionalImpact: string | null;
  includeInBrief: boolean;
  observer: string;
  createdAt: string;
  updatedAt: string | null;
  localOnly: true;
} & Record<string, unknown>;

export type LocalTask = {
  id: string;
  title: string;
  details: string | null;
  dueOn: string | null;
  priority: TaskPriority;
  assignee: string | null;
  status: "open" | "completed";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  localOnly: true;
} & Record<string, unknown>;

export type LocalMedicationRecord = {
  id: string;
  name: string;
  strength: string | null;
  instructions: string | null;
  purpose: string | null;
  prescriber: string | null;
  pharmacy: string | null;
  status: MedicationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  localOnly: true;
} & Record<string, unknown>;

export type LocalPrepQuestion = {
  id: string;
  text: string;
  status: "open" | "addressed";
} & Record<string, unknown>;

export type LocalPrepItem = {
  id: string;
  text: string;
  packed: boolean;
} & Record<string, unknown>;

export type LocalAppointmentPrep = {
  id: string;
  appointmentId: string;
  questions: LocalPrepQuestion[];
  notes: string | null;
  items: LocalPrepItem[];
  createdAt: string;
  updatedAt: string | null;
  localOnly: true;
} & Record<string, unknown>;

// Known collections are typed; everything else rides along untouched.
type VaultContents = {
  version: 1;
  observations: LocalObservation[];
  medications: LocalMedicationRecord[];
  tasks: LocalTask[];
  appointmentPrep: LocalAppointmentPrep[];
  appointments: unknown[];
  documents: unknown[];
  updatedAt: string;
} & Record<string, unknown>;

type VaultEnvelope = {
  version: 1;
  kdf: "PBKDF2-SHA256";
  cipher: "AES-GCM";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: string;
};

export type LocalVaultStatus =
  | { state: "unconfigured"; unlocked: false }
  | { state: "locked"; unlocked: false }
  | { state: "unlocked"; unlocked: true };

export type LocalObservationRead =
  | { state: "unconfigured"; observations: [] }
  | { state: "locked"; observations: [] }
  | { state: "ready"; observations: LocalObservation[] }
  | { state: "error"; observations: []; message: string };

export type LocalObservationLookup =
  | { state: "unconfigured" }
  | { state: "locked" }
  | { state: "missing" }
  | { state: "ready"; observation: LocalObservation }
  | { state: "error"; message: string };

export type VaultResult = { ok: true } | { ok: false; message: string };

let activeKey: CryptoKey | null = null;
let activeSalt: string | null = null;

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function assertBrowserStorage() {
  if (typeof window === "undefined" || !window.indexedDB || !window.crypto?.subtle) {
    throw new Error("This browser does not support encrypted local storage.");
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function newId(): string {
  return window.crypto.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortObservations(list: LocalObservation[]): LocalObservation[] {
  return [...list].sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt));
}

function notifyVaultChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(VAULT_EVENT));
}

export function subscribeLocalVault(listener: () => void): () => void {
  window.addEventListener(VAULT_EVENT, listener);
  return () => window.removeEventListener(VAULT_EVENT, listener);
}

// ---------------------------------------------------------------------------
// Normalization / migration (runs on every decrypt; never destructive)
// ---------------------------------------------------------------------------

function isKnownCategory(value: unknown): value is ObservationCategory {
  return typeof value === "string" && (observationCategories as readonly string[]).includes(value);
}

function normalizeObservation(value: unknown): LocalObservation | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const description = typeof raw.description === "string" ? raw.description : "";
  if (!description) return null; // nothing meaningful to show; do not invent records

  const observedAt =
    typeof raw.observedAt === "string" && !Number.isNaN(Date.parse(raw.observedAt))
      ? raw.observedAt
      : typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString();

  return {
    ...raw, // preserve unknown per-record fields written by future versions
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    category: isKnownCategory(raw.category) ? raw.category : "other",
    description,
    observedAt,
    isRecurring: raw.isRecurring === true,
    functionalImpact: typeof raw.functionalImpact === "string" && raw.functionalImpact ? raw.functionalImpact : null,
    includeInBrief: raw.includeInBrief === true,
    observer: typeof raw.observer === "string" ? raw.observer : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : observedAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    localOnly: true,
  };
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && (taskPriorities as readonly string[]).includes(value);
}

function normalizeTask(value: unknown): LocalTask | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title : "";
  if (!title) return null;

  return {
    ...raw,
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    title,
    details: typeof raw.details === "string" && raw.details ? raw.details : null,
    dueOn: typeof raw.dueOn === "string" && raw.dueOn ? raw.dueOn : null,
    priority: isTaskPriority(raw.priority) ? raw.priority : "medium",
    assignee: typeof raw.assignee === "string" && raw.assignee ? raw.assignee : null,
    status: raw.status === "completed" ? "completed" : "open",
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    localOnly: true,
  };
}

function isMedicationStatus(value: unknown): value is MedicationStatus {
  return typeof value === "string" && (medicationStatuses as readonly string[]).includes(value);
}

function normalizeMedication(value: unknown): LocalMedicationRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name : "";
  if (!name) return null;

  const text = (key: string) => (typeof raw[key] === "string" && raw[key] ? (raw[key] as string) : null);
  return {
    ...raw,
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    name,
    strength: text("strength"),
    instructions: text("instructions"),
    purpose: text("purpose"),
    prescriber: text("prescriber"),
    pharmacy: text("pharmacy"),
    status: isMedicationStatus(raw.status) ? raw.status : "active",
    notes: text("notes"),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    localOnly: true,
  };
}

function normalizePrep(value: unknown): LocalAppointmentPrep | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const appointmentId = typeof raw.appointmentId === "string" ? raw.appointmentId : "";
  if (!appointmentId) return null;

  const questions = Array.isArray(raw.questions)
    ? raw.questions.flatMap((q): LocalPrepQuestion[] => {
        if (!q || typeof q !== "object") return [];
        const rq = q as Record<string, unknown>;
        if (typeof rq.text !== "string" || !rq.text) return [];
        return [{
          ...rq,
          id: typeof rq.id === "string" && rq.id ? rq.id : newId(),
          text: rq.text,
          status: rq.status === "addressed" ? "addressed" : "open",
        }];
      })
    : [];

  const items = Array.isArray(raw.items)
    ? raw.items.flatMap((i): LocalPrepItem[] => {
        if (!i || typeof i !== "object") return [];
        const ri = i as Record<string, unknown>;
        if (typeof ri.text !== "string" || !ri.text) return [];
        return [{
          ...ri,
          id: typeof ri.id === "string" && ri.id ? ri.id : newId(),
          text: ri.text,
          packed: ri.packed === true,
        }];
      })
    : [];

  return {
    ...raw,
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    appointmentId,
    questions,
    notes: typeof raw.notes === "string" && raw.notes ? raw.notes : null,
    items,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    localOnly: true,
  };
}

function normalizeContents(value: unknown): VaultContents {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const observations = Array.isArray(raw.observations)
    ? raw.observations.map(normalizeObservation).filter((o): o is LocalObservation => o !== null)
    : [];

  return {
    ...raw, // preserve unknown top-level fields (future collections, metadata)
    version: 1,
    observations: sortObservations(observations),
    medications: Array.isArray(raw.medications)
      ? raw.medications.map(normalizeMedication).filter((m): m is LocalMedicationRecord => m !== null)
      : [],
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.map(normalizeTask).filter((t): t is LocalTask => t !== null)
      : [],
    appointmentPrep: Array.isArray(raw.appointmentPrep)
      ? raw.appointmentPrep.map(normalizePrep).filter((a): a is LocalAppointmentPrep => a !== null)
      : [],
    appointments: Array.isArray(raw.appointments) ? raw.appointments : [],
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

function emptyVault(): VaultContents {
  return {
    version: 1,
    observations: [],
    medications: [],
    tasks: [],
    appointmentPrep: [],
    appointments: [],
    documents: [],
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// IndexedDB envelope I/O (encrypted data only)
// ---------------------------------------------------------------------------

function openDb(): Promise<IDBDatabase> {
  assertBrowserStorage();

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open local vault."));
  });
}

async function readEnvelope(): Promise<VaultEnvelope | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(VAULT_KEY);

    request.onsuccess = () => resolve((request.result as VaultEnvelope | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Unable to read local vault."));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("Unable to read local vault."));
    };
  });
}

async function writeEnvelope(envelope: VaultEnvelope): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(envelope, VAULT_KEY);
    transaction.oncomplete = () => {
      db.close();
      notifyVaultChange();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("Unable to write local vault."));
    };
  });
}

async function deleteEnvelope(): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(VAULT_KEY);
    transaction.oncomplete = () => {
      db.close();
      notifyVaultChange();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("Unable to reset local vault."));
    };
  });
}

// ---------------------------------------------------------------------------
// Crypto
// ---------------------------------------------------------------------------

async function deriveVaultKey(passphrase: string, salt: Uint8Array, iterations = ITERATIONS): Promise<CryptoKey> {
  const material = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function decryptVault(envelope: VaultEnvelope, key: CryptoKey): Promise<VaultContents> {
  const plaintext = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(envelope.iv)) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  );

  return normalizeContents(JSON.parse(decoder.decode(plaintext)));
}

async function encryptVault(
  data: VaultContents,
  key: CryptoKey,
  salt: string,
  iterations = ITERATIONS,
): Promise<VaultEnvelope> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const updatedAt = new Date().toISOString();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    encoder.encode(JSON.stringify({ ...data, updatedAt })),
  );

  return {
    version: 1,
    kdf: "PBKDF2-SHA256",
    cipher: "AES-GCM",
    iterations,
    salt,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt,
  };
}

// ---------------------------------------------------------------------------
// The single mutation path: decrypt → mutate → encrypt → write.
// Requires an unlocked vault. Any failure leaves the stored envelope intact,
// because the new envelope is only written after encryption succeeds.
// ---------------------------------------------------------------------------

type MutationOutcome<T> = { data: VaultContents; result: T };

async function mutateVault<T>(
  mutate: (data: VaultContents) => MutationOutcome<T> | { message: string },
): Promise<{ ok: true; result: T } | { ok: false; message: string }> {
  const envelope = await readEnvelope();
  if (!envelope) return { ok: false, message: "There is no local vault in this browser yet." };
  if (!activeKey || activeSalt !== envelope.salt) {
    return { ok: false, message: "Unlock the private vault before making changes." };
  }

  let contents: VaultContents;
  try {
    contents = await decryptVault(envelope, activeKey);
  } catch {
    activeKey = null;
    activeSalt = null;
    return { ok: false, message: "The local vault could not be decrypted. Unlock it again with the correct passphrase." };
  }

  const outcome = mutate(contents);
  if ("message" in outcome) return { ok: false, message: outcome.message };

  // Keep the KDF metadata that produced activeKey. Re-labeling ciphertext with
  // a newer iteration count would make an older imported vault impossible to
  // unlock after its first mutation.
  const next = await encryptVault(outcome.data, activeKey, envelope.salt, envelope.iterations);
  await writeEnvelope(next);
  return { ok: true, result: outcome.result };
}

// ---------------------------------------------------------------------------
// Status, unlock, lock
// ---------------------------------------------------------------------------

export async function getLocalVaultStatus(): Promise<LocalVaultStatus> {
  const envelope = await readEnvelope();
  if (!envelope) return { state: "unconfigured", unlocked: false };
  if (activeKey && activeSalt === envelope.salt) return { state: "unlocked", unlocked: true };
  return { state: "locked", unlocked: false };
}

export async function unlockLocalVault(passphrase: string): Promise<VaultResult> {
  if (!passphrase.trim()) return { ok: false, message: "Enter your local vault passphrase." };

  const envelope = await readEnvelope();
  if (!envelope) return { ok: false, message: "Create a local vault by saving your first private care item." };

  try {
    const key = await deriveVaultKey(passphrase, base64ToBytes(envelope.salt), envelope.iterations);
    await decryptVault(envelope, key);
    activeKey = key;
    activeSalt = envelope.salt;
    notifyVaultChange();
    return { ok: true };
  } catch {
    activeKey = null;
    activeSalt = null;
    return { ok: false, message: "That passphrase did not unlock this browser's vault." };
  }
}

export function lockLocalVault(): void {
  activeKey = null;
  activeSalt = null;
  notifyVaultChange();
}

// ---------------------------------------------------------------------------
// Observation reads
// ---------------------------------------------------------------------------

export async function readLocalObservations(): Promise<LocalObservationRead> {
  const envelope = await readEnvelope();
  if (!envelope) return { state: "unconfigured", observations: [] };
  if (!activeKey || activeSalt !== envelope.salt) return { state: "locked", observations: [] };

  try {
    const data = await decryptVault(envelope, activeKey);
    return { state: "ready", observations: data.observations };
  } catch {
    activeKey = null;
    activeSalt = null;
    return {
      state: "error",
      observations: [],
      message: "The local vault could not be decrypted. Unlock it again with the correct passphrase.",
    };
  }
}

export async function readLocalObservation(id: string): Promise<LocalObservationLookup> {
  const read = await readLocalObservations();
  if (read.state === "unconfigured") return { state: "unconfigured" };
  if (read.state === "locked") return { state: "locked" };
  if (read.state === "error") return { state: "error", message: read.message };

  const observation = read.observations.find((o) => o.id === id);
  return observation ? { state: "ready", observation } : { state: "missing" };
}

// ---------------------------------------------------------------------------
// Observation writes (create keeps its passphrase-bootstrap behavior)
// ---------------------------------------------------------------------------

// First save can create the vault; a locked vault can be unlocked inline.
// Shared by every collection's create path.
async function ensureVaultForWrite(passphrase?: string): Promise<VaultResult> {
  const existingEnvelope = await readEnvelope();

  if (!existingEnvelope) {
    const trimmed = passphrase?.trim() ?? "";
    if (trimmed.length < MIN_PASSPHRASE) {
      return { ok: false, message: `Create a local vault passphrase with at least ${MIN_PASSPHRASE} characters.` };
    }
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = bytesToBase64(saltBytes);
    activeKey = await deriveVaultKey(trimmed, saltBytes);
    activeSalt = salt;
    const envelope = await encryptVault(emptyVault(), activeKey, salt);
    await writeEnvelope(envelope);
    return { ok: true };
  }

  if (!activeKey || activeSalt !== existingEnvelope.salt) {
    const trimmed = passphrase?.trim() ?? "";
    if (!trimmed) return { ok: false, message: "Unlock your local vault before saving." };
    return unlockLocalVault(trimmed);
  }

  return { ok: true };
}

export async function saveLocalObservation(
  input: ObservationInput,
  options: { observer: string; passphrase?: string },
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;

  const now = new Date().toISOString();
  const observation: LocalObservation = {
    id: newId(),
    category: input.category,
    description: input.description,
    observedAt: input.observedAt.toISOString(),
    isRecurring: input.isRecurring,
    functionalImpact: input.functionalImpact,
    includeInBrief: input.includeInBrief,
    observer: options.observer,
    createdAt: now,
    updatedAt: null,
    localOnly: true,
  };

  const written = await mutateVault((data) => ({
    data: { ...data, observations: sortObservations([observation, ...data.observations]) },
    result: observation.id,
  }));

  return written.ok ? { ok: true, id: written.result } : written;
}

export async function updateLocalObservation(id: string, input: ObservationInput): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.observations.find((o) => o.id === id);
      if (!existing) return { message: "That observation could not be found in this browser's vault." };

      const updated: LocalObservation = {
        ...existing, // preserves id, createdAt, observer, and unknown fields
        category: input.category,
        description: input.description,
        observedAt: input.observedAt.toISOString(),
        isRecurring: input.isRecurring,
        functionalImpact: input.functionalImpact,
        includeInBrief: input.includeInBrief,
        updatedAt: new Date().toISOString(),
      };

      return {
        data: {
          ...data,
          observations: sortObservations(data.observations.map((o) => (o.id === id ? updated : o))),
        },
        result: undefined,
      };
    }),
  );
}

export async function deleteLocalObservation(id: string): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      if (!data.observations.some((o) => o.id === id)) {
        return { message: "That observation could not be found in this browser's vault." };
      }
      return {
        data: { ...data, observations: data.observations.filter((o) => o.id !== id) },
        result: undefined,
      };
    }),
  );
}

function unwrap(result: { ok: true; result: undefined } | { ok: false; message: string }): VaultResult {
  return result.ok ? { ok: true } : result;
}

// ---------------------------------------------------------------------------
// Lifecycle: change passphrase, reset
// ---------------------------------------------------------------------------

export async function changeVaultPassphrase(current: string, next: string): Promise<VaultResult> {
  const envelope = await readEnvelope();
  if (!envelope) return { ok: false, message: "There is no local vault in this browser yet." };
  if (next.trim().length < MIN_PASSPHRASE) {
    return { ok: false, message: `The new passphrase needs at least ${MIN_PASSPHRASE} characters.` };
  }

  let contents: VaultContents;
  try {
    const currentKey = await deriveVaultKey(current, base64ToBytes(envelope.salt), envelope.iterations);
    contents = await decryptVault(envelope, currentKey);
  } catch {
    // The stored envelope is untouched: nothing was written.
    return { ok: false, message: "The current passphrase is not correct. Nothing was changed." };
  }

  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const salt = bytesToBase64(saltBytes);
  const key = await deriveVaultKey(next.trim(), saltBytes);
  const nextEnvelope = await encryptVault(contents, key, salt);
  await writeEnvelope(nextEnvelope);

  activeKey = key;
  activeSalt = salt;
  notifyVaultChange();
  return { ok: true };
}

export async function resetLocalVault(): Promise<VaultResult> {
  await deleteEnvelope();
  activeKey = null;
  activeSalt = null;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Encrypted export / import
// ---------------------------------------------------------------------------

function isVaultEnvelope(value: unknown): value is VaultEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Record<string, unknown>;
  if (
    envelope.version !== 1 ||
    envelope.kdf !== "PBKDF2-SHA256" ||
    envelope.cipher !== "AES-GCM" ||
    typeof envelope.iterations !== "number" ||
    !Number.isInteger(envelope.iterations) ||
    envelope.iterations < 100_000 ||
    envelope.iterations > 5_000_000 ||
    typeof envelope.salt !== "string" ||
    typeof envelope.iv !== "string" ||
    typeof envelope.ciphertext !== "string" ||
    typeof envelope.updatedAt !== "string" ||
    Number.isNaN(Date.parse(envelope.updatedAt)) ||
    envelope.salt.length > 128 ||
    envelope.iv.length > 64 ||
    envelope.ciphertext.length < 24
  ) {
    return false;
  }

  try {
    // The fields must actually be decodable; reject corrupt files before writing.
    const salt = base64ToBytes(envelope.salt);
    const iv = base64ToBytes(envelope.iv);
    const ciphertext = base64ToBytes(envelope.ciphertext);
    return salt.byteLength >= 16 && salt.byteLength <= 64 && iv.byteLength === 12 && ciphertext.byteLength >= 16;
  } catch {
    return false;
  }
}

export async function exportEncryptedVault(): Promise<
  { ok: true; filename: string; contents: string } | { ok: false; message: string }
> {
  const envelope = await readEnvelope();
  if (!envelope) return { ok: false, message: "There is no local vault to export yet." };

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    filename: `adcare-private-vault-${stamp}.json`,
    contents: JSON.stringify(envelope, null, 2),
  };
}

export async function importEncryptedVault(contents: string): Promise<VaultResult> {
  let envelope: unknown;
  try {
    envelope = JSON.parse(contents);
  } catch {
    return { ok: false, message: "That file could not be read. The existing vault was not changed." };
  }

  if (!isVaultEnvelope(envelope)) {
    return { ok: false, message: "That file is not an ADCARE vault backup. The existing vault was not changed." };
  }

  await writeEnvelope(envelope);
  activeKey = null;
  activeSalt = null;
  notifyVaultChange();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Full vault read (all typed collections at once)
// ---------------------------------------------------------------------------

export type LocalVaultRead =
  | { state: "unconfigured" }
  | { state: "locked" }
  | { state: "error"; message: string }
  | {
      state: "ready";
      observations: LocalObservation[];
      tasks: LocalTask[];
      medications: LocalMedicationRecord[];
      appointmentPrep: LocalAppointmentPrep[];
    };

export async function readLocalVaultData(): Promise<LocalVaultRead> {
  const envelope = await readEnvelope();
  if (!envelope) return { state: "unconfigured" };
  if (!activeKey || activeSalt !== envelope.salt) return { state: "locked" };

  try {
    const data = await decryptVault(envelope, activeKey);
    return {
      state: "ready",
      observations: data.observations,
      tasks: data.tasks,
      medications: data.medications,
      appointmentPrep: data.appointmentPrep,
    };
  } catch {
    activeKey = null;
    activeSalt = null;
    return { state: "error", message: "The local vault could not be decrypted. Unlock it again with the correct passphrase." };
  }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

function sortTasks(list: LocalTask[]): LocalTask[] {
  const priorityRank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    if (a.dueOn && b.dueOn && a.dueOn !== b.dueOn) return a.dueOn < b.dueOn ? -1 : 1;
    if (a.dueOn && !b.dueOn) return -1;
    if (!a.dueOn && b.dueOn) return 1;
    if (a.priority !== b.priority) return priorityRank[a.priority] - priorityRank[b.priority];
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export async function saveLocalTask(
  input: TaskInput,
  options: { passphrase?: string } = {},
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;

  const task: LocalTask = {
    id: newId(),
    title: input.title,
    details: input.details,
    dueOn: input.dueOn,
    priority: input.priority,
    assignee: input.assignee,
    status: "open",
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    localOnly: true,
  };

  const written = await mutateVault((data) => ({
    data: { ...data, tasks: sortTasks([task, ...data.tasks]) },
    result: task.id,
  }));
  return written.ok ? { ok: true, id: written.result } : written;
}

export async function updateLocalTask(id: string, input: TaskInput): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.tasks.find((t) => t.id === id);
      if (!existing) return { message: "That task could not be found in this browser's vault." };
      const updated: LocalTask = {
        ...existing,
        title: input.title,
        details: input.details,
        dueOn: input.dueOn,
        priority: input.priority,
        assignee: input.assignee,
        updatedAt: new Date().toISOString(),
      };
      return {
        data: { ...data, tasks: sortTasks(data.tasks.map((t) => (t.id === id ? updated : t))) },
        result: undefined,
      };
    }),
  );
}

export async function setLocalTaskStatus(id: string, status: "open" | "completed"): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.tasks.find((t) => t.id === id);
      if (!existing) return { message: "That task could not be found in this browser's vault." };
      const updated: LocalTask = {
        ...existing,
        status,
        completedAt: status === "completed" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };
      return {
        data: { ...data, tasks: sortTasks(data.tasks.map((t) => (t.id === id ? updated : t))) },
        result: undefined,
      };
    }),
  );
}

export async function deleteLocalTask(id: string): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      if (!data.tasks.some((t) => t.id === id)) {
        return { message: "That task could not be found in this browser's vault." };
      }
      return { data: { ...data, tasks: data.tasks.filter((t) => t.id !== id) }, result: undefined };
    }),
  );
}

// ---------------------------------------------------------------------------
// Medication records (record-keeping only; nothing here interprets anything)
// ---------------------------------------------------------------------------

function sortMedications(list: LocalMedicationRecord[]): LocalMedicationRecord[] {
  const rank: Record<MedicationStatus, number> = { active: 0, paused: 1, stopped: 2 };
  return [...list].sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name));
}

export async function saveLocalMedicationRecord(
  input: MedicationRecordInput,
  options: { passphrase?: string } = {},
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;

  const record: LocalMedicationRecord = {
    id: newId(),
    name: input.name,
    strength: input.strength,
    instructions: input.instructions,
    purpose: input.purpose,
    prescriber: input.prescriber,
    pharmacy: input.pharmacy,
    status: input.status,
    notes: input.notes,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    localOnly: true,
  };

  const written = await mutateVault((data) => ({
    data: { ...data, medications: sortMedications([record, ...data.medications]) },
    result: record.id,
  }));
  return written.ok ? { ok: true, id: written.result } : written;
}

export async function updateLocalMedicationRecord(id: string, input: MedicationRecordInput): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.medications.find((m) => m.id === id);
      if (!existing) return { message: "That medication could not be found in this browser's vault." };
      const updated: LocalMedicationRecord = {
        ...existing,
        name: input.name,
        strength: input.strength,
        instructions: input.instructions,
        purpose: input.purpose,
        prescriber: input.prescriber,
        pharmacy: input.pharmacy,
        status: input.status,
        notes: input.notes,
        updatedAt: new Date().toISOString(),
      };
      return {
        data: { ...data, medications: sortMedications(data.medications.map((m) => (m.id === id ? updated : m))) },
        result: undefined,
      };
    }),
  );
}

export async function setLocalMedicationStatus(id: string, status: MedicationStatus): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.medications.find((m) => m.id === id);
      if (!existing) return { message: "That medication could not be found in this browser's vault." };
      const updated: LocalMedicationRecord = { ...existing, status, updatedAt: new Date().toISOString() };
      return {
        data: { ...data, medications: sortMedications(data.medications.map((m) => (m.id === id ? updated : m))) },
        result: undefined,
      };
    }),
  );
}

export async function deleteLocalMedicationRecord(id: string): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      if (!data.medications.some((m) => m.id === id)) {
        return { message: "That medication could not be found in this browser's vault." };
      }
      return { data: { ...data, medications: data.medications.filter((m) => m.id !== id) }, result: undefined };
    }),
  );
}

// ---------------------------------------------------------------------------
// Appointment preparation (questions, private notes, items to bring)
// ---------------------------------------------------------------------------

const PREP_TEXT_MAX = 500;

function blankPrep(appointmentId: string): LocalAppointmentPrep {
  return {
    id: newId(),
    appointmentId,
    questions: [],
    notes: null,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: null,
    localOnly: true,
  };
}

async function mutatePrep(
  appointmentId: string,
  fn: (prep: LocalAppointmentPrep) => LocalAppointmentPrep | { message: string },
): Promise<VaultResult> {
  return unwrap(
    await mutateVault((data) => {
      const existing = data.appointmentPrep.find((p) => p.appointmentId === appointmentId) ?? blankPrep(appointmentId);
      const outcome = fn(existing);
      if ("message" in outcome && !("appointmentId" in outcome)) return outcome as { message: string };
      const updated = { ...(outcome as LocalAppointmentPrep), updatedAt: new Date().toISOString() };
      const rest = data.appointmentPrep.filter((p) => p.appointmentId !== appointmentId);
      return { data: { ...data, appointmentPrep: [...rest, updated] }, result: undefined };
    }),
  );
}

function cleanPrepText(text: string): string | { message: string } {
  const trimmed = text.trim();
  if (!trimmed) return { message: "Write something first." };
  if (trimmed.length > PREP_TEXT_MAX) return { message: `Keep this under ${PREP_TEXT_MAX} characters.` };
  return trimmed;
}

export async function addPrepQuestion(
  appointmentId: string,
  text: string,
  options: { passphrase?: string } = {},
): Promise<VaultResult> {
  const cleaned = cleanPrepText(text);
  if (typeof cleaned !== "string") return { ok: false, ...cleaned };
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;
  return mutatePrep(appointmentId, (prep) => ({
    ...prep,
    questions: [...prep.questions, { id: newId(), text: cleaned, status: "open" }],
  }));
}

export async function updatePrepQuestion(appointmentId: string, questionId: string, text: string): Promise<VaultResult> {
  const cleaned = cleanPrepText(text);
  if (typeof cleaned !== "string") return { ok: false, ...cleaned };
  return mutatePrep(appointmentId, (prep) => {
    if (!prep.questions.some((q) => q.id === questionId)) return { message: "That question could not be found." };
    return { ...prep, questions: prep.questions.map((q) => (q.id === questionId ? { ...q, text: cleaned } : q)) };
  });
}

export async function setPrepQuestionStatus(
  appointmentId: string,
  questionId: string,
  status: "open" | "addressed",
): Promise<VaultResult> {
  return mutatePrep(appointmentId, (prep) => {
    if (!prep.questions.some((q) => q.id === questionId)) return { message: "That question could not be found." };
    return { ...prep, questions: prep.questions.map((q) => (q.id === questionId ? { ...q, status } : q)) };
  });
}

export async function deletePrepQuestion(appointmentId: string, questionId: string): Promise<VaultResult> {
  return mutatePrep(appointmentId, (prep) => {
    if (!prep.questions.some((q) => q.id === questionId)) return { message: "That question could not be found." };
    return { ...prep, questions: prep.questions.filter((q) => q.id !== questionId) };
  });
}

export async function setPrepNotes(
  appointmentId: string,
  notes: string,
  options: { passphrase?: string } = {},
): Promise<VaultResult> {
  const trimmed = notes.trim();
  if (trimmed.length > 2000) return { ok: false, message: "Keep preparation notes under 2000 characters." };
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;
  return mutatePrep(appointmentId, (prep) => ({ ...prep, notes: trimmed || null }));
}

export async function addPrepItem(
  appointmentId: string,
  text: string,
  options: { passphrase?: string } = {},
): Promise<VaultResult> {
  const cleaned = cleanPrepText(text);
  if (typeof cleaned !== "string") return { ok: false, ...cleaned };
  const ready = await ensureVaultForWrite(options.passphrase);
  if (!ready.ok) return ready;
  return mutatePrep(appointmentId, (prep) => ({
    ...prep,
    items: [...prep.items, { id: newId(), text: cleaned, packed: false }],
  }));
}

export async function setPrepItemPacked(appointmentId: string, itemId: string, packed: boolean): Promise<VaultResult> {
  return mutatePrep(appointmentId, (prep) => {
    if (!prep.items.some((i) => i.id === itemId)) return { message: "That item could not be found." };
    return { ...prep, items: prep.items.map((i) => (i.id === itemId ? { ...i, packed } : i)) };
  });
}

export async function deletePrepItem(appointmentId: string, itemId: string): Promise<VaultResult> {
  return mutatePrep(appointmentId, (prep) => {
    if (!prep.items.some((i) => i.id === itemId)) return { message: "That item could not be found." };
    return { ...prep, items: prep.items.filter((i) => i.id !== itemId) };
  });
}

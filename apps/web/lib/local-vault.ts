"use client";

import type { ObservationCategory, ObservationInput } from "@/lib/validation";

const DB_NAME = "adcare-private-vault";
const STORE_NAME = "vault";
const VAULT_KEY = "primary";
const VAULT_EVENT = "adcare-vault-change";
const ITERATIONS = 210_000;
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
  localOnly: true;
};

type PrivateVaultData = {
  version: 1;
  observations: LocalObservation[];
  medications: unknown[];
  appointments: unknown[];
  documents: unknown[];
  updatedAt: string;
};

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

let activeKey: CryptoKey | null = null;
let activeSalt: string | null = null;

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

function emptyVault(): PrivateVaultData {
  return {
    version: 1,
    observations: [],
    medications: [],
    appointments: [],
    documents: [],
    updatedAt: new Date().toISOString(),
  };
}

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

async function deriveVaultKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function decryptVault(envelope: VaultEnvelope, key: CryptoKey): Promise<PrivateVaultData> {
  const plaintext = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(envelope.iv)) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  );

  const data = JSON.parse(decoder.decode(plaintext)) as PrivateVaultData;
  return {
    version: 1,
    observations: Array.isArray(data.observations) ? data.observations : [],
    medications: Array.isArray(data.medications) ? data.medications : [],
    appointments: Array.isArray(data.appointments) ? data.appointments : [],
    documents: Array.isArray(data.documents) ? data.documents : [],
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

async function encryptVault(data: PrivateVaultData, key: CryptoKey, salt: string): Promise<VaultEnvelope> {
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
    iterations: ITERATIONS,
    salt,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    updatedAt,
  };
}

function notifyVaultChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(VAULT_EVENT));
}

export function subscribeLocalVault(listener: () => void): () => void {
  window.addEventListener(VAULT_EVENT, listener);
  return () => window.removeEventListener(VAULT_EVENT, listener);
}

export async function getLocalVaultStatus(): Promise<LocalVaultStatus> {
  const envelope = await readEnvelope();
  if (!envelope) return { state: "unconfigured", unlocked: false };
  if (activeKey && activeSalt === envelope.salt) return { state: "unlocked", unlocked: true };
  return { state: "locked", unlocked: false };
}

export async function unlockLocalVault(passphrase: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!passphrase.trim()) return { ok: false, message: "Enter your local vault passphrase." };

  const envelope = await readEnvelope();
  if (!envelope) return { ok: false, message: "Create a local vault by saving your first observation." };

  try {
    const key = await deriveVaultKey(passphrase, base64ToBytes(envelope.salt));
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

export async function readLocalObservations(): Promise<LocalObservationRead> {
  const envelope = await readEnvelope();
  if (!envelope) return { state: "unconfigured", observations: [] };
  if (!activeKey || activeSalt !== envelope.salt) return { state: "locked", observations: [] };

  try {
    const data = await decryptVault(envelope, activeKey);
    return {
      state: "ready",
      observations: data.observations.sort(
        (a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt),
      ),
    };
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

export async function saveLocalObservation(
  input: ObservationInput,
  options: { observer: string; passphrase?: string },
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const existingEnvelope = await readEnvelope();
  let key = activeKey;
  let salt = activeSalt;
  let vault = emptyVault();

  if (!existingEnvelope) {
    const passphrase = options.passphrase?.trim() ?? "";
    if (passphrase.length < 8) {
      return { ok: false, message: "Create a local vault passphrase with at least 8 characters." };
    }
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    salt = bytesToBase64(saltBytes);
    key = await deriveVaultKey(passphrase, saltBytes);
  } else {
    salt = existingEnvelope.salt;
    if (!key || activeSalt !== existingEnvelope.salt) {
      const passphrase = options.passphrase?.trim() ?? "";
      if (!passphrase) return { ok: false, message: "Unlock your local vault before saving." };
      key = await deriveVaultKey(passphrase, base64ToBytes(existingEnvelope.salt));
    }

    try {
      vault = await decryptVault(existingEnvelope, key);
    } catch {
      return { ok: false, message: "That passphrase did not unlock this browser's vault." };
    }
  }

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
    localOnly: true,
  };

  vault.observations = [observation, ...vault.observations].sort(
    (a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt),
  );
  const envelope = await encryptVault(vault, key, salt);
  await writeEnvelope(envelope);
  activeKey = key;
  activeSalt = salt;
  return { ok: true, id: observation.id };
}

function isVaultEnvelope(value: unknown): value is VaultEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Record<string, unknown>;
  return (
    envelope.version === 1 &&
    envelope.kdf === "PBKDF2-SHA256" &&
    envelope.cipher === "AES-GCM" &&
    typeof envelope.iterations === "number" &&
    typeof envelope.salt === "string" &&
    typeof envelope.iv === "string" &&
    typeof envelope.ciphertext === "string" &&
    typeof envelope.updatedAt === "string"
  );
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

export async function importEncryptedVault(
  contents: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const envelope = JSON.parse(contents) as unknown;
    if (!isVaultEnvelope(envelope)) return { ok: false, message: "That file is not an ADCARE vault backup." };
    await writeEnvelope(envelope);
    activeKey = null;
    activeSalt = null;
    notifyVaultChange();
    return { ok: true };
  } catch {
    return { ok: false, message: "That file could not be imported." };
  }
}

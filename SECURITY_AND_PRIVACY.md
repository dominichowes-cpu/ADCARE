# SECURITY_AND_PRIVACY — Clarity Path

## Local-first launch posture
The web app defaults to local-first private storage for user-entered care data.
Observation writes no longer use a server action, API route, fixture mutation,
or Postgres insert path. The browser validates the form, derives an AES-GCM key
from the user's passphrase with PBKDF2, and stores only encrypted vault
ciphertext in IndexedDB. The derived key is held in browser memory for the
current session, and Settings supports encrypted export/import backup files.

Postgres access is now explicit opt-in: `DATABASE_URL` by itself does not put
care data in the database. Server-side data helpers use fictional fixtures
unless `CLARITY_STORAGE_MODE=cloud` is also set.

## Current controls (implemented in schema)
Tenant isolation is structural: every private table carries household_id with FK
cascade, and the test suite proves that deleting a household removes all care data
while leaving public research content untouched. Invitation and clinician-share
tokens are stored only as hashes (token_hash), never raw. Share links carry
expires_at and revoked_at, and every access is logged (share_link_access_events,
document_access_events). Consents are explicit, revocable rows; extracted document
text references the consent that authorized it. Support access to a household is
impossible without a time-limited, reasoned support_access_grants row, and all
administrative actions have a home in audit_events. Care data and research data
never share a table, and the only paths between them are user-initiated
(saved_content, appointment_questions).

## Known gaps (before real identifiable health information or cloud sync)
Authorization is currently a service-layer obligation, not database-enforced:
Postgres row-level security policies keyed on household membership are the next
hardening step. Application-level encryption for the most sensitive free-text
columns (observations.description, extracted_document_text.extracted_text) is not
yet implemented for cloud mode; when cloud storage returns, document the
key-management approach. No TLS termination, no rate limiting, no log-redaction
layer, and no analytics allowlist exist yet. Virus scanning is a hook
(documents.virus_scan_status), not an integration.

## Compliance posture
Nothing here makes the product HIPAA compliant, and the product must not claim to
be. If the product ever handles PHI on behalf of covered entities, BAAs are
required with every vendor in the data path (hosting, storage, email, AI
providers), plus formal risk analysis, retention policy, and incident-response
runbooks. Until then, the privacy stance is contractual and architectural:
minimum collection (birth year not birth date, general location not address),
consent-gated AI processing, and no identifiable care data to analytics or to
research-summary models.


## Local vault controls (session 7)

Locking clears the in-memory AES key and decrypted state; nothing about the
vault leaves the browser at any point. Changing the passphrase requires the
current passphrase, decrypts in memory, derives a new key from a fresh random
salt, and re-encrypts the full contents; a wrong current passphrase changes
nothing. Reset permanently deletes the IndexedDB envelope after an explicit
destructive acknowledgment and clears all in-memory key material. Import
validates the envelope (structure, algorithm identifiers, iteration bounds,
base64 decodability) before writing, warns that it replaces the current vault,
and never destroys the existing vault on a failed or invalid import. Exports
remain encrypted; ADCARE cannot recover a lost passphrase. The vault plaintext
format preserves unknown fields through every mutation so future local
collections cannot corrupt older data, and the on-disk envelope format is
unchanged (version 1). Decrypted health information never touches
localStorage, sessionStorage, cookies, URLs, logs, analytics, server
components, server actions, route handlers, or Postgres.

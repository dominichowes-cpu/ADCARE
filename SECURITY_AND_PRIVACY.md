# SECURITY_AND_PRIVACY — Clarity Path (data layer status)

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

## Known gaps (before real identifiable health information)
Authorization is currently a service-layer obligation, not database-enforced:
Postgres row-level security policies keyed on household membership are the next
hardening step. Application-level encryption for the most sensitive free-text
columns (observations.description, extracted_document_text.extracted_text) is not
yet implemented; when it is, document the key-management approach (KMS-backed
envelope encryption is the default recommendation). No backup/restore procedure,
no TLS termination, no rate limiting, no log-redaction layer, and no analytics
allowlist exist yet — these belong to the application build. Virus scanning is a
hook (documents.virus_scan_status), not an integration.

## Compliance posture
Nothing here makes the product HIPAA compliant, and the product must not claim to
be. If the product ever handles PHI on behalf of covered entities, BAAs are
required with every vendor in the data path (hosting, storage, email, AI
providers), plus formal risk analysis, retention policy, and incident-response
runbooks. Until then, the privacy stance is contractual and architectural:
minimum collection (birth year not birth date, general location not address),
consent-gated AI processing, and no identifiable care data to analytics or to
research-summary models.

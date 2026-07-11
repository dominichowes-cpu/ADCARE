-- Clarity Path — 0004_records.sql
-- Records vault: secure documents, versions, permissions, access log,
-- extracted text (consent-gated). Also wires the deferred observation FK.

BEGIN;

CREATE TABLE documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  care_recipient_id  uuid REFERENCES care_recipients(id) ON DELETE SET NULL,
  record_type        document_record_type NOT NULL,
  title              text NOT NULL,
  storage_key        text NOT NULL,          -- tenant-scoped: {household_id}/{doc_id}/{version}
  mime_type          text NOT NULL,
  byte_size          bigint NOT NULL CHECK (byte_size >= 0),
  document_date      date,
  issuing_organization text,
  expires_on         date,
  tags               text[] NOT NULL DEFAULT '{}',
  visibility         visibility_level NOT NULL DEFAULT 'household',
  uploaded_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  virus_scan_status  text NOT NULL DEFAULT 'pending',  -- pending|clean|flagged|skipped (hook)
  deleted_at         timestamptz,            -- soft delete with restore window
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  search_tsv         tsvector GENERATED ALWAYS AS
    (to_tsvector('english', title || ' ' || coalesce(issuing_organization,''))) STORED
);
CREATE INDEX idx_documents_household ON documents(household_id, record_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expiry ON documents(expires_on) WHERE expires_on IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_search ON documents USING gin(search_tsv);

CREATE TABLE document_versions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number   integer NOT NULL,
  storage_key      text NOT NULL,
  byte_size        bigint NOT NULL CHECK (byte_size >= 0),
  uploaded_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version_number)
);

-- Role-based visibility overrides beyond the document's visibility level.
CREATE TABLE document_permissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  membership_id    uuid NOT NULL REFERENCES household_memberships(id) ON DELETE CASCADE,
  can_view         boolean NOT NULL DEFAULT true,
  granted_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, membership_id)
);

CREATE TABLE document_access_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  share_link_id    uuid REFERENCES clinician_share_links(id) ON DELETE SET NULL,
  action           document_access_action NOT NULL,
  occurred_at      timestamptz NOT NULL DEFAULT now(),
  ip_address       inet
);
CREATE INDEX idx_document_access ON document_access_events(document_id, occurred_at DESC);

-- Server-side extracted text for search / user-approved summarization.
-- Row may exist only if a matching consent exists; enforced in service layer,
-- referenced here for audit.
CREATE TABLE extracted_document_text (
  document_id      uuid PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  extracted_text   text NOT NULL,
  extraction_method text NOT NULL,           -- 'pdftotext' | 'ocr' | ...
  consent_id       uuid REFERENCES consents(id) ON DELETE SET NULL,
  extracted_at     timestamptz NOT NULL DEFAULT now(),
  search_tsv       tsvector GENERATED ALWAYS AS (to_tsvector('english', extracted_text)) STORED
);
CREATE INDEX idx_extracted_text_search ON extracted_document_text USING gin(search_tsv);

-- Deferred FK from 0003: observation attachments.
ALTER TABLE observations
  ADD CONSTRAINT fk_observations_attachment
  FOREIGN KEY (attachment_document_id) REFERENCES documents(id) ON DELETE SET NULL;

-- Appointments can reference related documents.
CREATE TABLE appointment_documents (
  appointment_id   uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, document_id)
);

-- Decisions can reference supporting documents.
CREATE TABLE decision_documents (
  decision_id      uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY (decision_id, document_id)
);

COMMIT;

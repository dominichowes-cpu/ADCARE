-- Clarity Path — seed.sql
-- Realistic but COMPLETELY FICTIONAL demo data (§39). Every record here is demo
-- content: users live at @demo.claritypath.example, the household is prefixed
-- [DEMO], and system_settings.demo_mode marks the dataset.
-- No real people, no real medical details.

BEGIN;

INSERT INTO system_settings (key, value) VALUES
  ('demo_mode', '{"enabled": true, "seeded_at": "2026-07-11"}');

-- ---------------------------------------------------------------------------
-- Users (1 owner, 1 coordinator, 1 contributor) + admin reviewer
-- ---------------------------------------------------------------------------
INSERT INTO users (id, email, display_name, timezone) VALUES
  ('00000000-0000-4000-a000-000000000001', 'maria@demo.claritypath.example',  'Maria Delgado',  'America/Chicago'),
  ('00000000-0000-4000-a000-000000000002', 'carlos@demo.claritypath.example', 'Carlos Delgado', 'America/Denver'),
  ('00000000-0000-4000-a000-000000000003', 'jen@demo.claritypath.example',    'Jen Delgado-Park','America/Chicago'),
  ('00000000-0000-4000-a000-000000000009', 'editor@demo.claritypath.example', 'Demo Clinical Editor', 'America/New_York');

INSERT INTO external_auth_identities (user_id, provider, provider_subject) VALUES
  ('00000000-0000-4000-a000-000000000001', 'dev', 'dev|maria'),
  ('00000000-0000-4000-a000-000000000002', 'dev', 'dev|carlos'),
  ('00000000-0000-4000-a000-000000000003', 'dev', 'dev|jen'),
  ('00000000-0000-4000-a000-000000000009', 'dev', 'dev|editor');

INSERT INTO admin_roles (id, key, description) VALUES
  ('00000000-0000-4000-b000-000000000001', 'super_admin',        'Full system configuration access'),
  ('00000000-0000-4000-b000-000000000002', 'clinical_editor',    'Reviews evidence summaries and safety language'),
  ('00000000-0000-4000-b000-000000000003', 'content_editor',     'Edits and publishes feed items'),
  ('00000000-0000-4000-b000-000000000004', 'ingestion_operator', 'Manages connectors, jobs, queries'),
  ('00000000-0000-4000-b000-000000000005', 'support_agent',      'Views minimal account metadata');

INSERT INTO admin_role_assignments (user_id, admin_role_id) VALUES
  ('00000000-0000-4000-a000-000000000009', '00000000-0000-4000-b000-000000000002');

-- ---------------------------------------------------------------------------
-- Household, memberships, care recipient
-- ---------------------------------------------------------------------------
INSERT INTO households (id, name, navigation_phase, priorities, created_by) VALUES
  ('00000000-0000-4000-c000-000000000001', '[DEMO] Delgado Family Care Circle',
   'preparing_evaluation',
   ARRAY['Prepare for an appointment','Track changes over time','Coordinate with family'],
   '00000000-0000-4000-a000-000000000001');

INSERT INTO household_memberships (id, household_id, user_id, role, relationship, can_invite) VALUES
  ('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-c000-000000000001',
   '00000000-0000-4000-a000-000000000001', 'owner', 'daughter', true),
  ('00000000-0000-4000-d000-000000000002', '00000000-0000-4000-c000-000000000001',
   '00000000-0000-4000-a000-000000000002', 'care_coordinator', 'son', true),
  ('00000000-0000-4000-d000-000000000003', '00000000-0000-4000-c000-000000000001',
   '00000000-0000-4000-a000-000000000003', 'contributor', 'granddaughter', false);

INSERT INTO care_recipients (id, household_id, preferred_name, birth_year, general_location, postal_code, pronouns) VALUES
  ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-c000-000000000001',
   'Rosa', 1948, 'Minneapolis area', '55401', 'she/her');

INSERT INTO consents (household_id, user_id, consent_type, granted) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-a000-000000000001', 'trial_matching', true);

-- ---------------------------------------------------------------------------
-- Observations: concerning + positive, with contexts
-- ---------------------------------------------------------------------------
INSERT INTO observations (id, household_id, care_recipient_id, category, description, observed_at,
                          observer_membership_id, is_recurring, include_in_brief, created_by) VALUES
  ('00000000-0000-4000-f000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'memory_repetition', 'Asked what time the neurology appointment was three times within twenty minutes.',
   now() - interval '9 days', '00000000-0000-4000-d000-000000000001', true, true,
   '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-f000-000000000002', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'driving_navigation', 'Took an unfamiliar route home from the grocery store and arrived 40 minutes late; seemed unsure where a wrong turn happened.',
   now() - interval '6 days', '00000000-0000-4000-d000-000000000002', false, true,
   '00000000-0000-4000-a000-000000000002'),
  ('00000000-0000-4000-f000-000000000003', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'positive_stable', 'Hosted Sunday dinner, cooked her usual arroz con pollo without difficulty, and told detailed stories about the old neighborhood.',
   now() - interval '4 days', '00000000-0000-4000-d000-000000000003', false, true,
   '00000000-0000-4000-a000-000000000003'),
  ('00000000-0000-4000-f000-000000000004', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'finances', 'Found two unpaid utility notices on the counter; she said she thought they were already paid.',
   now() - interval '2 days', '00000000-0000-4000-d000-000000000001', false, false,
   '00000000-0000-4000-a000-000000000001');

INSERT INTO observation_contexts (observation_id, factor, note) VALUES
  ('00000000-0000-4000-f000-000000000001', 'poor_sleep', 'Mentioned sleeping badly the night before'),
  ('00000000-0000-4000-f000-000000000002', 'stress', NULL);

-- ---------------------------------------------------------------------------
-- Medications + events + health context
-- ---------------------------------------------------------------------------
INSERT INTO medications (id, household_id, care_recipient_id, name, generic_name, dosage_text,
                         frequency_text, prescriber, reason, started_on, info_source, last_confirmed_on, created_by) VALUES
  ('00000000-0000-4000-1000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'Lisinopril', 'lisinopril', '10 mg', 'once daily, morning', 'Dr. Okafor (primary care)',
   'blood pressure', '2019-03-01', 'pharmacy printout', '2026-06-20',
   '00000000-0000-4000-a000-000000000002'),
  ('00000000-0000-4000-1000-000000000002', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'Vitamin D3', 'cholecalciferol', '2000 IU', 'once daily', NULL,
   'supplement', '2023-01-15', 'family recollection', '2026-06-20',
   '00000000-0000-4000-a000-000000000002');

INSERT INTO medication_events (household_id, medication_id, event_type, occurred_at, note, recorded_by) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-1000-000000000001',
   'missed_dose', now() - interval '5 days', 'Pill organizer for Thursday was untouched.',
   '00000000-0000-4000-a000-000000000002');

INSERT INTO health_context_events (household_id, care_recipient_id, context_type, occurred_on, value, recorded_by) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'sleep_quality', (now() - interval '10 days')::date, '{"rating": 2, "scale": "0-4"}',
   '00000000-0000-4000-a000-000000000001');

-- ---------------------------------------------------------------------------
-- Appointments (one past, one upcoming), questions, brief link table rows
-- ---------------------------------------------------------------------------
INSERT INTO appointments (id, household_id, care_recipient_id, starts_at, clinician_name, specialty,
                          location, purpose, attendee_membership_id, notes, created_by) VALUES
  ('00000000-0000-4000-2000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   now() - interval '30 days', 'Dr. Okafor', 'Primary care', 'Northside Clinic',
   'Annual physical; raised memory concerns', '00000000-0000-4000-d000-000000000001',
   'Referred to neurology for cognitive evaluation. Labs ordered.',
   '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-2000-000000000002', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   now() + interval '12 days', 'Dr. Lindqvist', 'Neurology', 'University Memory Clinic',
   'Initial cognitive evaluation', '00000000-0000-4000-d000-000000000001', NULL,
   '00000000-0000-4000-a000-000000000001');

INSERT INTO appointment_questions (appointment_id, question, position, added_by) VALUES
  ('00000000-0000-4000-2000-000000000002', 'What does the evaluation involve, and how long until results?', 0, '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-2000-000000000002', 'Should we be concerned about the driving episode?', 1, '00000000-0000-4000-a000-000000000002'),
  ('00000000-0000-4000-2000-000000000002', 'Are blood biomarker tests appropriate at this stage?', 2, '00000000-0000-4000-a000-000000000001');

INSERT INTO appointment_observations (appointment_id, observation_id) VALUES
  ('00000000-0000-4000-2000-000000000002', '00000000-0000-4000-f000-000000000001'),
  ('00000000-0000-4000-2000-000000000002', '00000000-0000-4000-f000-000000000002'),
  ('00000000-0000-4000-2000-000000000002', '00000000-0000-4000-f000-000000000003');

-- ---------------------------------------------------------------------------
-- Tasks, decision, family update, caregiver check-in
-- ---------------------------------------------------------------------------
INSERT INTO tasks (id, household_id, care_recipient_id, title, description, category,
                   assignee_membership_id, due_on, priority, status, appointment_id, created_by) VALUES
  ('00000000-0000-4000-3000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'Compile current medication list', 'Confirm doses with the pharmacy and bring a printed list to the neurology visit.',
   'medical_evaluation', '00000000-0000-4000-d000-000000000002', (now() + interval '8 days')::date,
   'high', 'in_progress', '00000000-0000-4000-2000-000000000002', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-3000-000000000002', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'Locate health-care proxy paperwork', 'Check the file cabinet in the study; scan whatever exists.',
   'legal_planning', '00000000-0000-4000-d000-000000000003', (now() + interval '20 days')::date,
   'medium', 'open', NULL, '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-3000-000000000003', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'Drive Mom to neurology appointment', NULL,
   'family_coordination', '00000000-0000-4000-d000-000000000001', (now() + interval '12 days')::date,
   'high', 'open', '00000000-0000-4000-2000-000000000002', '00000000-0000-4000-a000-000000000002');

INSERT INTO decisions (id, household_id, title, decided_on, background, agreed_plan,
                       reconsider_conditions, follow_up_on, created_by) VALUES
  ('00000000-0000-4000-4000-000000000001', '00000000-0000-4000-c000-000000000001',
   'Local daytime driving continues for now', (now() - interval '5 days')::date,
   'One navigation incident recorded; otherwise driving has been routine and local.',
   'Rosa continues local daytime driving while we await the neurology evaluation. Carlos rides along once a week.',
   'Revisit after the neurology appointment, or sooner if another navigation incident occurs.',
   (now() + interval '14 days')::date, '00000000-0000-4000-a000-000000000001');

INSERT INTO decision_participants (decision_id, membership_id) VALUES
  ('00000000-0000-4000-4000-000000000001', '00000000-0000-4000-d000-000000000001'),
  ('00000000-0000-4000-4000-000000000001', '00000000-0000-4000-d000-000000000002');

INSERT INTO family_updates (household_id, author_id, update_type, title, body, decision_id) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-a000-000000000001',
   'decision_update', 'Driving plan until the evaluation',
   'We agreed Mom keeps driving locally in daytime for now. Carlos will ride along Sundays. We revisit after the neurology visit.',
   '00000000-0000-4000-4000-000000000001');

INSERT INTO caregiver_checkins (household_id, user_id, caregiving_hours_week, sleep_disruption,
                                work_interference, stress_level, family_conflict, has_backup_help,
                                days_since_break, feeling_overwhelmed, generated_summary) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-a000-000000000001',
   12.5, 2, 2, 3, 1, true, 18,  2,
   'You are carrying a meaningful load this month, especially around sleep and scheduling. Backup help exists — consider using it for one errand this week.');

-- ---------------------------------------------------------------------------
-- Safety checkup (template + one completed assessment)
-- ---------------------------------------------------------------------------
INSERT INTO safety_checkup_templates (id, key, version, title, intro_text, questions, guidance) VALUES
  ('00000000-0000-4000-5000-000000000001', 'driving', 1, 'Driving check-in',
   'Short observable questions. This is not a driving assessment.',
   '[{"key":"got_lost","text":"Any episodes of getting lost or unexpected routes in the last month?","type":"yes_no"},
     {"key":"new_dents","text":"Any new dents, scrapes, or near-miss reports?","type":"yes_no"},
     {"key":"night_driving","text":"Is night driving still occurring?","type":"yes_no"}]',
   '{"two_or_more_concerns":"Two recent navigation concerns have been recorded. Consider discussing driving with the clinician or arranging a professional driving assessment."}');

INSERT INTO safety_assessments (id, household_id, care_recipient_id, template_id, started_by, completed_at) VALUES
  ('00000000-0000-4000-5000-000000000002', '00000000-0000-4000-c000-000000000001',
   '00000000-0000-4000-e000-000000000001', '00000000-0000-4000-5000-000000000001',
   '00000000-0000-4000-a000-000000000002', now() - interval '3 days');

INSERT INTO safety_responses (assessment_id, question_key, response, note) VALUES
  ('00000000-0000-4000-5000-000000000002', 'got_lost', '{"answer": true}', 'Grocery store episode'),
  ('00000000-0000-4000-5000-000000000002', 'new_dents', '{"answer": false}', NULL),
  ('00000000-0000-4000-5000-000000000002', 'night_driving', '{"answer": false}', 'Stopped on her own last winter');

-- ---------------------------------------------------------------------------
-- Documents (harmless placeholders)
-- ---------------------------------------------------------------------------
INSERT INTO documents (id, household_id, care_recipient_id, record_type, title, storage_key,
                       mime_type, byte_size, document_date, issuing_organization, uploaded_by, virus_scan_status) VALUES
  ('00000000-0000-4000-6000-000000000001', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'medication_list', '[DEMO] Medication list — June 2026',
   '00000000-0000-4000-c000-000000000001/00000000-0000-4000-6000-000000000001/1',
   'application/pdf', 48211, '2026-06-20', 'Northside Pharmacy',
   '00000000-0000-4000-a000-000000000002', 'clean'),
  ('00000000-0000-4000-6000-000000000002', '00000000-0000-4000-c000-000000000001', '00000000-0000-4000-e000-000000000001',
   'visit_summary', '[DEMO] Annual physical visit summary',
   '00000000-0000-4000-c000-000000000001/00000000-0000-4000-6000-000000000002/1',
   'application/pdf', 102400, '2026-06-11', 'Northside Clinic',
   '00000000-0000-4000-a000-000000000001', 'clean');

INSERT INTO document_versions (document_id, version_number, storage_key, byte_size, uploaded_by)
SELECT id, 1, storage_key, byte_size, uploaded_by FROM documents;

-- ---------------------------------------------------------------------------
-- Roadmap templates + items
-- ---------------------------------------------------------------------------
INSERT INTO roadmap_templates (id, title, explanation, category, applicable_phases, default_priority, suggested_timing) VALUES
  ('00000000-0000-4000-7000-000000000001', 'Prepare questions for the evaluation',
   'Families who write questions down before a cognitive evaluation report getting more out of the visit.',
   'medical_evaluation', ARRAY['preparing_evaluation','evaluation_underway']::navigation_phase[], 'high', 'Before the first specialist visit'),
  ('00000000-0000-4000-7000-000000000002', 'Confirm health-care proxy documents',
   'Knowing whether a health-care proxy exists avoids scrambling later; an elder-law professional can help if none exists.',
   'legal_planning', ARRAY['preparing_evaluation','mci_or_uncertain','diagnosed_independent']::navigation_phase[], 'medium', 'In the next month');

INSERT INTO roadmap_items (household_id, template_id, title, explanation, phase, category, priority, status,
                           assignee_membership_id) VALUES
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-7000-000000000001',
   'Prepare questions for the evaluation',
   'Families who write questions down before a cognitive evaluation report getting more out of the visit.',
   'preparing_evaluation', 'medical_evaluation', 'high', 'in_progress',
   '00000000-0000-4000-d000-000000000001'),
  ('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-7000-000000000002',
   'Confirm health-care proxy documents',
   'Knowing whether a health-care proxy exists avoids scrambling later.',
   'preparing_evaluation', 'legal_planning', 'medium', 'suggested',
   '00000000-0000-4000-d000-000000000003');

-- ---------------------------------------------------------------------------
-- Research platform fixtures
-- ---------------------------------------------------------------------------
INSERT INTO source_connectors (id, source_key, display_name, schedule_cron) VALUES
  ('00000000-0000-4000-8000-000000000001', 'pubmed',         'PubMed (NCBI E-utilities)', '0 */5 * * *'),
  ('00000000-0000-4000-8000-000000000002', 'europepmc',      'Europe PMC',                '30 */5 * * *'),
  ('00000000-0000-4000-8000-000000000003', 'openalex',       'OpenAlex',                  '0 3 * * *'),
  ('00000000-0000-4000-8000-000000000004', 'clinicaltrials', 'ClinicalTrials.gov',        '0 4 * * *'),
  ('00000000-0000-4000-8000-000000000005', 'nih_reporter',   'NIH RePORTER',              '0 5 * * 1'),
  ('00000000-0000-4000-8000-000000000006', 'openfda',        'openFDA',                   '0 6 * * *'),
  ('00000000-0000-4000-8000-000000000007', 'gdelt',          'GDELT',                     '0 * * * *');

INSERT INTO topics (id, kind, slug, name) VALUES
  ('00000000-0000-4000-9000-000000000001', 'dementia_type', 'alzheimers-disease', 'Alzheimer''s disease'),
  ('00000000-0000-4000-9000-000000000002', 'dementia_type', 'mild-cognitive-impairment', 'Mild cognitive impairment'),
  ('00000000-0000-4000-9000-000000000003', 'topic', 'blood-biomarkers', 'Blood biomarkers'),
  ('00000000-0000-4000-9000-000000000004', 'topic', 'sleep-and-cognition', 'Sleep and cognition'),
  ('00000000-0000-4000-9000-000000000005', 'topic', 'caregiver-support', 'Caregiver support'),
  ('00000000-0000-4000-9000-000000000006', 'topic', 'exercise', 'Exercise'),
  ('00000000-0000-4000-9000-000000000007', 'treatment', 'anti-amyloid-therapy', 'Anti-amyloid therapy'),
  ('00000000-0000-4000-9000-000000000008', 'topic', 'clinical-trials', 'Clinical trials'),
  ('00000000-0000-4000-9000-000000000009', 'topic', 'driving-safety', 'Driving and safety'),
  ('00000000-0000-4000-9000-000000000010', 'topic', 'hearing-and-cognition', 'Hearing and cognition');

INSERT INTO topic_synonyms (topic_id, synonym) VALUES
  ('00000000-0000-4000-9000-000000000001', 'AD'),
  ('00000000-0000-4000-9000-000000000002', 'MCI'),
  ('00000000-0000-4000-9000-000000000003', 'plasma biomarkers');

-- 20 demo content items across types & evidence levels, via generator + explicit rows.
-- 14 research papers:
INSERT INTO content_items (id, content_type, status, original_title, display_headline, plain_subheading,
                           slug, primary_publication_date, primary_source_key, primary_source_url,
                           peer_reviewed, population_type, study_category, evidence_strength,
                           actionability, sample_size, published_at)
SELECT
  ('00000000-0000-4000-a100-0000000000' || lpad(i::text, 2, '0'))::uuid,
  'research_paper', 'published',
  '[DEMO] Fictional study title #' || i,
  (ARRAY[
    'Blood test panel shows promise for earlier evaluation triage',
    'Sleep quality linked to memory performance in large cohort',
    'Structured exercise program shows modest cognitive benefit',
    'Hearing aid use associated with slower cognitive decline',
    'Anti-amyloid candidate clears Phase 2 safety review',
    'Caregiver coaching program reduces reported stress',
    'Mediterranean-style diet associated with lower dementia incidence',
    'Tau imaging predicts progression in small study',
    'Mouse study explores synaptic repair mechanism',
    'Lab study maps inflammation pathway in brain cells',
    'Preprint proposes new blood biomarker combination',
    'Review summarizes a decade of MCI progression research',
    'Meta-analysis: blood pressure control and dementia risk',
    'Case series describes rapid evaluation pathway'
  ])[i],
  '[DEMO] Plain-language subheading for fictional item #' || i,
  'demo-paper-' || i,
  (date '2026-05-01' + (i * 3)),
  'pubmed', 'https://example.com/demo/paper/' || i,
  (i NOT IN (9,10,11)),
  (CASE WHEN i = 9 THEN 'animal' WHEN i = 10 THEN 'laboratory' ELSE 'human' END)::population_type,
  (ARRAY['prospective_cohort','prospective_cohort','randomized_controlled_trial','prospective_cohort',
         'phase_2_trial','caregiver_intervention','prospective_cohort','case_series',
         'preclinical_animal','in_vitro_laboratory','preprint','systematic_review',
         'meta_analysis','case_series'])[i]::study_category,
  (ARRAY['preliminary','moderate','moderate','moderate','preliminary','moderate','preliminary',
         'very_preliminary','very_preliminary','very_preliminary','very_preliminary','moderate',
         'strong','very_preliminary'])[i]::evidence_strength,
  (ARRAY['worth_watching','no_action','ask_clinician','ask_clinician','worth_watching','worth_watching',
         'no_action','no_action','no_action','no_action','no_action','worth_watching',
         'ask_clinician','no_action'])[i]::actionability,
  (ARRAY[1204, 8850, 340, 2410, 118, 260, 61000, 24, NULL, NULL, 890, NULL, 42000, 12])[i],
  now() - (i || ' days')::interval
FROM generate_series(1, 14) AS i;

INSERT INTO research_papers (content_item_id, doi, pmid, journal, is_preprint, abstract)
SELECT ('00000000-0000-4000-a100-0000000000' || lpad(i::text, 2, '0'))::uuid,
       '10.99999/demo.' || i, (900000000 + i)::text, '[DEMO] Journal of Fictional Results',
       (i = 11), '[DEMO] Fictional abstract stored for internal evidence processing only.'
FROM generate_series(1, 14) AS i;

-- 3 clinical trials:
INSERT INTO content_items (id, content_type, status, original_title, display_headline, plain_subheading, slug,
                           primary_publication_date, primary_source_key, primary_source_url,
                           population_type, study_category, evidence_strength, actionability, published_at) VALUES
  ('00000000-0000-4000-a200-000000000001', 'clinical_trial', 'published',
   '[DEMO] A Study of Fictionumab in Early Alzheimer''s Disease',
   'Phase 3 anti-amyloid trial recruiting in the Upper Midwest',
   '[DEMO] Recruiting adults 60–85 with early-stage symptoms; study partner required.',
   'demo-trial-1', '2026-04-10', 'clinicaltrials', 'https://example.com/demo/trial/1',
   'human', 'phase_3_trial', 'not_applicable', 'ask_clinician', now() - interval '20 days'),
  ('00000000-0000-4000-a200-000000000002', 'clinical_trial', 'published',
   '[DEMO] Sleep Intervention for Mild Cognitive Impairment (SLEEP-MCI)',
   'Trial tests structured sleep program for people with MCI',
   '[DEMO] Remote participation available in several states.',
   'demo-trial-2', '2026-03-02', 'clinicaltrials', 'https://example.com/demo/trial/2',
   'human', 'phase_2_trial', 'not_applicable', 'worth_watching', now() - interval '15 days'),
  ('00000000-0000-4000-a200-000000000003', 'clinical_trial', 'published',
   '[DEMO] Caregiver Skills Coaching Study',
   'Study recruiting family caregivers for coaching program',
   '[DEMO] For caregivers of people with any dementia diagnosis.',
   'demo-trial-3', '2026-05-22', 'clinicaltrials', 'https://example.com/demo/trial/3',
   'human', 'caregiver_intervention', 'not_applicable', 'worth_watching', now() - interval '8 days');

INSERT INTO clinical_trials (content_item_id, nct_number, brief_title, sponsor, study_type, phase,
                             recruitment_status, conditions, enrollment, minimum_age_years, maximum_age_years,
                             requires_study_partner, start_date) VALUES
  ('00000000-0000-4000-a200-000000000001', 'NCT90000001', '[DEMO] Fictionumab in Early AD',
   '[DEMO] Example Pharma', 'Interventional', 'Phase 3', 'Recruiting',
   ARRAY['Alzheimer Disease'], 1200, 60, 85, true, '2026-02-01'),
  ('00000000-0000-4000-a200-000000000002', 'NCT90000002', '[DEMO] SLEEP-MCI',
   '[DEMO] Example University', 'Interventional', 'Phase 2', 'Recruiting',
   ARRAY['Mild Cognitive Impairment'], 300, 55, 90, false, '2026-01-15'),
  ('00000000-0000-4000-a200-000000000003', 'NCT90000003', '[DEMO] Caregiver Skills Coaching',
   '[DEMO] Example Institute', 'Interventional', 'N/A', 'Recruiting',
   ARRAY['Caregiver Burden'], 400, 18, NULL, false, '2026-03-01');

INSERT INTO clinical_trial_locations (content_item_id, facility, city, state, country, postal_code, location_status) VALUES
  ('00000000-0000-4000-a200-000000000001', '[DEMO] University Memory Research Center', 'Minneapolis', 'MN', 'US', '55455', 'Recruiting'),
  ('00000000-0000-4000-a200-000000000001', '[DEMO] Midwest Neurology Partners', 'Madison', 'WI', 'US', '53703', 'Recruiting'),
  ('00000000-0000-4000-a200-000000000002', '[DEMO] Remote (US)', NULL, NULL, 'US', NULL, 'Recruiting');

INSERT INTO clinical_trial_changes (content_item_id, change_type, detected_at, old_value, new_value) VALUES
  ('00000000-0000-4000-a200-000000000001', 'location_added', now() - interval '6 days',
   NULL, '{"facility": "[DEMO] Midwest Neurology Partners", "city": "Madison"}');

-- 1 grant, 1 regulatory update, 1 news mention (= 20 items total):
INSERT INTO content_items (id, content_type, status, original_title, display_headline, plain_subheading, slug,
                           primary_publication_date, primary_source_key, primary_source_url,
                           population_type, study_category, evidence_strength, actionability, published_at) VALUES
  ('00000000-0000-4000-a300-000000000001', 'research_grant', 'published',
   '[DEMO] Multi-site blood biomarker validation initiative',
   'Major grant funds blood biomarker validation across 20 sites',
   '[DEMO] Funding a hypothesis is not the same as validating it — results are years away.',
   'demo-grant-1', '2026-06-01', 'nih_reporter', 'https://example.com/demo/grant/1',
   'human', 'grant_announcement', 'not_applicable', 'no_action', now() - interval '10 days'),
  ('00000000-0000-4000-a300-000000000002', 'regulatory_update', 'published',
   '[DEMO] Label update for fictional anti-amyloid therapy',
   'Official label update adds monitoring guidance for fictional therapy',
   '[DEMO] Official regulatory action — discuss with a clinician if this therapy is in use.',
   'demo-reg-1', '2026-06-25', 'openfda', 'https://example.com/demo/fda/1',
   'human', 'regulatory_action', 'strong', 'official_safety', now() - interval '5 days'),
  ('00000000-0000-4000-a300-000000000003', 'news_mention', 'published',
   '[DEMO] News outlet covers biomarker study',
   'News coverage: blood test study draws attention',
   '[DEMO] Coverage of the fictional study in item #1; see the original paper for details.',
   'demo-news-1', '2026-06-28', 'gdelt', 'https://example.com/demo/news/1',
   'unknown', 'news_report', 'insufficient_information', 'no_action', now() - interval '4 days');

INSERT INTO research_grants (content_item_id, project_number, project_title, organization, funding_agency,
                             fiscal_year, award_amount) VALUES
  ('00000000-0000-4000-a300-000000000001', 'R01-DEMO-000001',
   '[DEMO] Multi-site blood biomarker validation initiative', '[DEMO] Example University', 'NIA', 2026, 14200000.00);

INSERT INTO regulatory_updates (content_item_id, agency, action_type, official_identifier, drug_names, effective_date) VALUES
  ('00000000-0000-4000-a300-000000000002', 'FDA', 'label_change', 'BLA-DEMO-0001',
   ARRAY['fictionumab'], '2026-06-25');

INSERT INTO news_mentions (content_item_id, publisher, article_url, language, country, discovery_query) VALUES
  ('00000000-0000-4000-a300-000000000003', '[DEMO] Example Times', 'https://example.com/demo/news/article-1',
   'en', 'US', 'dementia blood biomarker');

-- Topic assignments (sample):
INSERT INTO content_topics (content_item_id, topic_id) VALUES
  ('00000000-0000-4000-a100-000000000001', '00000000-0000-4000-9000-000000000003'),
  ('00000000-0000-4000-a100-000000000001', '00000000-0000-4000-9000-000000000001'),
  ('00000000-0000-4000-a100-000000000002', '00000000-0000-4000-9000-000000000004'),
  ('00000000-0000-4000-a100-000000000004', '00000000-0000-4000-9000-000000000010'),
  ('00000000-0000-4000-a100-000000000006', '00000000-0000-4000-9000-000000000005'),
  ('00000000-0000-4000-a200-000000000001', '00000000-0000-4000-9000-000000000007'),
  ('00000000-0000-4000-a200-000000000001', '00000000-0000-4000-9000-000000000008'),
  ('00000000-0000-4000-a200-000000000002', '00000000-0000-4000-9000-000000000004'),
  ('00000000-0000-4000-a300-000000000001', '00000000-0000-4000-9000-000000000003'),
  ('00000000-0000-4000-a300-000000000003', '00000000-0000-4000-9000-000000000003');

-- Story cluster: paper #1 + its news coverage + related grant.
INSERT INTO story_clusters (id, title, primary_content_item_id) VALUES
  ('00000000-0000-4000-a400-000000000001', '[DEMO] Blood biomarker triage story',
   '00000000-0000-4000-a100-000000000001');

INSERT INTO story_cluster_members (story_cluster_id, content_item_id, member_role) VALUES
  ('00000000-0000-4000-a400-000000000001', '00000000-0000-4000-a100-000000000001', 'primary_evidence'),
  ('00000000-0000-4000-a400-000000000001', '00000000-0000-4000-a300-000000000003', 'coverage'),
  ('00000000-0000-4000-a400-000000000001', '00000000-0000-4000-a300-000000000001', 'release');

-- Personalization: follows, saves, feed prefs.
INSERT INTO user_topic_preferences (user_id, topic_id) VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-9000-000000000003'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-9000-000000000004'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-9000-000000000005'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-9000-000000000009');

INSERT INTO household_feed_preferences (household_id, trial_radius_km, trial_center_postal_code, include_preliminary) VALUES
  ('00000000-0000-4000-c000-000000000001', 160, '55401', true);

INSERT INTO followed_trials (user_id, content_item_id) VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-a200-000000000001');

INSERT INTO saved_content (user_id, content_item_id, note) VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-a100-000000000001', 'Ask Dr. Lindqvist about this'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-a100-000000000004', NULL);

-- Notification prefs + one sample notification with delivery.
INSERT INTO notification_preferences (user_id, household_id, category, channel, enabled) VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-c000-000000000001', 'trial_change', 'email', true),
  ('00000000-0000-4000-a000-000000000001', NULL, 'digest', 'email', true);

INSERT INTO notifications (id, user_id, household_id, category, title, body, content_item_id) VALUES
  ('00000000-0000-4000-a500-000000000001', '00000000-0000-4000-a000-000000000001',
   '00000000-0000-4000-c000-000000000001', 'trial_change',
   'A trial you follow added a nearby location',
   'The [DEMO] Fictionumab study added a Madison, WI site.',
   '00000000-0000-4000-a200-000000000001');

INSERT INTO notification_deliveries (notification_id, channel, status, attempted_at, delivered_at) VALUES
  ('00000000-0000-4000-a500-000000000001', 'email', 'delivered', now() - interval '5 days', now() - interval '5 days');

-- Feature flags per §46.
INSERT INTO feature_flags (flag_key, description, default_enabled) VALUES
  ('ai_summaries',        'AI research summaries', true),
  ('document_ai',         'Consent-gated document summarization', false),
  ('trial_matching',      'Broad-criteria trial potential-matching', true),
  ('gdelt_ingestion',     'GDELT news discovery', true),
  ('weekly_digest',       'Weekly research briefing email', true),
  ('caregiver_coach',     'Communication coach library', true),
  ('resource_directory',  'Curated resource directory', true),
  ('subscriptions',       'Entitlement/billing layer', false),
  ('clinician_share_links','Expiring read-only clinician briefs', true),
  ('experimental_viz',    'Experimental timeline visualizations', false);

COMMIT;

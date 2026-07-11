-- Clarity Path — db/tests/schema_checks.sql
-- Assertion-style checks run against a seeded database. Any failure raises.

DO $$
DECLARE n bigint; txt text;
BEGIN
  -- 1. Seed shape: 20 published research items, 3 trials, demo household intact.
  SELECT count(*) INTO n FROM content_items WHERE status = 'published';
  IF n <> 20 THEN RAISE EXCEPTION 'expected 20 published content items, got %', n; END IF;

  SELECT count(*) INTO n FROM clinical_trials;
  IF n <> 3 THEN RAISE EXCEPTION 'expected 3 trials, got %', n; END IF;

  SELECT count(*) INTO n FROM household_memberships
    WHERE household_id = '00000000-0000-4000-c000-000000000001';
  IF n <> 3 THEN RAISE EXCEPTION 'expected 3 memberships, got %', n; END IF;

  -- 2. Single-owner guard: a second active owner must be rejected.
  BEGIN
    INSERT INTO household_memberships (household_id, user_id, role)
    VALUES ('00000000-0000-4000-c000-000000000001',
            '00000000-0000-4000-a000-000000000009', 'owner');
    RAISE EXCEPTION 'single-owner unique index did not fire';
  EXCEPTION WHEN unique_violation THEN NULL; -- expected
  END;

  -- 3. Enum guard: invalid navigation phase must be rejected.
  BEGIN
    UPDATE households SET navigation_phase = 'diagnosed'
      WHERE id = '00000000-0000-4000-c000-000000000001';
    RAISE EXCEPTION 'enum accepted invalid value';
  EXCEPTION WHEN invalid_text_representation THEN NULL; -- expected
  END;

  -- 4. updated_at trigger fires.
  UPDATE households SET name = name WHERE id = '00000000-0000-4000-c000-000000000001';
  SELECT count(*) INTO n FROM households
    WHERE id = '00000000-0000-4000-c000-000000000001'
      AND updated_at > created_at;
  IF n <> 1 THEN RAISE EXCEPTION 'touch_updated_at trigger did not fire'; END IF;

  -- 5. Full-text search finds the seeded observation.
  SELECT count(*) INTO n FROM observations
    WHERE search_tsv @@ plainto_tsquery('english', 'appointment three times');
  IF n < 1 THEN RAISE EXCEPTION 'observation FTS returned nothing'; END IF;

  -- 6. FTS on published research content.
  SELECT count(*) INTO n FROM content_items
    WHERE status = 'published'
      AND search_tsv @@ plainto_tsquery('english', 'blood test');
  IF n < 1 THEN RAISE EXCEPTION 'content FTS returned nothing'; END IF;

  -- 7. Partial unique identifier: duplicate NCT must be rejected.
  BEGIN
    INSERT INTO content_items (id, content_type, original_title)
      VALUES ('00000000-0000-4000-aaaa-000000000001', 'clinical_trial', 'dupe');
    INSERT INTO clinical_trials (content_item_id, nct_number)
      VALUES ('00000000-0000-4000-aaaa-000000000001', 'NCT90000001');
    RAISE EXCEPTION 'duplicate NCT accepted';
  EXCEPTION WHEN unique_violation THEN
    DELETE FROM content_items WHERE id = '00000000-0000-4000-aaaa-000000000001';
  END;

  -- 8. Tenant cascade: deleting a household removes all its care data
  --    but leaves research content untouched. (Rolled back.)
  BEGIN
    DELETE FROM households WHERE id = '00000000-0000-4000-c000-000000000001';
    SELECT count(*) INTO n FROM observations;
    IF n <> 0 THEN RAISE EXCEPTION 'observations survived household delete (%)', n; END IF;
    SELECT count(*) INTO n FROM documents;
    IF n <> 0 THEN RAISE EXCEPTION 'documents survived household delete (%)', n; END IF;
    SELECT count(*) INTO n FROM content_items;
    IF n <> 20 THEN RAISE EXCEPTION 'research content affected by household delete (%)', n; END IF;
    RAISE EXCEPTION 'CASCADE_OK'; -- force rollback of the delete
  EXCEPTION WHEN raise_exception THEN
    GET STACKED DIAGNOSTICS txt = MESSAGE_TEXT;
    IF txt <> 'CASCADE_OK' THEN RAISE; END IF;
  END;

  -- 9. Cascade rolled back: household data restored.
  SELECT count(*) INTO n FROM observations;
  IF n <> 4 THEN RAISE EXCEPTION 'rollback failed, observations = %', n; END IF;

  -- 10. Claim/summary FK chain and trial-change join are queryable.
  SELECT count(*) INTO n
    FROM clinical_trial_changes c
    JOIN clinical_trials t USING (content_item_id)
    JOIN content_items i ON i.id = t.content_item_id
   WHERE i.status = 'published';
  IF n < 1 THEN RAISE EXCEPTION 'trial change join returned nothing'; END IF;

  RAISE NOTICE 'ALL SCHEMA CHECKS PASSED';
END $$;

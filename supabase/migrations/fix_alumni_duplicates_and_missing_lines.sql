-- Fix: 296 vs 193, duplicate names, Fall 2023 / Spring 2022 / Spring 2017 not showing, filter empty
-- 1. Backfill line_label and crossing_year for 2023, 2022, 2017 by email (so those sections show)
-- 2. Remove duplicate alumni: keep one row per (line_label, line_order, full_name), prefer row with email/career info
-- For career data on 2023, 2022, 2017 run add_alumni_career_info.sql if not already applied.

-- Ensure columns exist
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_label text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS crossing_year integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_order integer;

-- =============================================================================
-- 1. Backfill line_label + crossing_year for Fall 2023, Spring 2022, Spring 2017 (by email)
-- =============================================================================
UPDATE public.alumni SET line_label = 'FALL 2023', crossing_year = 2023, chapter = COALESCE(chapter, 'Xi (Howard University)')
WHERE email = 'chandler@example.com' AND (line_label IS NULL OR line_label = '' OR crossing_year IS NULL);
UPDATE public.alumni SET line_label = 'FALL 2023', crossing_year = 2023, chapter = COALESCE(chapter, 'Xi (Howard University)')
WHERE email = 'michael@example.com' AND (line_label IS NULL OR line_label = '' OR crossing_year IS NULL);
UPDATE public.alumni SET line_label = 'FALL 2023', crossing_year = 2023, chapter = COALESCE(chapter, 'Xi (Howard University)')
WHERE email = 'carl@example.com' AND (line_label IS NULL OR line_label = '' OR crossing_year IS NULL);

UPDATE public.alumni SET line_label = 'SPRING 2022', crossing_year = 2022, chapter = COALESCE(chapter, 'Xi (Howard University)')
WHERE email IN (
  'derrick@example.com','marcus@example.com','cameron@example.com','joshua@example.com','christian@example.com',
  'trevor@example.com','jonah@example.com','lloyd@example.com','chase@example.com','jaron@example.com',
  'michael.singleton@example.com','santana@example.com'
) AND (line_label IS NULL OR line_label = '' OR crossing_year IS NULL);

UPDATE public.alumni SET line_label = 'SPRING 2017', crossing_year = 2017, chapter = COALESCE(chapter, 'Xi (Howard University)')
WHERE email IN (
  'raymond@example.com','vincent@example.com','kalen@example.com','johnny@example.com',
  'jared.mccain@example.com','guy@example.com','laguna@example.com','quodarrious@example.com'
) AND (line_label IS NULL OR line_label = '' OR crossing_year IS NULL);

-- Normalize line_label to short form (SPRING 2022, FALL 2023) for grouping/filter
UPDATE public.alumni
SET line_label = UPPER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(line_label, ''), ' - .*$', ''), '^Spring ', 'SPRING '))
WHERE line_label IS NOT NULL AND line_label != ''
  AND (line_label ~ ' - ' OR line_label ~ '^Spring ');

-- =============================================================================
-- 2. Delete duplicate alumni: keep one per (line_label, line_order, full_name)
--    Prefer: row with email, then row with more career data (industry, current_company, etc.)
-- =============================================================================
WITH normalized AS (
  SELECT
    id,
    COALESCE(NULLIF(TRIM(line_label), ''), 'OTHER') AS ln,
    COALESCE(line_order, 0) AS lo,
    COALESCE(TRIM(full_name), '') AS fn,
    (CASE WHEN email IS NOT NULL AND TRIM(email) != '' THEN 1 ELSE 0 END) AS has_email,
    (CASE WHEN industry IS NOT NULL AND TRIM(industry) != '' THEN 1 ELSE 0 END) +
    (CASE WHEN current_company IS NOT NULL AND TRIM(current_company) != '' THEN 1 ELSE 0 END) +
    (CASE WHEN current_position IS NOT NULL AND TRIM(current_position) != '' THEN 1 ELSE 0 END) +
    (CASE WHEN location IS NOT NULL AND TRIM(location) != '' THEN 1 ELSE 0 END) AS career_score
  FROM public.alumni
),
ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY ln, lo, fn
      ORDER BY has_email DESC, career_score DESC, id
    ) AS rn
  FROM normalized
)
DELETE FROM public.alumni
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

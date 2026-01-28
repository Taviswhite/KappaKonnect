-- Alumni lines: exact names for 2022, 2023, 2017. Short line_label (e.g. SPRING 2022) for filter only.
-- Ensure crossing columns exist
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_label text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS crossing_year integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_order integer;

-- =============================================================================
-- SPRING 2022 - 12 capos of the xi m.a.f.i.a
-- =============================================================================
UPDATE public.alumni SET
  full_name = 'Derrick Long',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 1
WHERE email = 'derrick@example.com';

UPDATE public.alumni SET
  full_name = 'Marcus Curvan',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 2
WHERE email = 'marcus@example.com';

UPDATE public.alumni SET
  full_name = 'Cameron Kee',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 3
WHERE email = 'cameron@example.com';

UPDATE public.alumni SET
  full_name = 'Joshua Bell-Bay HK',
  current_position = 'HK',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 4
WHERE email = 'joshua@example.com' AND (full_name LIKE 'Joshua Bell%' OR full_name = 'Joshua Bell-Bey');

UPDATE public.alumni SET
  full_name = 'Christian Ransome',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 5
WHERE email = 'christian@example.com';

UPDATE public.alumni SET
  full_name = 'Trevor Squirewell',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 6
WHERE email = 'trevor@example.com';

UPDATE public.alumni SET
  full_name = 'Jonah Lee',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 7
WHERE email = 'jonah@example.com';

UPDATE public.alumni SET
  full_name = 'Lloyd Maxwell ROKK',
  current_position = 'ROKK',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 8
WHERE email = 'lloyd@example.com';

UPDATE public.alumni SET
  full_name = 'Chase Tomlin',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 9
WHERE email = 'chase@example.com' AND (full_name LIKE 'Chase Tomlin%' OR full_name = 'Chase Tomlin');

UPDATE public.alumni SET
  full_name = 'Jaron Dandridge Jr',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 10
WHERE email = 'jaron@example.com';

UPDATE public.alumni SET
  full_name = 'Michael Singleton',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 11
WHERE email = 'michael.singleton@example.com';

UPDATE public.alumni SET
  full_name = 'Santana Wolfe',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 12
WHERE email = 'santana@example.com';

-- =============================================================================
-- FALL 2023 - 3 raiders of the xi syndicate (Dean: Lloyd Maxwell, ADP: Carnegie Tirado)
-- =============================================================================
UPDATE public.alumni SET
  full_name = 'Chandler Searcy',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 1
WHERE email = 'chandler@example.com';

UPDATE public.alumni SET
  full_name = 'Michael Taylor White',
  current_position = 'krowd pleaser',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 2
WHERE email = 'michael@example.com';

UPDATE public.alumni SET
  full_name = 'Carl Clay',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 3
WHERE email = 'carl@example.com';

-- =============================================================================
-- SPRING 2017 - 8 D.I.S.C.I.P.L.E.S. OF THE XI BLOODLINE
-- =============================================================================
UPDATE public.alumni SET
  full_name = 'Raymond Pottinger Jr.',
  current_position = 'KOVERT OPPS',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 1
WHERE email = 'raymond@example.com';

UPDATE public.alumni SET
  full_name = 'Vincent Roofe III',
  current_position = 'KURRENXI',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 2
WHERE email = 'vincent@example.com';

UPDATE public.alumni SET
  full_name = 'Kalen Johnson',
  current_position = 'PLAYAKTION',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 3
WHERE email = 'kalen@example.com';

UPDATE public.alumni SET
  full_name = 'Johnny Cooper',
  current_position = '(HK) KINGPIN',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 4
WHERE email = 'johnny@example.com';

UPDATE public.alumni SET
  full_name = 'Jared McCain',
  current_position = 'ATTIKA',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 5
WHERE email = 'jared.mccain@example.com';

UPDATE public.alumni SET
  full_name = 'Guy Lemonier Jr.',
  current_position = 'VICE',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 6
WHERE email = 'guy@example.com';

UPDATE public.alumni SET
  full_name = 'Laguna Foster Jr.',
  current_position = 'HOLYFIELD',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 7
WHERE email = 'laguna@example.com';

UPDATE public.alumni SET
  full_name = 'Quodarious Tony',
  current_position = 'JOHNNY KASH',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 8
WHERE email = 'quodarrious@example.com';

-- Normalize all line_label to short form (e.g. SPRING 2016, FALL 2023) for filter — remove descriptive names
UPDATE public.alumni
SET line_label = upper(regexp_replace(regexp_replace(line_label, ' - .*$', ''), '^Spring ', 'SPRING '))
WHERE line_label ~ ' - ' OR line_label ~ '^Spring ';

-- Remove 2024/2025 alumni except those with alumni role (e.g. Dylan, Andre). Keep only alumni-role members.
DELETE FROM public.alumni a
WHERE a.crossing_year IN (2024, 2025)
  AND NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = 'alumni'
    WHERE (p.email = a.email OR (a.email IS NULL AND p.user_id = a.user_id))
  );

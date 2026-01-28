-- Add crossing_year, chapter, line_order to alumni so older members (no profile) can show e.g. 1-Xi-24
ALTER TABLE public.alumni
  ADD COLUMN IF NOT EXISTS crossing_year integer,
  ADD COLUMN IF NOT EXISTS chapter text,
  ADD COLUMN IF NOT EXISTS line_order integer;

-- Set chapter for Xi alumni
UPDATE public.alumni SET chapter = 'Xi (Howard University)' WHERE email LIKE '%@example.com';

-- Fall 2023 — 3 raiders of the xi syndicate (crossing_year 2023)
UPDATE public.alumni SET crossing_year = 2023, line_order = 1 WHERE email = 'chandler@example.com';
UPDATE public.alumni SET crossing_year = 2023, line_order = 2 WHERE email = 'michael@example.com';
UPDATE public.alumni SET crossing_year = 2023, line_order = 3 WHERE email = 'carl@example.com';

-- Spring 2022 — 12 capos of the xi m.a.f.i.a (crossing_year 2022)
UPDATE public.alumni SET crossing_year = 2022, line_order = 1  WHERE email = 'derrick@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 2  WHERE email = 'marcus@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 3  WHERE email = 'cameron@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 4  WHERE email = 'joshua@example.com' AND full_name = 'Joshua Bell-Bey';
UPDATE public.alumni SET crossing_year = 2022, line_order = 5  WHERE email = 'christian@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 6  WHERE email = 'trevor@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 7  WHERE email = 'jonah@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 8  WHERE email = 'lloyd@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 9  WHERE email = 'chase@example.com' AND full_name = 'Chase Tomlin';
UPDATE public.alumni SET crossing_year = 2022, line_order = 10 WHERE email = 'jaron@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 11 WHERE email = 'michael.singleton@example.com';
UPDATE public.alumni SET crossing_year = 2022, line_order = 12 WHERE email = 'santana@example.com';

-- Spring 2017 — 8 D.I.S.C.I.P.L.E.S. OF THE XI BLOODLINE (crossing_year 2017)
UPDATE public.alumni SET crossing_year = 2017, line_order = 1 WHERE email = 'raymond@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 2 WHERE email = 'vincent@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 3 WHERE email = 'kalen@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 4 WHERE email = 'johnny@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 5 WHERE email = 'jared.mccain@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 6 WHERE email = 'guy@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 7 WHERE email = 'laguna@example.com';
UPDATE public.alumni SET crossing_year = 2017, line_order = 8 WHERE email = 'quodarrious@example.com';

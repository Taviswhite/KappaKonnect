-- Spring 1992: skip position 3, remove duplicate Marshall Mitchell and Byron Foston, Byron = 20-Xi-92
-- Spring 1985: fix numbering (13 people with Max Maurice at 10), remove duplicates

-- =============================================================================
-- SPRING 1992
-- =============================================================================
-- 1) Remove duplicate Marshall Mitchell (keep one; we'll set line_order 19)
WITH marshall_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM public.alumni
  WHERE line_label = 'SPRING 1992' AND (full_name = 'Marshall Mitchell' OR full_name ILIKE 'Marshall Mitchell%')
)
DELETE FROM public.alumni WHERE id IN (SELECT id FROM marshall_dupes WHERE rn > 1);

-- 2) Remove duplicate Byron/Bryan Foston only (keep one; Amia Foston is a separate person at 18)
WITH byron_dupes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM public.alumni
  WHERE line_label = 'SPRING 1992'
    AND (full_name ILIKE '%Byron Foston%' OR full_name ILIKE '%Bryan Foston%')
)
DELETE FROM public.alumni WHERE id IN (SELECT id FROM byron_dupes WHERE rn > 1);

-- 3) Renumber Spring 1992: skip 3, so 1,2,4,...,17,18 Amia, 19 Marshall, 20 Byron
UPDATE public.alumni SET line_order = 4 WHERE line_label = 'SPRING 1992' AND (full_name = 'William Ticer' OR full_name ILIKE 'William Ticer%');
UPDATE public.alumni SET line_order = 5 WHERE line_label = 'SPRING 1992' AND (full_name = 'Gregory Davila' OR full_name ILIKE 'Gregory Davila%');
UPDATE public.alumni SET line_order = 6 WHERE line_label = 'SPRING 1992' AND (full_name = 'James Stovall' OR full_name ILIKE 'James Stovall%');
UPDATE public.alumni SET line_order = 7 WHERE line_label = 'SPRING 1992' AND (full_name = 'Nnamdi Lowrie' OR full_name ILIKE 'Nnamdi Lowrie%');
UPDATE public.alumni SET line_order = 8 WHERE line_label = 'SPRING 1992' AND (full_name = 'Broderick Harrell' OR full_name ILIKE 'Broderick Harrell%');
UPDATE public.alumni SET line_order = 9 WHERE line_label = 'SPRING 1992' AND (full_name = 'Mark Davis' OR full_name ILIKE 'Mark Davis%');
UPDATE public.alumni SET line_order = 10 WHERE line_label = 'SPRING 1992' AND (full_name = 'Rameon Witt' OR full_name ILIKE 'Rameon Witt%');
UPDATE public.alumni SET line_order = 11 WHERE line_label = 'SPRING 1992' AND (full_name ILIKE 'Ma''ani Martin%' OR full_name ILIKE 'Maani Martin%');
UPDATE public.alumni SET line_order = 12 WHERE line_label = 'SPRING 1992' AND (full_name = 'Antonio Coe' OR full_name ILIKE 'Antonio Coe%');
UPDATE public.alumni SET line_order = 13 WHERE line_label = 'SPRING 1992' AND (full_name = 'Marlon Everett' OR full_name ILIKE 'Marlon Everett%');
UPDATE public.alumni SET line_order = 14 WHERE line_label = 'SPRING 1992' AND (full_name = 'Roderick Turner' OR full_name ILIKE 'Roderick Turner%');
UPDATE public.alumni SET line_order = 15 WHERE line_label = 'SPRING 1992' AND (full_name = 'Mason Harris' OR full_name ILIKE 'Mason Harris%');
UPDATE public.alumni SET line_order = 16 WHERE line_label = 'SPRING 1992' AND (full_name = 'William Rankins' OR full_name ILIKE 'William Rankins%');
UPDATE public.alumni SET line_order = 17 WHERE line_label = 'SPRING 1992' AND (full_name = 'Terrance C Jones' OR full_name ILIKE 'Terrance C Jones%' OR full_name ILIKE 'Terrance C. Jones%');
UPDATE public.alumni SET line_order = 18 WHERE line_label = 'SPRING 1992' AND (full_name = 'Amia Foston' OR full_name ILIKE 'Amia Foston%');
UPDATE public.alumni SET line_order = 19 WHERE line_label = 'SPRING 1992' AND (full_name = 'Marshall Mitchell' OR full_name ILIKE 'Marshall Mitchell%');
UPDATE public.alumni SET line_order = 20, full_name = 'Byron Foston'
WHERE line_label = 'SPRING 1992'
  AND (full_name ILIKE '%Byron Foston%' OR full_name ILIKE '%Bryan Foston%');

-- Insert Amia Foston at 18 if missing
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT 'Amia Foston', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 18
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE a.line_label = 'SPRING 1992' AND (a.full_name = 'Amia Foston' OR a.full_name ILIKE 'Amia Foston%')
);

-- Normalize Spring 1992 line_label to short form if needed
UPDATE public.alumni SET line_label = 'SPRING 1992'
WHERE line_label IS NOT NULL AND line_label LIKE 'SPRING 1992%' AND line_label != 'SPRING 1992';

-- =============================================================================
-- SPRING 1985: Remove duplicates, fix numbering (13 people: add Max Maurice at 10, 11–13 Phillip, Kenny, Paul)
-- =============================================================================
-- Delete duplicate Spring 1985 rows (keep one per line_label, line_order, full_name)
WITH dupes_1985 AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY line_label, COALESCE(line_order, 0), TRIM(full_name)
    ORDER BY id
  ) AS rn
  FROM public.alumni
  WHERE line_label = 'SPRING 1985'
)
DELETE FROM public.alumni WHERE id IN (SELECT id FROM dupes_1985 WHERE rn > 1);

-- Set correct line_order 1–13 for Spring 1985 (ensure Max Maurice 10, Phillip 11, Kenny 12, Paul 13)
UPDATE public.alumni SET line_order = 1 WHERE line_label = 'SPRING 1985' AND (full_name = 'Michael McFadden' OR full_name ILIKE 'Michael McFadden%');
UPDATE public.alumni SET line_order = 2 WHERE line_label = 'SPRING 1985' AND (full_name = 'Edward Lewis' OR full_name ILIKE 'Edward Lewis%');
UPDATE public.alumni SET line_order = 3 WHERE line_label = 'SPRING 1985' AND (full_name = 'Hakim Abdul Hadi' OR full_name ILIKE 'Hakim Abdul Hadi%');
UPDATE public.alumni SET line_order = 4 WHERE line_label = 'SPRING 1985' AND (full_name = 'Kenny James' OR full_name ILIKE 'Kenny James%');
UPDATE public.alumni SET line_order = 5 WHERE line_label = 'SPRING 1985' AND (full_name = 'Greg Banks' OR full_name ILIKE 'Greg Banks%');
UPDATE public.alumni SET line_order = 6 WHERE line_label = 'SPRING 1985' AND (full_name = 'Carrol Hughes' OR full_name ILIKE 'Carrol Hughes%');
UPDATE public.alumni SET line_order = 7 WHERE line_label = 'SPRING 1985' AND (full_name = 'Robert Spencer' OR full_name ILIKE 'Robert Spencer%');
UPDATE public.alumni SET line_order = 8 WHERE line_label = 'SPRING 1985' AND (full_name = 'Teddy LeRose' OR full_name ILIKE 'Teddy LeRose%');
UPDATE public.alumni SET line_order = 9 WHERE line_label = 'SPRING 1985' AND (full_name = 'Gerald Reid' OR full_name ILIKE 'Gerald Reid%');
UPDATE public.alumni SET line_order = 10 WHERE line_label = 'SPRING 1985' AND (full_name = 'Max Maurice' OR full_name ILIKE 'Max Maurice%');
UPDATE public.alumni SET line_order = 11 WHERE line_label = 'SPRING 1985' AND (full_name = 'Phillip Lee' OR full_name ILIKE 'Phillip Lee%');
UPDATE public.alumni SET line_order = 12 WHERE line_label = 'SPRING 1985' AND (full_name = 'Kenny Tucker' OR full_name ILIKE 'Kenny Tucker%');
UPDATE public.alumni SET line_order = 13 WHERE line_label = 'SPRING 1985' AND (full_name = 'Paul Chastang' OR full_name ILIKE 'Paul Chastang%');

-- Insert Max Maurice if missing (Spring 1985 position 10)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT 'Max Maurice', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 10
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE a.line_label = 'SPRING 1985' AND (a.full_name = 'Max Maurice' OR a.full_name ILIKE 'Max Maurice%')
);

-- Fix SPRING 2009: add Alix Martin at position 4, renumber Robert Spears through Kyle Smith to 5–16.
-- 16 Sons of the Diamond H.E.I.S.T. per canonical list.

INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT 'Alix Martin', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 4
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE a.line_label = 'SPRING 2009' AND a.line_order = 4 AND a.full_name = 'Alix Martin'
);

UPDATE public.alumni SET line_order = 5  WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Robert Spears%');
UPDATE public.alumni SET line_order = 6  WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Jason Cole%');
UPDATE public.alumni SET line_order = 7  WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Maurice Cheeks%');
UPDATE public.alumni SET line_order = 8  WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Jeremy Williams%');
UPDATE public.alumni SET line_order = 9  WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Victor Medina%');
UPDATE public.alumni SET line_order = 10 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Rodney Hawkins%');
UPDATE public.alumni SET line_order = 11 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Alvin Staley%');
UPDATE public.alumni SET line_order = 12 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Jarred McKee%');
UPDATE public.alumni SET line_order = 13 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Brandon Montgomery%');
UPDATE public.alumni SET line_order = 14 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Darrelle Washington%');
UPDATE public.alumni SET line_order = 15 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Khalil Bus-Kwofe%');
UPDATE public.alumni SET line_order = 16 WHERE line_label = 'SPRING 2009' AND (full_name ILIKE '%Kyle Smith%');

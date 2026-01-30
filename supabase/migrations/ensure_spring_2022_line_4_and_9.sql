-- Ensure Spring 2022 (12 Capos of the Xi M.A.F.I.A) has all 12 positions in the alumni portal.
-- Add missing 4-Xi-22 (Joshua Bell-Bay) and 9-Xi-22 (Chase Tomlin) if not present.
-- Includes career field (industry) and current_position (line name) for profile display.
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order, current_position, industry)
SELECT v.full_name, v.graduation_year, v.line_label, v.crossing_year, v.chapter, v.line_order, v.current_position, v.industry
FROM (VALUES
  ('Joshua Bell-Bay', 2024, 'SPRING 2022', 2022, 'Xi (Howard University)', 4, 'HK', NULL),
  ('Chase Tomlin', 2024, 'SPRING 2022', 2022, 'Xi (Howard University)', 9, 'Kassius Klay', NULL)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order, current_position, industry)
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE a.line_label = 'SPRING 2022'
    AND a.line_order = v.line_order
);

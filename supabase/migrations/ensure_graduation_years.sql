-- Backfill correct graduation_year for all alumni where it is missing or invalid (< 1900).
-- Spring crossing: typically crossing_year + 3 for older lines (<= 2016), + 2 for 2017+.

UPDATE public.alumni
SET graduation_year = CASE
  WHEN crossing_year <= 2016 THEN crossing_year + 3
  ELSE crossing_year + 1
END
WHERE crossing_year IS NOT NULL
  AND (graduation_year IS NULL OR graduation_year < 1900);

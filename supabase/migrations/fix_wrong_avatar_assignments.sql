-- Fix: Michael Singleton, Chase Tomlin, Joshua Bell-Bay showing other people's pics.
-- 1) Clear wrong assignments so each person gets only their file.
-- 2) Re-assign using the correct file for each.

-- Step 1: Clear wrong assignments

-- Joshua Bell-Bay (2022) should NOT have joshua_example.com (that's Carter's)
UPDATE public.alumni
SET avatar_url = NULL
WHERE (full_name ILIKE '%Joshua Bell%' OR full_name ILIKE '%Bell-Bay%' OR full_name ILIKE '%Bell-Bey%')
  AND (crossing_year = 2022 OR line_label ILIKE '%2022%')
  AND avatar_url IS NOT NULL
  AND avatar_url LIKE '%joshua_example.com%';

-- Chase: only Chase Tomlin (Spring 2022) should have chase_example.com; clear anyone else
UPDATE public.alumni
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL AND avatar_url LIKE '%chase_example.com%'
  AND NOT (full_name ILIKE '%Chase Tomlin%' AND (crossing_year = 2022 OR line_label ILIKE '%2022%'));

-- Michael Singleton: should ONLY have micheal.singleton (typo file), not michael_example.com; clear if he has wrong file
UPDATE public.alumni
SET avatar_url = NULL
WHERE full_name ILIKE '%Michael Singleton%'
  AND avatar_url IS NOT NULL
  AND avatar_url LIKE '%michael_example.com%'
  AND avatar_url NOT LIKE '%micheal.singleton%'
  AND avatar_url NOT LIKE '%michael_singleton%';

-- Step 2: Assign the correct file to each (order matters)

-- Joshua Carter (2024): joshua_example.com only
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%joshua_example.com-%' AND o.name NOT LIKE '%joshua.bell%' AND o.name NOT LIKE '%joshua_bell%' LIMIT 1)
WHERE (a.full_name ILIKE '%Joshua Carter%') AND (a.crossing_year = 2024 OR a.line_label ILIKE '%2024%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%joshua_example.com-%' AND o.name NOT LIKE '%joshua.bell%' AND o.name NOT LIKE '%joshua_bell%');

-- Joshua Bell-Bay (2022): joshua.bell or joshua_bell only (not joshua_example.com)
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name LIKE '%joshua.bell_example.com-%' OR o.name LIKE '%joshua_bell_example.com-%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Joshua Bell%' OR a.full_name ILIKE '%Bell-Bay%' OR a.full_name ILIKE '%Bell-Bey%')
  AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%joshua.bell_example.com-%' OR o.name LIKE '%joshua_bell_example.com-%'));

-- Chase Tomlin (Spring 2022) only: chase_example.com
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Chase Tomlin%') AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%');

-- Michael Singleton only: micheal.singleton_example.com or michael_singleton (NOT plain michael_example.com)
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Michael Singleton%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%'));

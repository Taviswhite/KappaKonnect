-- Fix: Michael Singleton, Chase Tomlin, Joshua Bell-Bay still showing wrong pics.
-- Uses broader storage filename patterns and clears wrong assignments first.

-- Step 1: Clear wrong avatar_url so we can re-assign correctly

-- Joshua Bell-Bay (2022): remove joshua_example.com (belongs to Joshua Carter)
UPDATE public.alumni
SET avatar_url = NULL
WHERE (full_name ILIKE '%Joshua Bell%' OR full_name ILIKE '%Bell-Bay%' OR full_name ILIKE '%Bell-Bey%')
  AND (crossing_year = 2022 OR line_label ILIKE '%2022%')
  AND avatar_url IS NOT NULL
  AND avatar_url LIKE '%joshua_example.com%'
  AND avatar_url NOT LIKE '%joshua.bell%'
  AND avatar_url NOT LIKE '%joshua_bell%';

-- Chase: clear chase_example.com from anyone who is NOT Chase Tomlin (2022)
UPDATE public.alumni
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL
  AND avatar_url LIKE '%chase_example.com%'
  AND NOT (full_name ILIKE '%Chase Tomlin%' AND (crossing_year = 2022 OR line_label ILIKE '%2022%'));

-- Michael Singleton: clear generic michael_example.com (not singleton-specific)
UPDATE public.alumni
SET avatar_url = NULL
WHERE full_name ILIKE '%Michael Singleton%'
  AND avatar_url IS NOT NULL
  AND avatar_url LIKE '%michael%'
  AND avatar_url NOT LIKE '%singleton%'
  AND avatar_url NOT LIKE '%micheal%';

-- Step 2: Assign correct file from storage (broad patterns so alternate spellings match)

-- Joshua Carter (2024): joshua_example.com only (exclude bell/bell-bay)
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
    AND o.name LIKE '%joshua%example.com%'
    AND o.name NOT LIKE '%joshua.bell%'
    AND o.name NOT LIKE '%joshua_bell%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Joshua Carter%')
  AND (a.crossing_year = 2024 OR a.line_label ILIKE '%2024%')
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars'
      AND o.name LIKE '%joshua%example.com%'
      AND o.name NOT LIKE '%joshua.bell%'
      AND o.name NOT LIKE '%joshua_bell%'
  );

-- Joshua Bell-Bay (2022): any file with joshua.bell or joshua_bell
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
    AND (o.name ILIKE '%joshua.bell%' OR o.name ILIKE '%joshua_bell%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Joshua Bell%' OR a.full_name ILIKE '%Bell-Bay%' OR a.full_name ILIKE '%Bell-Bey%')
  AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars'
      AND (o.name ILIKE '%joshua.bell%' OR o.name ILIKE '%joshua_bell%')
  );

-- Chase Tomlin (2022): chase_example.com
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase%example.com%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Chase Tomlin%')
  AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase%example.com%'
  );

-- Michael Singleton: any file with "singleton" or "micheal" (typo) in name
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
    AND (o.name ILIKE '%singleton%' OR o.name ILIKE '%micheal%')
  LIMIT 1
)
WHERE a.full_name ILIKE '%Michael Singleton%'
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars'
      AND (o.name ILIKE '%singleton%' OR o.name ILIKE '%micheal%')
  );

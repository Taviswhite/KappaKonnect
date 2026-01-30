-- Fix Chase Knox and Chase Tomlin avatars: each gets their own file.
-- Chase Tomlin (Spring 2022) → chase.tomlin_example.com-xxx.png
-- Chase Knox (Spring 2024)   → chase_example.com-xxx.png (no "tomlin" in filename)

-- Step 1: Clear wrong Chase avatar assignments

UPDATE public.alumni
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL
  AND (
    (full_name ILIKE '%Chase Tomlin%' AND (crossing_year = 2022 OR line_label ILIKE '%2022%') AND avatar_url NOT LIKE '%tomlin%')
    OR
    (full_name ILIKE '%Chase Knox%' AND (crossing_year = 2024 OR line_label ILIKE '%2024%') AND avatar_url LIKE '%tomlin%')
  );

-- Also clear chase_example.com from Chase Tomlin (he should get chase.tomlin, not chase)
UPDATE public.alumni
SET avatar_url = NULL
WHERE full_name ILIKE '%Chase Tomlin%'
  AND (crossing_year = 2022 OR line_label ILIKE '%2022%')
  AND avatar_url IS NOT NULL
  AND avatar_url LIKE '%chase%example.com%'
  AND avatar_url NOT LIKE '%tomlin%';

-- Step 2: Assign Chase Tomlin (2022) → file with "tomlin" in name
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
    AND o.name ILIKE '%chase%tomlin%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Chase Tomlin%')
  AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars' AND o.name ILIKE '%chase%tomlin%'
  );

-- Step 3: Assign Chase Knox (2024) → chase_example.com (no "tomlin")
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
    AND o.name LIKE '%chase_example.com%'
    AND o.name NOT LIKE '%tomlin%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Chase Knox%')
  AND (a.crossing_year = 2024 OR a.line_label ILIKE '%2024%')
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'avatars'
      AND o.name LIKE '%chase_example.com%'
      AND o.name NOT LIKE '%tomlin%'
  );

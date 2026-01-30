-- Run this in Supabase SQL Editor to see why avatars might not be showing.
-- Run each section separately and check the results.

-- 1) What files are in the avatars bucket? (If this returns 0 rows, photos weren't uploaded to bucket "avatars")
SELECT id, name, bucket_id, created_at
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY name
LIMIT 50;

-- 2) What do alumni have for full_name and avatar_url? (Problem people: Michael Singleton, Chase Tomlin, Joshua Carter, Joshua Bell-Bay)
SELECT id, full_name, email, avatar_url, line_label, crossing_year
FROM public.alumni
WHERE full_name ILIKE '%Michael Singleton%'
   OR full_name ILIKE '%Chase Tomlin%'
   OR full_name ILIKE '%Joshua Carter%'
   OR full_name ILIKE '%Joshua Bell%'
   OR full_name ILIKE '%Bell-Bay%'
   OR full_name ILIKE '%Jared%'
   OR full_name ILIKE '%Raymond%'
   OR full_name ILIKE '%Presley%'
ORDER BY full_name, crossing_year
LIMIT 40;

-- 3) Count: how many alumni have avatar_url set vs null
SELECT
  COUNT(*) FILTER (WHERE avatar_url IS NOT NULL AND avatar_url != '') AS with_avatar,
  COUNT(*) FILTER (WHERE avatar_url IS NULL OR avatar_url = '') AS without_avatar
FROM public.alumni;

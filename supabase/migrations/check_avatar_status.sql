-- Quick check: See what's in storage vs what profiles expect
-- Run this FIRST to see what needs to be mapped

-- 1. List all files in storage
SELECT 
  'Files in Storage' as section,
  name as value,
  NULL as expected_by_profile
FROM storage.objects 
WHERE bucket_id = 'avatars'
ORDER BY name;

-- 2. List all profile emails (what we expect)
SELECT 
  'Profile Emails' as section,
  email as value,
  full_name as expected_by_profile
FROM public.profiles
ORDER BY email;

-- 3. Check for matches
SELECT 
  p.full_name,
  p.email,
  o.name as file_name,
  CASE 
    WHEN o.name = p.email || '.jpg' OR 
         o.name = p.email || '.jpeg' OR 
         o.name = p.email || '.png' THEN '✅ Exact match'
    WHEN o.name LIKE '%' || SPLIT_PART(p.email, '@', 1) || '%' THEN '⚠️ Partial match'
    ELSE '❌ No match'
  END as match_status
FROM public.profiles p
LEFT JOIN storage.objects o ON o.bucket_id = 'avatars'
ORDER BY p.email, o.name;

-- 4. Current avatar URLs
SELECT 
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Has URL'
    ELSE '❌ Missing URL'
  END as status
FROM public.profiles
ORDER BY full_name;

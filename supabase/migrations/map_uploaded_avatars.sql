-- Map uploaded avatar photos to profiles
-- Run this AFTER you've uploaded photos to the 'avatars' storage bucket
-- 
-- IMPORTANT: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- You can find this in your Supabase URL: https://YOUR_PROJECT_REF.supabase.co

-- Option 1: Map by email (supports .jpg, .jpeg, .png, .webp, .gif)
-- This checks for common image extensions and uses the first match found
UPDATE public.profiles p
SET avatar_url = (
  SELECT 
    'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || 
    o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND (
    o.name = p.email || '.jpg' OR
    o.name = p.email || '.jpeg' OR
    o.name = p.email || '.png' OR
    o.name = p.email || '.webp' OR
    o.name = p.email || '.gif'
  )
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND (
    o.name = p.email || '.jpg' OR
    o.name = p.email || '.jpeg' OR
    o.name = p.email || '.png' OR
    o.name = p.email || '.webp' OR
    o.name = p.email || '.gif'
  )
);

-- Option 2: Map by full name (if photos are named like: Jeremiah_Ramirez.jpg)
-- Uncomment and use this if your photos use full names instead of emails
/*
UPDATE public.profiles p
SET avatar_url = (
  SELECT 
    'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || 
    LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
  WHERE EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'avatars' 
    AND name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
  )
)
WHERE EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'avatars' 
  AND name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
);
*/

-- Option 3: Map by firstname_lastname (if photos are named like: jerimiah_ramirez.jpg)
-- Uncomment and use this if your photos use firstname_lastname format
/*
UPDATE public.profiles p
SET avatar_url = (
  SELECT 
    'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || 
    LOWER(SPLIT_PART(p.full_name, ' ', 1) || '_' || SPLIT_PART(p.full_name, ' ', 2)) || '.jpg'
  WHERE EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'avatars' 
    AND name = LOWER(SPLIT_PART(p.full_name, ' ', 1) || '_' || SPLIT_PART(p.full_name, ' ', 2)) || '.jpg'
  )
)
WHERE EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'avatars' 
  AND name = LOWER(SPLIT_PART(p.full_name, ' ', 1) || '_' || SPLIT_PART(p.full_name, ' ', 2)) || '.jpg'
);
*/

-- Verify the mapping
-- Run this to see which profiles got avatars mapped:
SELECT 
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Mapped'
    ELSE '❌ Not mapped'
  END as status
FROM public.profiles
ORDER BY full_name;

-- Check which files are in storage but not mapped:
SELECT 
  o.name as file_name,
  'Not mapped to any profile' as status
FROM storage.objects o
WHERE o.bucket_id = 'avatars'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.avatar_url LIKE '%' || o.name
);

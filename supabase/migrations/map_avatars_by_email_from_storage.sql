-- Map avatar_url from storage bucket by email (files named firstname@example.com or email with extension)
-- Use relative path /avatars/<filename> so the app resolves to full Supabase Storage URL.
-- Run this after uploading photos to the 'avatars' bucket named by email (e.g. jordan@example.com.png).

-- ALUMNI: set avatar_url from storage where object name matches alumni.email
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (
    o.name = a.email
    OR o.name = a.email || '.jpg'
    OR o.name = a.email || '.jpeg'
    OR o.name = a.email || '.png'
    OR o.name = a.email || '.webp'
    OR o.name = a.email || '.gif'
  )
  LIMIT 1
)
WHERE a.email IS NOT NULL AND TRIM(a.email) != ''
AND EXISTS (
  SELECT 1
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (
    o.name = a.email
    OR o.name = a.email || '.jpg'
    OR o.name = a.email || '.jpeg'
    OR o.name = a.email || '.png'
    OR o.name = a.email || '.webp'
    OR o.name = a.email || '.gif'
  )
);

-- PROFILES: set avatar_url from storage where object name matches profiles.email
UPDATE public.profiles p
SET avatar_url = '/avatars/' || (
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (
    o.name = p.email
    OR o.name = p.email || '.jpg'
    OR o.name = p.email || '.jpeg'
    OR o.name = p.email || '.png'
    OR o.name = p.email || '.webp'
    OR o.name = p.email || '.gif'
  )
  LIMIT 1
)
WHERE p.email IS NOT NULL AND TRIM(p.email) != ''
AND EXISTS (
  SELECT 1
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (
    o.name = p.email
    OR o.name = p.email || '.jpg'
    OR o.name = p.email || '.jpeg'
    OR o.name = p.email || '.png'
    OR o.name = p.email || '.webp'
    OR o.name = p.email || '.gif'
  )
);

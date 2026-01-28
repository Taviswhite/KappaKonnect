-- Troubleshooting script for avatar uploads
-- Run these queries one by one to diagnose the issue

-- 1. Check if storage bucket exists and is configured correctly
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- 2. List all files in the avatars bucket
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
ORDER BY name;

-- 3. Check which profiles have avatar URLs set
SELECT 
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Has URL'
    ELSE '❌ No URL'
  END as status
FROM public.profiles
ORDER BY full_name;

-- 4. Check if there are files that match profile emails
SELECT 
  p.full_name,
  p.email,
  o.name as file_name,
  CASE 
    WHEN o.name LIKE p.email || '%' THEN '✅ Match found'
    ELSE '❌ No match'
  END as match_status
FROM public.profiles p
LEFT JOIN storage.objects o ON (
  o.bucket_id = 'avatars' 
  AND (
    o.name = p.email || '.jpg' OR
    o.name = p.email || '.jpeg' OR
    o.name = p.email || '.png' OR
    o.name = p.email || '.webp' OR
    o.name = p.email || '.gif'
  )
)
ORDER BY p.full_name;

-- 5. Get your Supabase project reference (needed for the mapping script)
-- This will show you what to replace YOUR_PROJECT_REF with
SELECT 
  current_setting('app.settings.supabase_url', true) as supabase_url;

-- 6. Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';

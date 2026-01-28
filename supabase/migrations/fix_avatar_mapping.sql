-- Fix avatar mapping - automatically detects your Supabase project URL
-- This script will map uploaded photos to profiles

-- First, let's get the actual Supabase project reference from your environment
-- You'll need to replace 'YOUR_PROJECT_REF' with your actual project reference
-- Find it in your Supabase URL: https://YOUR_PROJECT_REF.supabase.co

-- Option 1: Map by email (most common - if photos are named like: jeremiah@example.com.jpg)
-- Replace 'YOUR_PROJECT_REF' below with your actual project reference
DO $$
DECLARE
  project_ref TEXT := 'YOUR_PROJECT_REF'; -- ⚠️ CHANGE THIS to your project reference
  base_url TEXT;
BEGIN
  -- Construct the base URL
  base_url := 'https://' || project_ref || '.supabase.co/storage/v1/object/public/avatars/';
  
  -- Update profiles with matching files
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND (
    o.name = p.email || '.jpg' OR
    o.name = p.email || '.jpeg' OR
    o.name = p.email || '.png' OR
    o.name = p.email || '.webp' OR
    o.name = p.email || '.gif'
  )
  AND (p.avatar_url IS NULL OR p.avatar_url NOT LIKE '%' || o.name);
  
  RAISE NOTICE 'Updated % profiles with avatar URLs', (SELECT COUNT(*) FROM public.profiles WHERE avatar_url LIKE base_url || '%');
END $$;

-- Option 2: If your photos use a different naming pattern, use this instead:
-- For example, if photos are named: firstname_lastname.jpg
/*
DO $$
DECLARE
  project_ref TEXT := 'YOUR_PROJECT_REF'; -- ⚠️ CHANGE THIS
  base_url TEXT;
BEGIN
  base_url := 'https://' || project_ref || '.supabase.co/storage/v1/object/public/avatars/';
  
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
  AND (p.avatar_url IS NULL OR p.avatar_url NOT LIKE '%' || o.name);
END $$;
*/

-- Verify the results
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

-- Comprehensive avatar mapping script
-- This will map ALL uploaded photos to profiles automatically
-- Run this AFTER you've uploaded photos to the 'avatars' storage bucket

-- STEP 1: Get your Supabase project reference
-- Replace 'YOUR_PROJECT_REF' with your actual project reference from your Supabase URL
-- Example: If your URL is https://tlvtqddkoqljabjvythl.supabase.co, use 'tlvtqddkoqljabjvythl'
DO $$
DECLARE
  project_ref TEXT := 'tlvtqddkoqljabjvythl'; -- ⚠️ CHANGE THIS to your project reference
  base_url TEXT;
  matched_count INTEGER := 0;
BEGIN
  -- Construct the base URL
  base_url := 'https://' || project_ref || '.supabase.co/storage/v1/object/public/avatars/';
  
  RAISE NOTICE 'Starting avatar mapping with base URL: %', base_url;
  
  -- Method 1: Try exact email match (jeremiah@example.com.jpg)
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.jpg'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .jpg', matched_count;
  
  -- Method 2: Try email + .jpeg
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.jpeg'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .jpeg', matched_count;
  
  -- Method 3: Try email + .png
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.png'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .png', matched_count;
  
  -- Method 4: Try firstname_lastname format (jeremiah_ramirez.jpg)
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = LOWER(REPLACE(REPLACE(SPLIT_PART(p.full_name, ' ', 1) || '_' || SPLIT_PART(p.full_name, ' ', 2), ' ', '_'), '.', '')) || '.jpg'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by firstname_lastname + .jpg', matched_count;
  
  -- Method 5: Try firstname_lastname + .jpeg
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = LOWER(REPLACE(REPLACE(SPLIT_PART(p.full_name, ' ', 1) || '_' || SPLIT_PART(p.full_name, ' ', 2), ' ', '_'), '.', '')) || '.jpeg'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by firstname_lastname + .jpeg', matched_count;
  
  -- Method 6: Try full name with underscores (jeremiah_ramirez.jpg)
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by full name + .jpg', matched_count;
  
  RAISE NOTICE 'Avatar mapping complete!';
END $$;

-- STEP 2: Show mapping results
SELECT 
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Mapped'
    ELSE '❌ Not mapped'
  END as status
FROM public.profiles
ORDER BY 
  CASE WHEN avatar_url IS NULL THEN 0 ELSE 1 END,
  full_name;

-- STEP 3: Show files that weren't matched
SELECT 
  o.name as file_name,
  'Not matched to any profile' as status
FROM storage.objects o
WHERE o.bucket_id = 'avatars'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.avatar_url LIKE '%' || o.name
)
ORDER BY o.name;

-- STEP 4: Show profiles without avatars
SELECT 
  p.full_name,
  p.email,
  'No matching file found' as status
FROM public.profiles p
WHERE p.avatar_url IS NULL
ORDER BY p.full_name;

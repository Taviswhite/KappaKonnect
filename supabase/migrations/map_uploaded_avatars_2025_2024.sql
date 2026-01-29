-- Map uploaded avatar images for Spring 2025 and Spring 2024 members
-- Run this AFTER uploading images to the 'avatars' storage bucket
-- Replace 'tlvtqddkoqljabjvythl' with your actual Supabase project reference

DO $$
DECLARE
  project_ref TEXT := 'tlvtqddkoqljabjvythl'; -- ⚠️ CHANGE THIS to your project reference
  base_url TEXT;
  matched_count INTEGER := 0;
BEGIN
  -- Construct the base URL
  base_url := 'https://' || project_ref || '.supabase.co/storage/v1/object/public/avatars/';
  
  RAISE NOTICE 'Starting avatar mapping for 2025 and 2024 members with base URL: %', base_url;
  
  -- Update Spring 2025 and 2024 profiles with uploaded avatars
  -- Method 1: Try exact email match (jeremiah@example.com.png)
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.png'
  AND p.crossing_year IN (2025, 2024)
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .png', matched_count;
  
  -- Method 2: Try email + .jpg
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.jpg'
  AND p.crossing_year IN (2025, 2024)
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .jpg', matched_count;
  
  -- Method 3: Try email + .jpeg
  UPDATE public.profiles p
  SET avatar_url = base_url || o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'avatars' 
  AND o.name = p.email || '.jpeg'
  AND p.crossing_year IN (2025, 2024)
  AND (p.avatar_url IS NULL OR p.avatar_url != base_url || o.name);
  
  GET DIAGNOSTICS matched_count = ROW_COUNT;
  RAISE NOTICE 'Matched % profiles by exact email + .jpeg', matched_count;
  
  -- Also update alumni table
  UPDATE public.alumni a
  SET avatar_url = p.avatar_url
  FROM public.profiles p
  WHERE p.email = a.email
  AND p.crossing_year IN (2025, 2024)
  AND p.avatar_url IS NOT NULL
  AND (a.avatar_url IS NULL OR a.avatar_url != p.avatar_url);
  
  RAISE NOTICE 'Avatar mapping complete!';
END $$;

-- Show results: List all 2025 and 2024 members with their avatar URLs
SELECT 
  p.full_name,
  p.email,
  p.crossing_year,
  p.avatar_url,
  CASE 
    WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN '✅ Has Avatar'
    ELSE '❌ No Avatar'
  END as status
FROM public.profiles p
WHERE p.crossing_year IN (2025, 2024)
ORDER BY p.crossing_year DESC, p.full_name;

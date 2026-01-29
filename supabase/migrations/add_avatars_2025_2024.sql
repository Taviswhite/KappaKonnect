-- Add avatar URLs for Spring 2025 and Spring 2024 members
-- Uses Gravatar first (if available), then falls back to UI Avatars (generated from names)

-- Helper function to generate Gravatar URL from email
CREATE OR REPLACE FUNCTION gravatar_url(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
  IF email_address IS NULL OR email_address = '' THEN
    RETURN NULL;
  END IF;
  RETURN 'https://www.gravatar.com/avatar/' || MD5(LOWER(TRIM(email_address))) || '?s=200&d=404';
END;
$$ LANGUAGE plpgsql;

-- Helper function to generate UI Avatar URL from name (fallback)
CREATE OR REPLACE FUNCTION ui_avatar_url(full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  initials TEXT;
  name_parts TEXT[];
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extract initials (first letter of first name + first letter of last name)
  name_parts := string_to_array(TRIM(full_name), ' ');
  IF array_length(name_parts, 1) >= 2 THEN
    initials := UPPER(SUBSTRING(name_parts[1], 1, 1) || SUBSTRING(name_parts[array_length(name_parts, 1)], 1, 1));
  ELSIF array_length(name_parts, 1) = 1 THEN
    initials := UPPER(SUBSTRING(name_parts[1], 1, 1));
  ELSE
    RETURN NULL;
  END IF;
  
  -- UI Avatars API: https://ui-avatars.com/api/?name=John+Doe&size=200&background=random
  RETURN 'https://ui-avatars.com/api/?name=' || REPLACE(full_name, ' ', '+') || '&size=200&background=random&bold=true&color=fff';
END;
$$ LANGUAGE plpgsql;

-- Update Spring 2025 profiles with Gravatar URLs (if they don't already have avatars)
UPDATE public.profiles
SET avatar_url = gravatar_url(email)
WHERE crossing_year = 2025
  AND (avatar_url IS NULL OR avatar_url = '')
  AND email IS NOT NULL
  AND email != '';

-- Update Spring 2024 profiles with Gravatar URLs (if they don't already have avatars)
UPDATE public.profiles
SET avatar_url = gravatar_url(email)
WHERE crossing_year = 2024
  AND (avatar_url IS NULL OR avatar_url = '')
  AND email IS NOT NULL
  AND email != '';

-- For profiles still without avatars, use UI Avatars (generated from names)
UPDATE public.profiles
SET avatar_url = ui_avatar_url(full_name)
WHERE crossing_year IN (2025, 2024)
  AND (avatar_url IS NULL OR avatar_url = '')
  AND full_name IS NOT NULL
  AND full_name != '';

-- Also update alumni table for Spring 2025 and Spring 2024 members
UPDATE public.alumni a
SET avatar_url = COALESCE(
  (SELECT avatar_url FROM public.profiles p WHERE p.email = a.email AND p.avatar_url IS NOT NULL LIMIT 1),
  gravatar_url(a.email),
  ui_avatar_url(a.full_name)
)
FROM public.profiles p
WHERE p.email = a.email
  AND p.crossing_year IN (2025, 2024)
  AND (a.avatar_url IS NULL OR a.avatar_url = '')
  AND a.email IS NOT NULL;

-- Clean up the helper functions
DROP FUNCTION IF EXISTS gravatar_url(TEXT);
DROP FUNCTION IF EXISTS ui_avatar_url(TEXT);

-- Show results: List all 2025 and 2024 members with their new avatar URLs
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

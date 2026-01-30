-- 1) Revert alumni and profiles with NO matching pic in storage to avatar_url = NULL
--    (so app shows UI Avatars fallback like before)

-- ALUMNI: set avatar_url = NULL where no file in storage matches their email
UPDATE public.alumni a
SET avatar_url = NULL
WHERE a.avatar_url IS NOT NULL
AND a.email IS NOT NULL AND TRIM(a.email) != ''
AND NOT EXISTS (
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

-- PROFILES: set avatar_url = NULL where no file in storage matches their email
UPDATE public.profiles p
SET avatar_url = NULL
WHERE p.avatar_url IS NOT NULL
AND p.email IS NOT NULL AND TRIM(p.email) != ''
AND NOT EXISTS (
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

-- Also clear alumni that have avatar_url but no email (e.g. old name-based paths that don't exist)
UPDATE public.alumni
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL
AND (email IS NULL OR TRIM(email) = '');

-- 2) Backfill email for chapter advisors in alumni so storage-by-email mapping can find their pics
--    (assumes files named presley@example.com.png, carnegie@example.com.png, etc.)
--    Uses full-name patterns so we only update the intended advisor rows.

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'presley@example.com')
WHERE full_name ILIKE '%Presley Nelson%' AND (email IS NULL OR TRIM(email) = '');

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'carnegie@example.com')
WHERE full_name ILIKE '%Carnegie Tirado%' AND (email IS NULL OR TRIM(email) = '');

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'abdullah@example.com')
WHERE full_name ILIKE '%Abdullah Zaki%' AND (email IS NULL OR TRIM(email) = '');

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'demar@example.com')
WHERE full_name ILIKE '%Demar Rodgers%' AND (email IS NULL OR TRIM(email) = '');

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'pawlos@example.com')
WHERE full_name ILIKE '%Pawlos Germay%' AND (email IS NULL OR TRIM(email) = '');

-- 3) Map avatar_url from storage by email (alumni and profiles with a matching file get /avatars/<filename>)

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

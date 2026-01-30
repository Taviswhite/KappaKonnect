-- Fix missing photos for: Abdullah, Demar, Pawlos, Joshua Bell-Bay, Chase Tomlin, Michael Singleton, Jared McCain, Jonah Lee
-- Joshua Bell-Bay (Spring 2022) gets joshua.bell@example.com so he doesn't merge with Joshua Carter (2024, joshua@example.com).

-- 1) Set email so storage-by-email can find files (e.g. abdullah@example.com.png or joshua.png)
UPDATE public.alumni SET email = 'abdullah@example.com'
WHERE full_name ILIKE '%Abdullah Zaki%';

UPDATE public.alumni SET email = 'demar@example.com'
WHERE full_name ILIKE '%Demar Rodgers%';

UPDATE public.alumni SET email = 'pawlos@example.com'
WHERE full_name ILIKE '%Pawlos Germay%';

-- Joshua Bell-Bay / Bell-Bey (Spring 2022 only) – use joshua.bell so Joshua Carter (2024) is not overwritten
UPDATE public.alumni SET email = 'joshua.bell@example.com'
WHERE (full_name ILIKE '%Joshua Bell%' OR full_name ILIKE '%Bell-Bay%' OR full_name ILIKE '%Bell-Bey%')
  AND (crossing_year = 2022 OR line_label ILIKE '%2022%');

-- Chase Tomlin (Spring 2022) – unique email so he doesn’t get deduped with anyone else
UPDATE public.alumni SET email = 'chase.tomlin@example.com'
WHERE full_name ILIKE '%Chase Tomlin%' AND (crossing_year = 2022 OR line_label ILIKE '%2022%');

UPDATE public.alumni SET email = 'michael.singleton@example.com'
WHERE full_name ILIKE '%Michael Singleton%';

UPDATE public.alumni SET email = 'jared.mccain@example.com'
WHERE full_name ILIKE '%Jared McCain%';

-- Jonah Lee (Spring 2022)
UPDATE public.alumni SET email = 'jonah@example.com'
WHERE full_name ILIKE '%Jonah Lee%';

-- 2) Map avatar from storage by email (same as main mapping)
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
WHERE a.email IN (
  'abdullah@example.com', 'demar@example.com', 'pawlos@example.com',
  'joshua.bell@example.com', 'chase.tomlin@example.com', 'michael.singleton@example.com', 'jared.mccain@example.com', 'jonah@example.com'
)
AND EXISTS (
  SELECT 1 FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name = a.email OR o.name = a.email || '.jpg' OR o.name = a.email || '.jpeg'
       OR o.name = a.email || '.png' OR o.name = a.email || '.webp' OR o.name = a.email || '.gif')
);

-- 3) If still no avatar, try firstname-only filenames (abdullah.png, joshua.png, etc.) per person
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('abdullah.png','abdullah.jpg','abdullah.jpeg','abdullah.webp','abdullah.gif') LIMIT 1)
WHERE a.email = 'abdullah@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('abdullah.png','abdullah.jpg','abdullah.jpeg','abdullah.webp','abdullah.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('demar.png','demar.jpg','demar.jpeg','demar.webp','demar.gif') LIMIT 1)
WHERE a.email = 'demar@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('demar.png','demar.jpg','demar.jpeg','demar.webp','demar.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('pawlos.png','pawlos.jpg','pawlos.jpeg','pawlos.webp','pawlos.gif') LIMIT 1)
WHERE a.email = 'pawlos@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('pawlos.png','pawlos.jpg','pawlos.jpeg','pawlos.webp','pawlos.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('joshua.png','joshua.jpg','joshua.jpeg','joshua.webp','joshua.gif') LIMIT 1)
WHERE a.email = 'joshua.bell@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('joshua.png','joshua.jpg','joshua.jpeg','joshua.webp','joshua.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('jonah.png','jonah.jpg','jonah.jpeg','jonah.webp','jonah.gif') LIMIT 1)
WHERE a.email = 'jonah@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('jonah.png','jonah.jpg','jonah.jpeg','jonah.webp','jonah.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('chase.png','chase.jpg','chase.jpeg','chase.webp','chase.gif') LIMIT 1)
WHERE a.email = 'chase.tomlin@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('chase.png','chase.jpg','chase.jpeg','chase.webp','chase.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('michael.png','michael.jpg','michael.jpeg','michael.webp','michael.gif') LIMIT 1)
WHERE a.email = 'michael.singleton@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('michael.png','michael.jpg','michael.jpeg','michael.webp','michael.gif'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('jared.png','jared.jpg','jared.jpeg','jared.webp','jared.gif') LIMIT 1)
WHERE a.email = 'jared.mccain@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('jared.png','jared.jpg','jared.jpeg','jared.webp','jared.gif'));

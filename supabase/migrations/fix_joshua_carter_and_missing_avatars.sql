-- 1) Joshua Carter (2024): keep joshua_example.com pic
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%joshua_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Joshua Carter%') AND (a.crossing_year = 2024 OR a.line_label ILIKE '%2024%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%joshua_example.com-%');

-- 2) Joshua Bell-Bay (2022): his own pic (joshua.bell or joshua_bell) - upload as joshua.bell_example.com-xxx.png or joshua_bell_example.com-xxx.png
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name LIKE '%joshua.bell_example.com-%' OR o.name LIKE '%joshua_bell_example.com-%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Joshua Bell%' OR a.full_name ILIKE '%Bell-Bay%' OR a.full_name ILIKE '%Bell-Bey%')
  AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%joshua.bell_example.com-%' OR o.name LIKE '%joshua_bell_example.com-%'));

-- 3) Re-apply avatar from storage for the 5 whose pics still don't show (Jared, Michael Singleton, Pawlos, Demar, Abdullah)
--    Use flexible match: object name contains firstname and 'example.com'
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name ILIKE '%jared%' AND o.name LIKE '%example.com%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Jared McCain%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name ILIKE '%jared%' AND o.name LIKE '%example.com%');

-- Michael Singleton: only micheal.singleton or michael_singleton file (not plain michael_example.com)
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%')
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Michael Singleton%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%'));

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND o.name ILIKE '%pawlos%' AND o.name LIKE '%example.com%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Pawlos Germay%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name ILIKE '%pawlos%' AND o.name LIKE '%example.com%');

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND o.name ILIKE '%demar%' AND o.name LIKE '%example.com%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Demar Rodgers%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name ILIKE '%demar%' AND o.name LIKE '%example.com%');

UPDATE public.alumni a
SET avatar_url = '/avatars/' || (
  SELECT o.name FROM storage.objects o
  WHERE o.bucket_id = 'avatars'
  AND o.name ILIKE '%abdullah%' AND o.name LIKE '%example.com%'
  LIMIT 1
)
WHERE (a.full_name ILIKE '%Abdullah Zaki%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name ILIKE '%abdullah%' AND o.name LIKE '%example.com%');

-- 4) Chase Tomlin (Spring 2022): ensure he gets chase_example.com pic
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Chase Tomlin%') AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%');

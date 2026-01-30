-- 1) Restore Joshua Bell-Bay and Chase Tomlin if they were removed from alumni
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order, current_position, industry, email)
SELECT v.full_name, v.graduation_year, v.line_label, v.crossing_year, v.chapter, v.line_order, v.current_position, v.industry, v.email
FROM (VALUES
  ('Joshua Bell-Bay', 2024, 'SPRING 2022', 2022, 'Xi (Howard University)', 4, 'HK', NULL, 'joshua.bell@example.com'),
  ('Chase Tomlin', 2024, 'SPRING 2022', 2022, 'Xi (Howard University)', 9, 'Kassius Klay', NULL, 'chase.tomlin@example.com')
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order, current_position, industry, email)
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE (a.line_label ILIKE '%2022%' OR a.crossing_year = 2022)
    AND a.line_order = v.line_order
    AND (a.full_name ILIKE '%Joshua Bell%' OR a.full_name ILIKE '%Chase Tomlin%')
);

-- 2) Ensure Chase Tomlin (Spring 2022) has unique email so he doesn’t get deduped
UPDATE public.alumni SET email = 'chase.tomlin@example.com'
WHERE full_name ILIKE '%Chase Tomlin%' AND (crossing_year = 2022 OR line_label ILIKE '%2022%');

-- 3) Chapter advisors: ensure email and avatar_url from storage so pics show on dashboard
UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'presley@example.com')
WHERE full_name ILIKE '%Presley Nelson%';

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'carnegie@example.com')
WHERE full_name ILIKE '%Carnegie%';

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'abdullah@example.com')
WHERE full_name ILIKE '%Abdullah Zaki%';

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'demar@example.com')
WHERE full_name ILIKE '%Demar Rodgers%';

UPDATE public.alumni SET email = COALESCE(NULLIF(TRIM(email), ''), 'pawlos@example.com')
WHERE full_name ILIKE '%Pawlos Germay%';

-- 4) Map chapter advisor avatar_url from storage (email or firstname filenames)
UPDATE public.alumni a
SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name = a.email OR o.name = a.email || '.png' OR o.name = a.email || '.jpg' OR o.name = a.email || '.jpeg' OR o.name = a.email || '.webp' OR o.name = a.email || '.gif') LIMIT 1)
WHERE a.email IN ('presley@example.com', 'carnegie@example.com', 'abdullah@example.com', 'demar@example.com', 'pawlos@example.com')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name = a.email OR o.name = a.email || '.png' OR o.name = a.email || '.jpg' OR o.name = a.email || '.jpeg' OR o.name = a.email || '.webp' OR o.name = a.email || '.gif'));

-- Firstname-only fallback for chapter advisors
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('presley.png','presley.jpg','presley.jpeg','presley.webp','presley.gif') LIMIT 1)
WHERE a.email = 'presley@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('presley.png','presley.jpg','presley.jpeg','presley.webp','presley.gif'));

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('carnegie.png','carnegie.jpg','carnegie.jpeg','carnegie.webp','carnegie.gif') LIMIT 1)
WHERE a.email = 'carnegie@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('carnegie.png','carnegie.jpg','carnegie.jpeg','carnegie.webp','carnegie.gif'));

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('abdullah.png','abdullah.jpg','abdullah.jpeg','abdullah.webp','abdullah.gif') LIMIT 1)
WHERE a.email = 'abdullah@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('abdullah.png','abdullah.jpg','abdullah.jpeg','abdullah.webp','abdullah.gif'));

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('demar.png','demar.jpg','demar.jpeg','demar.webp','demar.gif') LIMIT 1)
WHERE a.email = 'demar@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('demar.png','demar.jpg','demar.jpeg','demar.webp','demar.gif'));

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('pawlos.png','pawlos.jpg','pawlos.jpeg','pawlos.webp','pawlos.gif') LIMIT 1)
WHERE a.email = 'pawlos@example.com' AND (a.avatar_url IS NULL OR a.avatar_url = '')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name IN ('pawlos.png','pawlos.jpg','pawlos.jpeg','pawlos.webp','pawlos.gif'));

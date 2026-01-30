-- Map avatar_url from storage when files are named: firstname_example.com-{uuid}.png
-- (e.g. jared_example.com-f05d9515-442a-41e8-a057-f6ef8a2ca01a.png)
-- Run this AFTER uploading the avatar images to the 'avatars' bucket.
-- Uses LIKE '%firstname_example.com-%' so object name matches with or without a folder prefix.

-- Spring 2017
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%raymond_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Raymond Pottinger%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%raymond_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%vincent_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Vincent Roofe%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%vincent_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%kalen_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Kalen Johnson%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%kalen_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%johnny_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Johnny Cooper%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%johnny_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jared_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Jared McCain%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jared_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%guy_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Guy Lemonier%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%guy_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%laguna_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Laguna Foster%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%laguna_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%quodarrious_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Quodarrious%' OR a.full_name ILIKE '%Quodarious Tony%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%quodarrious_example.com-%');

-- Spring 2022
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%derrick_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Derrick Long%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%derrick_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%marcus_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Marcus Curvan%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%marcus_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%cameron_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Cameron Kee%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%cameron_example.com-%');

-- Joshua Bell-Bay (2022) gets his own file: joshua.bell_example.com or joshua_bell_example.com (see fix_joshua_carter_and_missing_avatars.sql)
-- Joshua Carter (2024) keeps joshua_example.com - do not assign joshua_example.com to Bell-Bay here.

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%christian_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Christian Ransome%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%christian_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%trevor_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Trevor Squirewell%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%trevor_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jonah_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Jonah Lee%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jonah_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%lloyd_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Lloyd Maxwell%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%lloyd_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Chase Tomlin%') AND (a.crossing_year = 2022 OR a.line_label ILIKE '%2022%')
AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chase_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jaron_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Jaron Dandridge%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%jaron_example.com-%');

-- Michael Singleton: ONLY micheal.singleton (typo) or michael_singleton - do not use michael_example.com (could be wrong person)
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%') LIMIT 1)
WHERE (a.full_name ILIKE '%Michael Singleton%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND (o.name LIKE '%micheal.singleton_example.com-%' OR o.name LIKE '%michael_singleton_example.com-%'));

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%santana_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Santana Wolfe%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%santana_example.com-%');

-- Fall 2023
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chandler_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Chandler Searcy%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%chandler_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%carl_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Carl Clay%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%carl_example.com-%');

-- Chapter advisors
UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%presley_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Presley Nelson%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%presley_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%abdullah_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Abdullah Zaki%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%abdullah_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%demar_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Demar Rodgers%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%demar_example.com-%');

UPDATE public.alumni a SET avatar_url = '/avatars/' || (SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%pawlos_example.com-%' LIMIT 1)
WHERE (a.full_name ILIKE '%Pawlos Germay%') AND EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'avatars' AND o.name LIKE '%pawlos_example.com-%');

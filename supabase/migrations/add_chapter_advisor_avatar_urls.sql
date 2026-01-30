-- Set avatar_url for chapter advisors. Images are served from public/avatars/ (paths relative to app origin).
UPDATE public.alumni
SET avatar_url = '/avatars/presley-nelson-jr.png'
WHERE full_name ILIKE '%Presley Nelson%';

UPDATE public.alumni
SET avatar_url = '/avatars/carnegie.png'
WHERE full_name ILIKE '%Carnegie%';

UPDATE public.alumni
SET avatar_url = '/avatars/abdullah-zaki.png'
WHERE full_name ILIKE '%Abdullah Zaki%';

UPDATE public.alumni
SET avatar_url = '/avatars/demar.png'
WHERE full_name ILIKE '%Demar%';

UPDATE public.alumni
SET avatar_url = '/avatars/pawlos-germay.png'
WHERE full_name ILIKE '%Pawlos Germay%';

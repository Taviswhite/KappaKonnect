-- Manual profile creation script
-- Use this if the seed script isn't working
-- This will create profiles for any auth users that exist

-- ============================================
-- STEP 1: Create profiles for existing auth users
-- ============================================

-- Core 6 members
INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Jerimiah Ramirez',
  'jerimiah.ramirez@bison.howard.edu',
  '+15555550001',
  2027,
  'Executive Board',
  NULL
FROM auth.users 
WHERE email = 'jerimiah.ramirez@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Doole Gaiende Edwards',
  'doole.edwards@bison.howard.edu',
  '+15555550002',
  2026,
  'Programming',
  NULL
FROM auth.users 
WHERE email = 'doole.edwards@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Reginald Alexander',
  'reginald.alexander@bison.howard.edu',
  '+15555550003',
  2026,
  'Community Service',
  NULL
FROM auth.users 
WHERE email = 'reginald.alexander@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Grant Hill',
  'grant.hill@bison.howard.edu',
  '+15555550004',
  2026,
  'Fundraising',
  NULL
FROM auth.users 
WHERE email = 'grant.hill@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Jordan Atkins',
  'jordan.atkins@bison.howard.edu',
  '+15555550005',
  2027,
  'Community Service',
  NULL
FROM auth.users 
WHERE email = 'jordan.atkins@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
SELECT 
  id,
  id,
  'Andre Sawyerr',
  'andre.sawyerr@bison.howard.edu',
  '+15555550006',
  2025,
  NULL,
  NULL
FROM auth.users 
WHERE email = 'andre.sawyerr@bison.howard.edu'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  graduation_year = EXCLUDED.graduation_year,
  committee = EXCLUDED.committee;

-- ============================================
-- STEP 2: Create roles for these profiles
-- ============================================

-- Delete existing roles first, then insert new ones
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'jerimiah.ramirez@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users WHERE email = 'jerimiah.ramirez@bison.howard.edu';

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'doole.edwards@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'e_board'::public.app_role
FROM auth.users WHERE email = 'doole.edwards@bison.howard.edu';

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'reginald.alexander@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'committee_chairman'::public.app_role
FROM auth.users WHERE email = 'reginald.alexander@bison.howard.edu';

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'grant.hill@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'e_board'::public.app_role
FROM auth.users WHERE email = 'grant.hill@bison.howard.edu';

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'jordan.atkins@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'committee_chairman'::public.app_role
FROM auth.users WHERE email = 'jordan.atkins@bison.howard.edu';

DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'andre.sawyerr@bison.howard.edu'
);
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'alumni'::public.app_role
FROM auth.users WHERE email = 'andre.sawyerr@bison.howard.edu';

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  p.full_name,
  p.email,
  p.committee,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@bison.howard.edu'
ORDER BY p.full_name;

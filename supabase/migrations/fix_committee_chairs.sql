-- Quick fix script to update committee chair roles and committees
-- Run this in Supabase SQL Editor if the seed script didn't update roles correctly

-- Update roles to committee_chairman for the 6 committee chairs
-- First, ensure the roles exist (insert if they don't, update if they do)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'committee_chairman'::public.app_role
FROM auth.users 
WHERE email IN (
  'jordan.atkins@bison.howard.edu',
  'malachi.macmillan@bison.howard.edu',
  'jared.baker@bison.howard.edu',
  'ahmod.newton@bison.howard.edu',
  'kaden.cobb@bison.howard.edu',
  'carsen.manuel@bison.howard.edu'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove old member roles for committee chairs (optional - keeps them as both member and chair)
-- Uncomment if you want to remove the 'member' role:
-- DELETE FROM public.user_roles 
-- WHERE user_id IN (
--   SELECT id FROM auth.users 
--   WHERE email IN (
--     'jordan.atkins@bison.howard.edu',
--     'malachi.macmillan@bison.howard.edu',
--     'jared.baker@bison.howard.edu',
--     'ahmod.newton@bison.howard.edu',
--     'kaden.cobb@bison.howard.edu',
--     'carsen.manuel@bison.howard.edu'
--   )
-- ) AND role = 'member';

-- Update committees for each chair
UPDATE public.profiles 
SET committee = 'Community Service'
WHERE email = 'jordan.atkins@bison.howard.edu';

UPDATE public.profiles 
SET committee = 'Guide Right'
WHERE email = 'malachi.macmillan@bison.howard.edu';

UPDATE public.profiles 
SET committee = 'Public Relations'
WHERE email = 'jared.baker@bison.howard.edu';

UPDATE public.profiles 
SET committee = 'Programming'
WHERE email = 'ahmod.newton@bison.howard.edu';

UPDATE public.profiles 
SET committee = 'Health & Wellness'
WHERE email = 'kaden.cobb@bison.howard.edu';

UPDATE public.profiles 
SET committee = 'Historian'
WHERE email = 'carsen.manuel@bison.howard.edu';

-- Verify the changes
SELECT 
  p.full_name,
  p.email,
  p.committee,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email IN (
  'jordan.atkins@bison.howard.edu',
  'malachi.macmillan@bison.howard.edu',
  'jared.baker@bison.howard.edu',
  'ahmod.newton@bison.howard.edu',
  'kaden.cobb@bison.howard.edu',
  'carsen.manuel@bison.howard.edu'
)
ORDER BY p.full_name;

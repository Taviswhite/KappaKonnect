-- Add roles for all existing users
-- This script will give all existing users the default 'member' role

-- Step 1: Add 'member' role to all users who don't have a role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Verify the results
SELECT 
  u.email,
  u.id as user_id,
  ur.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Step 3: To make yourself an admin, run this (replace YOUR_EMAIL with your actual email):
-- UPDATE public.user_roles 
-- SET role = 'admin' 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');

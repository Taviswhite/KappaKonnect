-- Fix Jeremiah Ramirez profile if it's missing or has issues
-- Run this to check and fix Jeremiah's profile

-- Check if profile exists
SELECT 
  'Profile Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jerimiah@example.com') 
      THEN '✅ Profile exists'
    ELSE '❌ Profile missing'
  END as status;

-- Check if auth user exists
SELECT 
  'Auth User Check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jerimiah@example.com') 
      THEN '✅ Auth user exists'
    ELSE '❌ Auth user missing - create in Supabase Dashboard → Authentication → Users'
  END as status;

-- View current profile if it exists
SELECT 
  id,
  user_id,
  full_name,
  email,
  crossing_year,
  committee,
  graduation_year
FROM public.profiles
WHERE email = 'jerimiah@example.com';

-- View role if it exists
SELECT 
  ur.role,
  u.email
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'jerimiah@example.com';

-- If profile doesn't exist but auth user does, create it manually:
-- (Uncomment and run if needed)
/*
INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url, crossing_year)
SELECT 
  id,
  id,
  'Jeremiah Ramirez',
  'jerimiah@example.com',
  '+15555550001',
  2027,
  'Strategist',
  NULL,
  2025
FROM auth.users 
WHERE email = 'jerimiah@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = 'Jeremiah Ramirez',
  email = 'jerimiah@example.com',
  phone = '+15555550001',
  graduation_year = 2027,
  committee = 'Strategist',
  crossing_year = 2025;

-- Add role
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jerimiah@example.com');
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'e_board'::public.app_role
FROM auth.users WHERE email = 'jerimiah@example.com';
*/

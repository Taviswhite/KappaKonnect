-- Diagnostic script to identify why profiles aren't being created
-- Run this to check the current state

-- ============================================
-- CHECK 1: Do auth users exist?
-- ============================================
SELECT 
  'Auth Users Check' as check_type,
  COUNT(*) as count,
  'These are the auth users that exist' as description
FROM auth.users
WHERE email LIKE '%@bison.howard.edu'

UNION ALL

SELECT 
  'Auth Users (All)' as check_type,
  COUNT(*) as count,
  'Total auth users in system' as description
FROM auth.users;

-- List all auth users with @bison.howard.edu emails
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email LIKE '%@bison.howard.edu'
ORDER BY email;

-- ============================================
-- CHECK 2: Do profiles exist?
-- ============================================
SELECT 
  'Profiles Check' as check_type,
  COUNT(*) as count,
  'Profiles with @bison.howard.edu emails' as description
FROM public.profiles
WHERE email LIKE '%@bison.howard.edu'

UNION ALL

SELECT 
  'Profiles (All)' as check_type,
  COUNT(*) as count,
  'Total profiles in system' as description
FROM public.profiles;

-- List all profiles
SELECT 
  id,
  user_id,
  full_name,
  email,
  graduation_year,
  committee
FROM public.profiles
ORDER BY email;

-- ============================================
-- CHECK 3: Check if function exists
-- ============================================
SELECT 
  'Function Check' as check_type,
  COUNT(*) as count,
  'create_demo_profile function exists' as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'create_demo_profile';

-- ============================================
-- CHECK 4: Test the function manually
-- ============================================
-- Try to create a profile for the first auth user that exists
DO $$
DECLARE
  test_user_id UUID;
  test_result UUID;
BEGIN
  -- Get first auth user
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email LIKE '%@bison.howard.edu' 
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No auth users found with @bison.howard.edu email!';
    RAISE NOTICE 'You must create auth users first in Supabase Dashboard → Authentication → Users';
  ELSE
    RAISE NOTICE 'Found auth user: %', test_user_id;
    
    -- Try to create a test profile
    SELECT create_demo_profile(
      (SELECT email FROM auth.users WHERE id = test_user_id),
      'Test Profile',
      '+15555559999',
      2025,
      'Test Committee',
      'member'::public.app_role
    ) INTO test_result;
    
    IF test_result IS NULL THEN
      RAISE NOTICE 'Function returned NULL - check function logs above';
    ELSE
      RAISE NOTICE 'Function succeeded! Created profile with user_id: %', test_result;
    END IF;
  END IF;
END $$;

-- ============================================
-- CHECK 5: Check user_roles
-- ============================================
SELECT 
  'User Roles Check' as check_type,
  COUNT(*) as count,
  'Roles for @bison.howard.edu users' as description
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email LIKE '%@bison.howard.edu';

-- List all user roles
SELECT 
  u.email,
  ur.role
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email LIKE '%@bison.howard.edu'
ORDER BY u.email, ur.role;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@bison.howard.edu') = 0 
      THEN '❌ PROBLEM: No auth users exist. Create them in Supabase Dashboard → Authentication → Users'
    WHEN (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@bison.howard.edu') = 0 
      THEN '❌ PROBLEM: Auth users exist but no profiles. Run the seed script.'
    ELSE '✅ OK: Both auth users and profiles exist'
  END as status;

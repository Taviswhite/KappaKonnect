-- Cleanup script to remove old demo accounts before seeding new ones
-- Run this FIRST before running seed_demo_data.sql

-- ============================================
-- STEP 1: CHECK WHAT EXISTS
-- ============================================
-- See what old demo accounts exist
SELECT 
  'Old Demo Profiles' as type,
  COUNT(*) as count
FROM public.profiles 
WHERE email LIKE '%@example.com'

UNION ALL

SELECT 
  'Old Demo Roles' as type,
  COUNT(*) as count
FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 2: DELETE OLD DEMO USER ROLES FIRST
-- ============================================
-- Remove roles for users with @example.com emails
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 3: DELETE OLD DEMO PROFILES
-- ============================================
-- Remove all profiles with @example.com emails (old demo accounts)
DELETE FROM public.profiles 
WHERE email LIKE '%@example.com';

-- ============================================
-- STEP 4: DELETE OLD DEMO ATTENDANCE RECORDS
-- ============================================
DELETE FROM public.attendance
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 5: DELETE OLD DEMO TASKS
-- ============================================
DELETE FROM public.tasks
WHERE created_by IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
) OR assigned_to IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 6: DELETE OLD DEMO EVENTS
-- ============================================
DELETE FROM public.events
WHERE created_by IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 7: DELETE OLD DEMO CHANNELS/MESSAGES
-- ============================================
DELETE FROM public.messages
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

DELETE FROM public.channel_members
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

DELETE FROM public.channels
WHERE created_by IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- STEP 8: DELETE OLD DEMO NOTIFICATIONS
-- ============================================
DELETE FROM public.notifications
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check what's left (should show no @example.com accounts)
SELECT 
  'Remaining Old Profiles' as check_type,
  COUNT(*) as count
FROM public.profiles 
WHERE email LIKE '%@example.com'

UNION ALL

SELECT 
  'Remaining Old Roles' as check_type,
  COUNT(*) as count
FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@example.com'
);

-- Both should return 0 if cleanup was successful

-- List any remaining old accounts (should be empty)
SELECT 
  p.full_name,
  p.email,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@example.com'
ORDER BY p.full_name;

-- Seed demo data for KappaKonnect interview/demo environment
-- This script assumes all base migrations (000_complete_setup.sql, notifications, rename_officer_to_e_board...) are already applied
-- Run this in a **separate Supabase project** so it doesn't touch production data.

-- ============================================
-- STEP 1: CREATE AUTH USERS FIRST
-- ============================================
-- IMPORTANT: You MUST create auth users before running this script!
-- 
-- Go to Supabase Dashboard → Authentication → Add User
-- Create these 6 users with these emails and passwords:
--
--   1. admin@example.com / DemoAdmin123!
--   2. eboard@example.com / DemoEBoard123!
--   3. chair@example.com / DemoChair123!
--   4. member1@example.com / DemoMember123!
--   5. member2@example.com / DemoMember123!
--   6. alumni@example.com / DemoAlumni123!
--
-- After creating the users, run this script to populate profiles and demo data.
-- ============================================

-- Create a function to safely insert profiles only if auth users exist
CREATE OR REPLACE FUNCTION create_demo_profile(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_graduation_year INTEGER,
  p_committee TEXT,
  p_role public.app_role
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Skipping profile creation for % - user does not exist in auth.users. Please create this user first!', p_email;
    RETURN NULL;
  END IF;

  -- Insert profile (handle conflicts on both id and user_id)
  INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url)
  VALUES (v_user_id, v_user_id, p_full_name, p_email, p_phone, p_graduation_year, p_committee, NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    graduation_year = EXCLUDED.graduation_year,
    committee = EXCLUDED.committee;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: CREATE PROFILES AND ROLES
-- ============================================

-- Create profiles and get user IDs
DO $$
DECLARE
  admin_id UUID;
  eboard_id UUID;
  chair_id UUID;
  member1_id UUID;
  member2_id UUID;
  alumni_id UUID;
BEGIN
  -- Create profiles (returns user IDs)
  admin_id := create_demo_profile(
    'admin@example.com',
    'Demo Admin',
    '+15555550001',
    2015,
    'Executive Board',
    'admin'::public.app_role
  );

  eboard_id := create_demo_profile(
    'eboard@example.com',
    'Demo E-Board',
    '+15555550002',
    2016,
    'Programming',
    'e_board'::public.app_role
  );

  chair_id := create_demo_profile(
    'chair@example.com',
    'Demo Committee Chair',
    '+15555550003',
    2018,
    'Community Service',
    'committee_chairman'::public.app_role
  );

  member1_id := create_demo_profile(
    'member1@example.com',
    'Demo Member One',
    '+15555550004',
    2022,
    'Fundraising',
    'member'::public.app_role
  );

  member2_id := create_demo_profile(
    'member2@example.com',
    'Demo Member Two',
    '+15555550005',
    2023,
    'Community Service',
    'member'::public.app_role
  );

  alumni_id := create_demo_profile(
    'alumni@example.com',
    'Demo Alumni',
    '+15555550006',
    2010,
    NULL,
    'alumni'::public.app_role
  );

  -- Note: IDs are stored in variables but we'll query auth.users directly in subsequent inserts
END $$;

-- Create alumni record (using DO block to handle potential conflicts)
DO $$
DECLARE
  alumni_user_id UUID;
BEGIN
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'alumni@example.com' LIMIT 1;
  
  IF alumni_user_id IS NOT NULL THEN
    -- Update if it already exists, otherwise insert
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Demo Alumni',
        email = 'alumni@example.com',
        graduation_year = 2010,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Demo Alumni', 'alumni@example.com', 2010, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 3: CREATE EVENTS
-- ============================================

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Interest Meeting',
  'Overview of chapter activities and membership process.',
  'Student Union Room 101',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
  id
FROM auth.users WHERE email = 'eboard@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Service Day',
  'Community service project in the local neighborhood.',
  'Community Center',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  id
FROM auth.users WHERE email = 'chair@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Alumni Mixer',
  'Networking event with alumni and undergraduates.',
  'Campus Ballroom',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
  id
FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 4: CREATE ATTENDANCE RECORDS
-- ============================================

INSERT INTO public.attendance (event_id, user_id, checked_in_at)
SELECT 
  e.id,
  u.id,
  NOW() - INTERVAL '1 hour'
FROM public.events e
CROSS JOIN auth.users u
WHERE e.title = 'Interest Meeting' AND u.email = 'member1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance (event_id, user_id, checked_in_at)
SELECT 
  e.id,
  u.id,
  NOW() - INTERVAL '50 minutes'
FROM public.events e
CROSS JOIN auth.users u
WHERE e.title = 'Interest Meeting' AND u.email = 'member2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance (event_id, user_id, checked_in_at)
SELECT 
  e.id,
  u.id,
  NOW() - INTERVAL '2 days'
FROM public.events e
CROSS JOIN auth.users u
WHERE e.title = 'Service Day' AND u.email = 'member1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: CREATE CHANNELS
-- ============================================

INSERT INTO public.channels (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'General',
  id
FROM auth.users WHERE email = 'eboard@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.channels (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'Events & Announcements',
  id
FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 6: CREATE TASKS
-- ============================================

INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Book venue for Interest Meeting',
  'Confirm reservation and A/V setup.',
  'in_progress',
  eboard.id,
  NULL,
  NOW() + INTERVAL '2 days'
FROM auth.users eboard
CROSS JOIN auth.users member1
WHERE eboard.email = 'eboard@example.com' AND member1.email = 'member1@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Design flyers',
  'Create marketing materials for upcoming events.',
  'todo',
  chair.id,
  NULL,
  NOW() + INTERVAL '5 days'
FROM auth.users chair
CROSS JOIN auth.users member2
WHERE chair.email = 'chair@example.com' AND member2.email = 'member2@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 7: CREATE DOCUMENT FOLDERS AND DOCUMENTS
-- ============================================

INSERT INTO public.document_folders (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'Chapter Documents',
  id
FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.document_folders (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'Member Resources',
  id
FROM auth.users WHERE email = 'eboard@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.documents (id, folder_id, name, file_type, file_size, file_url, visibility, created_by, shared_with_roles)
SELECT 
  gen_random_uuid(),
  f.id,
  'Chapter Bylaws.pdf',
  'application/pdf',
  '120000',
  'documents/chapter-bylaws.pdf',
  'public',
  admin.id,
  ARRAY['member','alumni']
FROM public.document_folders f
CROSS JOIN auth.users admin
WHERE f.name = 'Chapter Documents' AND admin.email = 'admin@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.documents (id, folder_id, name, file_type, file_size, file_url, visibility, created_by, shared_with_roles)
SELECT 
  gen_random_uuid(),
  f.id,
  'Interest Meeting Agenda.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '45000',
  'documents/interest-meeting-agenda.docx',
  'shared',
  eboard.id,
  ARRAY['e_board','committee_chairman']
FROM public.document_folders f
CROSS JOIN auth.users eboard
WHERE f.name = 'Member Resources' AND eboard.email = 'eboard@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 8: CREATE NOTIFICATIONS
-- ============================================

INSERT INTO public.notifications (id, user_id, title, message, type, read, created_at)
SELECT 
  gen_random_uuid(),
  id,
  'Welcome to KappaKonnect',
  'This is a demo notification to showcase the notifications system.',
  'announcement',
  FALSE,
  NOW() - INTERVAL '1 day'
FROM auth.users WHERE email = 'member1@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (id, user_id, title, message, type, read, created_at)
SELECT 
  gen_random_uuid(),
  id,
  'Service Day Reminder',
  'Don''t forget to check in using the QR code at the event.',
  'event',
  FALSE,
  NOW() - INTERVAL '2 hours'
FROM auth.users WHERE email = 'member2@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 9: CREATE NOTIFICATION PREFERENCES
-- ============================================

INSERT INTO public.notification_preferences (user_id, email_enabled, push_enabled)
SELECT id, TRUE, TRUE
FROM auth.users WHERE email = 'member1@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  email_enabled = EXCLUDED.email_enabled,
  push_enabled = EXCLUDED.push_enabled;

INSERT INTO public.notification_preferences (user_id, email_enabled, push_enabled)
SELECT id, TRUE, FALSE
FROM auth.users WHERE email = 'member2@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  email_enabled = EXCLUDED.email_enabled,
  push_enabled = EXCLUDED.push_enabled;

-- ============================================
-- CLEANUP
-- ============================================

DROP FUNCTION IF EXISTS create_demo_profile(TEXT, TEXT, TEXT, INTEGER, TEXT, public.app_role);

-- ============================================
-- DONE!
-- ============================================
-- After running this script, you can log in with any of these accounts:
--   - admin@example.com / DemoAdmin123! (Admin role)
--   - eboard@example.com / DemoEBoard123! (E-Board role)
--   - chair@example.com / DemoChair123! (Committee Chair role)
--   - member1@example.com / DemoMember123! (Member role)
--   - member2@example.com / DemoMember123! (Member role)
--   - alumni@example.com / DemoAlumni123! (Alumni role)
--
-- All pages should now show rich, realistic demo data!
-- ============================================

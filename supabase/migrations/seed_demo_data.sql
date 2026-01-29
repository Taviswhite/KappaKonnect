-- Seed demo data for KappaKonnect interview/demo environment
-- This script assumes all base migrations (000_complete_setup.sql, notifications, rename_officer_to_e_board...) are already applied
-- Run this in a **separate Supabase project** so it doesn't touch production data.

-- ============================================
-- STEP 1: CREATE AUTH USERS FIRST
-- ============================================
-- IMPORTANT: You MUST create auth users before running this script!
-- 
-- Go to Supabase Dashboard → Authentication → Add User
-- Create these 6 CORE users with these emails and passwords:
--
--   1. jeremiah@example.com / DemoEBoard123! (Strategist - E-Board)
--   2. doole@example.com / DemoEBoard123! (Keeper of exchequer - E-Board)
--   3. grant@example.com / DemoEBoard123! (Lt. Strategist - E-Board)
--   4. bryce@example.com / DemoEBoard123! (Polemarch - E-Board)
--   5. mael@example.com / DemoEBoard123! (Vice Polemarch - E-Board)
--   6. don@example.com / DemoEBoard123! (Keeper of Records - E-Board)
--   7. carsen@example.com / DemoEBoard123! (Historian - E-Board)
--   8. jordan@example.com / DemoChair123! (Community Service Chairman)
--   9. malachi@example.com / DemoChair123! (Guide Right Chairman)
--   10. jared@example.com / DemoChair123! (Public Relations Chairman)
--   11. skylar@example.com / DemoChair123! (Programming Chairman)
--   12. kaden@example.com / DemoChair123! (Health & Wellness Chairman)
--
-- OPTIONAL: For all 32 members, create auth users for all emails listed below
--
-- After creating the users, run this script to populate profiles and demo data.
--
-- To verify profiles were created, run:
--   SELECT COUNT(*) FROM public.profiles;
--   SELECT full_name, email, role FROM public.profiles p
--   LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;
-- ============================================

-- Create a function to safely insert profiles only if auth users exist
CREATE OR REPLACE FUNCTION create_demo_profile(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_graduation_year INTEGER,
  p_committee TEXT,
  p_role public.app_role,
  p_crossing_year INTEGER DEFAULT NULL
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
  -- Remove committee for alumni and regular members (keep for E-Board and Committee Chairs)
  -- Avatar URLs will be set separately after uploading photos (see BULK_UPLOAD_AVATARS.md)
  INSERT INTO public.profiles (id, user_id, full_name, email, phone, graduation_year, committee, avatar_url, crossing_year)
  VALUES (
    v_user_id, 
    v_user_id, 
    p_full_name, 
    p_email, 
    p_phone, 
    p_graduation_year, 
    CASE 
      WHEN p_role IN ('e_board', 'committee_chairman') THEN p_committee
      ELSE NULL
    END,
    NULL, -- Avatar will be set after uploading photos
    p_crossing_year
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    graduation_year = EXCLUDED.graduation_year,
    committee = EXCLUDED.committee,
    crossing_year = EXCLUDED.crossing_year;

  -- Insert/update role - replace existing roles for this user
  -- First delete existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  -- Then insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role);

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
  -- Admin Account
  admin_id := create_demo_profile(
    'admin@example.com',
    'Admin User',
    '+15555550000',
    2027,
    NULL, -- No committee for admin
    'admin'::public.app_role,
    NULL -- No crossing year for admin
  );
  
  -- E-Board Positions (Spring 2025 line)
  PERFORM create_demo_profile(
    'jeremiah@example.com',
    'Jeremiah Ramirez',
    '+15555550001',
    2027,
    'Strategist',
    'e_board'::public.app_role,
    2025
  );

  eboard_id := create_demo_profile(
    'doole@example.com',
    'Doole Gaiende Edwards',
    '+15555550002',
    2026,
    'Keeper of exchequer',
    'e_board'::public.app_role,
    2025
  );

  member1_id := create_demo_profile(
    'grant@example.com',
    'Grant Hill',
    '+15555550003',
    2026,
    'Lt. Strategist',
    'e_board'::public.app_role,
    2025
  );

  member2_id := create_demo_profile(
    'bryce@example.com',
    'Bryce Perkins',
    '+15555550004',
    2026,
    'Polemarch',
    'e_board'::public.app_role,
    2024
  );

  chair_id := create_demo_profile(
    'mael@example.com',
    'Mael Blunt',
    '+15555550005',
    2026,
    'Vice Polemarch',
    'e_board'::public.app_role,
    2025
  );

  alumni_id := create_demo_profile(
    'don@example.com',
    'Don Jordan Duplan',
    '+15555550006',
    2026,
    'Keeper of Records',
    'e_board'::public.app_role,
    2025
  );

  -- Note: IDs are stored in variables but we'll query auth.users directly in subsequent inserts
END $$;

-- ============================================
-- ADDITIONAL MEMBERS (Optional - create auth users first)
-- ============================================
-- To add more members, create auth users with these emails in Supabase Dashboard → Authentication:
-- Then run this section to create their profiles
-- 
-- Additional member emails (create these auth users if you want all 32 members):
--   2025 Line: mael.blunt, malachi.macmillan, amir.stevenson, don.jordan, dylan.darling,
--              jared.baker, carsen.manuel, kaden.cobb
--   2024 Line: bryce.perkins, ahmod.newton, brian.singleton, kobe.denmarkgarnett, skylar.peterkin,
--              ahmad.edwards, gregory.allen, joseph.serra, kimahri.testamrk, keith.henderson,
--              joshua.carter, chase.knox, daniel.miller, brice.facey, marshall.williams,
--              brandon.mccaskill, mory.diakite, jordan.newsome

-- Create additional member profiles (will skip if auth users don't exist)
DO $$
BEGIN
  -- E-Board - Historian (Spring 2025 line)
  PERFORM create_demo_profile(
    'carsen@example.com',
    'Carsen Manuel',
    '+15555550007',
    2026,
    'Historian',
    'e_board'::public.app_role,
    2025
  );

  -- Committee Chairs (Spring 2025 line)
  PERFORM create_demo_profile(
    'jordan@example.com',
    'Jordan Atkins',
    '+15555550008',
    2027,
    'Community Service',
    'committee_chairman'::public.app_role,
    2025
  );

  PERFORM create_demo_profile(
    'malachi@example.com',
    'Malachi MacMillan',
    '+15555550009',
    2027,
    'Guide Right',
    'committee_chairman'::public.app_role,
    2025
  );

  PERFORM create_demo_profile(
    'jared@example.com',
    'Jared Baker',
    '+15555550010',
    2026,
    'Public Relations',
    'committee_chairman'::public.app_role,
    2025
  );

  PERFORM create_demo_profile(
    'skylar@example.com',
    'Skylar Peterkin',
    '+15555550011',
    2026,
    'Programming',
    'committee_chairman'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'kaden@example.com',
    'Kaden Cobb',
    '+15555550012',
    2026,
    'Health & Wellness',
    'committee_chairman'::public.app_role,
    2025
  );

  -- Additional Members (2025 Line - Spring 2025 crossing year)
  PERFORM create_demo_profile(
    'amir@example.com',
    'Amir Stevenson',
    '+15555550013',
    2027,
    NULL,
    'member'::public.app_role,
    2025
  );

  PERFORM create_demo_profile(
    'dylan@example.com',
    'Dylan Darling',
    '+15555550014',
    2025,
    NULL,
    'alumni'::public.app_role,
    2025
  );

  -- Additional Members (2024 Line - Spring 2024 crossing year)
  PERFORM create_demo_profile(
    'ahmod@example.com',
    'Ahmod Newton',
    '+15555550015',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'brian@example.com',
    'Brian Singleton II',
    '+15555550016',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'kobe@example.com',
    'Kobe Denmark-Garnett',
    '+15555550017',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'ahmad@example.com',
    'Ahmad Edwards',
    '+15555550018',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'gregory@example.com',
    'Gregory Allen Jr.',
    '+15555550019',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'joseph@example.com',
    'Joseph Serra',
    '+15555550020',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'khimarhi@example.com',
    'Kimahri Testamrk',
    '+15555550021',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'keith@example.com',
    'Keith Henderson Jr.',
    '+15555550022',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'joshua@example.com',
    'Joshua Carter',
    '+15555550023',
    2024,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'chase@example.com',
    'Chase Knox',
    '+15555550024',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'daniel@example.com',
    'Daniel Miller',
    '+15555550025',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'brice@example.com',
    'Brice Facey',
    '+15555550026',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'marshall@example.com',
    'Marshall Williams',
    '+15555550027',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'brandon@example.com',
    'Brandon McCaskill',
    '+15555550028',
    2026,
    NULL,
    'member'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'mory@example.com',
    'Mory Diakite',
    '+15555550029',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'jordan.newsome@example.com',
    'Jordan Newsome',
    '+15555550030',
    2025,
    NULL,
    'alumni'::public.app_role,
    2024
  );

  PERFORM create_demo_profile(
    'andre@example.com',
    'Andre Sawyerr',
    '+15555550031',
    2025,
    NULL,
    'alumni'::public.app_role,
    2025
  );

  PERFORM create_demo_profile(
    'reginald@example.com',
    'Reginald Alexander',
    '+15555550032',
    2026,
    NULL,
    'member'::public.app_role,
    2025
  );
END $$;

-- Create alumni records (using DO block to handle potential conflicts)
-- First, clean up any existing mock alumni records (not tied to auth.users)
DELETE FROM public.alumni 
WHERE email LIKE '%@example.com' 
  AND user_id IS NULL;

DO $$
DECLARE
  alumni_user_id UUID;
BEGIN
  -- Dylan Darling (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'dylan@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Dylan Darling',
        email = 'dylan@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Dylan Darling', 'dylan@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Marshall Williams (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'marshall@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Marshall Williams',
        email = 'marshall@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Marshall Williams', 'marshall@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Ahmad Edwards (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'ahmad@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Ahmad Edwards',
        email = 'ahmad@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Ahmad Edwards', 'ahmad@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Gregory Allen Jr. (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'gregory@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Gregory Allen Jr.',
        email = 'gregory@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Gregory Allen Jr.', 'gregory@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Kimahri Testamrk (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'khimarhi@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Kimahri Testamrk',
        email = 'khimarhi@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Kimahri Testamrk', 'khimarhi@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Chase Knox (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'chase@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Chase Knox',
        email = 'chase@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Chase Knox', 'chase@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Daniel Miller (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'daniel@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Daniel Miller',
        email = 'daniel@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Daniel Miller', 'daniel@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Mory Diakite (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'mory@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Mory Diakite',
        email = 'mory@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Mory Diakite', 'mory@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Jordan Newsome (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'jordan.newsome@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Jordan Newsome',
        email = 'jordan.newsome@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Jordan Newsome', 'jordan.newsome@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Joshua Carter (2024 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'joshua@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Joshua Carter',
        email = 'joshua@example.com',
        graduation_year = 2024,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Joshua Carter', 'joshua@example.com', 2024, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;

  -- Andre Sawyerr (2025 Alumni)
  SELECT id INTO alumni_user_id FROM auth.users WHERE email = 'andre@example.com' LIMIT 1;
  IF alumni_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.alumni WHERE user_id = alumni_user_id) THEN
      UPDATE public.alumni SET
        full_name = 'Andre Sawyerr',
        email = 'andre@example.com',
        graduation_year = 2025,
        current_position = 'Software Engineer',
        location = 'Atlanta, GA'
      WHERE user_id = alumni_user_id;
    ELSE
      INSERT INTO public.alumni (user_id, full_name, email, graduation_year, current_position, location)
      VALUES (alumni_user_id, 'Andre Sawyerr', 'andre@example.com', 2025, 'Software Engineer', 'Atlanta, GA');
    END IF;
  END IF;
END $$;

-- Mock alumni records removed - only real alumni (tied to auth.users) are kept

-- STEP 3: CREATE EVENTS
-- ============================================

-- Make events seeding idempotent: clear any existing demo events first
DELETE FROM public.events
WHERE title IN (
  'Interest Meeting',
  'Service Day',
  'Alumni Mixer',
  'Study Night',
  'Community Cleanup',
  'Scholarship Info Session',
  'Career Panel'
);

-- Core featured events
INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Interest Meeting',
  'Overview of chapter activities and membership process.',
  'Student Union Room 101',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
  id
FROM auth.users WHERE email = 'doole@example.com'
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
FROM auth.users WHERE email = 'jordan@example.com'
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
FROM auth.users WHERE email = 'jeremiah@example.com'
ON CONFLICT DO NOTHING;

-- Additional demo events to fully populate Events & Dashboard (total ~8)
INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Study Night',
  'Group study session with tutoring support.',
  'Library Room 204',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '3 hours',
  id
FROM auth.users WHERE email = 'grant@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Community Cleanup',
  'Neighborhood cleanup and outreach.',
  'City Park Entrance',
  NOW() + INTERVAL '9 days',
  NOW() + INTERVAL '9 days' + INTERVAL '4 hours',
  id
FROM auth.users WHERE email = 'jordan@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Scholarship Info Session',
  'Information session on chapter scholarships and applications.',
  'Student Union Auditorium',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
  id
FROM auth.users WHERE email = 'jeremiah@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (id, title, description, location, start_time, end_time, created_by)
SELECT 
  gen_random_uuid(),
  'Career Panel',
  'Alumni panel discussing careers in tech, business, and education.',
  'Business School Room 101',
  NOW() + INTERVAL '11 days',
  NOW() + INTERVAL '11 days' + INTERVAL '2 hours',
  id
FROM auth.users WHERE email = 'dylan@example.com'
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
WHERE e.title = 'Interest Meeting' AND u.email = 'grant@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance (event_id, user_id, checked_in_at)
SELECT 
  e.id,
  u.id,
  NOW() - INTERVAL '50 minutes'
FROM public.events e
CROSS JOIN auth.users u
WHERE e.title = 'Interest Meeting' AND u.email = 'jordan@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance (event_id, user_id, checked_in_at)
SELECT 
  e.id,
  u.id,
  NOW() - INTERVAL '2 days'
FROM public.events e
CROSS JOIN auth.users u
WHERE e.title = 'Service Day' AND u.email = 'grant@example.com'
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
FROM auth.users WHERE email = 'doole@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.channels (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'Events & Announcements',
  id
FROM auth.users WHERE email = 'jeremiah@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5B: CREATE CHAT MEMBERS & MESSAGES
-- ============================================

DO $$
BEGIN
  -- Only run this block if chat tables exist in this project
  IF to_regclass('public.channel_members') IS NOT NULL
     AND to_regclass('public.messages') IS NOT NULL THEN

    -- Add members to both channels (avoid ON CONFLICT in case there is no unique constraint)
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT c.id, u.id
    FROM public.channels c
    JOIN auth.users u ON u.email IN ('jeremiah@example.com', 'doole@example.com', 'grant@example.com', 'bryce@example.com', 'mael@example.com', 'jordan@example.com')
    WHERE c.name IN ('General', 'Events & Announcements')
      AND NOT EXISTS (
        SELECT 1
        FROM public.channel_members cm
        WHERE cm.channel_id = c.id
          AND cm.user_id = u.id
      );

    -- Seed messages in General channel
    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Welcome to the General channel! Use this space for everyday chapter communication.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'jeremiah@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Reminder: Interest Meeting is coming up this week. Please review your assigned tasks.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'doole@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Looking forward to the Service Day event! Who is available to help with setup?'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'jordan@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    -- Seed messages in Events & Announcements channel
    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'New event added: Career Panel with alumni from various industries. Please RSVP.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'jeremiah@example.com'
    WHERE c.name = 'Events & Announcements'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Service Day details have been updated with meeting point and timeline.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'jordan@example.com'
    WHERE c.name = 'Events & Announcements'
    ON CONFLICT DO NOTHING;

  END IF;
END $$;

-- ============================================
-- STEP 6: CREATE TASKS
-- ============================================

-- Make tasks seeding idempotent: clear any existing demo tasks first
DELETE FROM public.tasks
WHERE title IN (
  'Book venue for Interest Meeting',
  'Design flyers',
  'Prepare interest meeting slide deck',
  'Order catering for Alumni Mixer',
  'Promote Service Day on social media',
  'Update alumni contact list'
);

-- Core tasks
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
WHERE eboard.email = 'doole@example.com' AND member1.email = 'grant@example.com'
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
WHERE chair.email = 'jordan@example.com' AND member2.email = 'jordan@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Additional demo tasks
INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Prepare interest meeting slide deck',
  'Create slides covering chapter history, requirements, and expectations.',
  'in_progress',
  admin.id,
  NULL,
  NOW() + INTERVAL '3 days'
FROM auth.users admin
WHERE admin.email = 'jeremiah@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Order catering for Alumni Mixer',
  'Confirm catering order and headcount.',
  'todo',
  eboard.id,
  NULL,
  NOW() + INTERVAL '10 days'
FROM auth.users eboard
WHERE eboard.email = 'doole@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Promote Service Day on social media',
  'Post flyers and reminders on chapter social channels.',
  'completed',
  chair.id,
  NULL,
  NOW() - INTERVAL '1 day'
FROM auth.users chair
WHERE chair.email = 'jordan@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (id, title, description, status, created_by, assigned_to, due_date)
SELECT 
  gen_random_uuid(),
  'Update alumni contact list',
  'Verify emails and LinkedIn profiles for alumni.',
  'in_progress',
  admin.id,
  NULL,
  NOW() + INTERVAL '6 days'
FROM auth.users admin
WHERE admin.email = 'jeremiah@example.com'
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
FROM auth.users WHERE email = 'jeremiah@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.document_folders (id, name, created_by)
SELECT 
  gen_random_uuid(),
  'Member Resources',
  id
FROM auth.users WHERE email = 'doole@example.com'
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
WHERE f.name = 'Chapter Documents' AND admin.email = 'jeremiah@example.com'
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
WHERE f.name = 'Member Resources' AND eboard.email = 'doole@example.com'
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
FROM auth.users WHERE email = 'grant@example.com'
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
FROM auth.users WHERE email = 'jordan@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 9: CREATE NOTIFICATION PREFERENCES
-- ============================================

INSERT INTO public.notification_preferences (user_id, email_enabled, push_enabled)
SELECT id, TRUE, TRUE
FROM auth.users WHERE email = 'grant@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  email_enabled = EXCLUDED.email_enabled,
  push_enabled = EXCLUDED.push_enabled;

INSERT INTO public.notification_preferences (user_id, email_enabled, push_enabled)
SELECT id, TRUE, FALSE
FROM auth.users WHERE email = 'jordan@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  email_enabled = EXCLUDED.email_enabled,
  push_enabled = EXCLUDED.push_enabled;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries in Supabase SQL Editor to verify data was created:

-- Check profile count:
-- SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Check profiles with roles:
-- SELECT 
--   p.full_name,
--   p.email,
--   ur.role,
--   p.committee
-- FROM public.profiles p
-- LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
-- ORDER BY p.full_name;

-- Check role distribution:
-- SELECT 
--   ur.role,
--   COUNT(*) as count
-- FROM public.user_roles ur
-- GROUP BY ur.role
-- ORDER BY count DESC;

-- Check alumni count:
-- SELECT COUNT(*) as total_alumni FROM public.alumni;

-- View all alumni:
-- SELECT 
--   full_name,
--   email,
--   graduation_year,
--   current_company,
--   current_position,
--   location,
--   industry
-- FROM public.alumni
-- ORDER BY graduation_year DESC, full_name;

-- Check alumni by industry:
-- SELECT 
--   industry,
--   COUNT(*) as count
-- FROM public.alumni
-- WHERE industry IS NOT NULL
-- GROUP BY industry
-- ORDER BY count DESC;

-- ============================================
-- CLEANUP
-- ============================================

DROP FUNCTION IF EXISTS create_demo_profile(TEXT, TEXT, TEXT, INTEGER, TEXT, public.app_role);

-- ============================================
-- DONE!
-- ============================================
-- After running this script, you can log in with any of these accounts:
--   - jeremiah@example.com / DemoEBoard123! (Strategist - E-Board)
--   - doole@example.com / DemoEBoard123! (Keeper of exchequer - E-Board)
--   - grant@example.com / DemoEBoard123! (Lt. Strategist - E-Board)
--   - bryce@example.com / DemoEBoard123! (Polemarch - E-Board)
--   - mael@example.com / DemoEBoard123! (Vice Polemarch - E-Board)
--   - don@example.com / DemoEBoard123! (Keeper of Records - E-Board)
--   - carsen@example.com / DemoEBoard123! (Historian - E-Board)
--   - jordan@example.com / DemoChair123! (Community Service Chairman)
--   - malachi@example.com / DemoChair123! (Guide Right Chairman)
--   - jared@example.com / DemoChair123! (Public Relations Chairman)
--   - skylar@example.com / DemoChair123! (Programming Chairman)
--   - kaden@example.com / DemoChair123! (Health & Wellness Chairman)
--   - All other members listed above (if auth users were created)
--
-- All pages should now show rich, realistic demo data!
-- 
-- If you don't see members on the Members page:
--   1. Verify auth users exist: Supabase Dashboard → Authentication → Users
--   2. Verify profiles exist: Run the verification queries above
--   3. Check RLS policies: Make sure you're logged in when viewing the Members page
--
-- If you don't see alumni on the Alumni page:
--   1. Run the seed script (it creates 30+ alumni records)
--   2. Verify alumni exist: Run "SELECT COUNT(*) FROM public.alumni;" (should be ~30+)
--   3. Make sure you're logged in (RLS requires authentication)
--   4. Check browser console for any errors
-- ============================================

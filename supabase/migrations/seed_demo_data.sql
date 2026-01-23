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
--   1. admin@example.com / DemoAdmin123!
--   2. eboard@example.com / DemoEBoard123!
--   3. chair@example.com / DemoChair123!
--   4. member1@example.com / DemoMember123!
--   5. member2@example.com / DemoMember123!
--   6. alumni@example.com / DemoAlumni123!
--
-- OPTIONAL: For more members (18 total), also create these auth users:
--   member3@example.com through member18@example.com (all with password DemoMember123!)
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

-- ============================================
-- ADDITIONAL MEMBERS (Optional - create auth users first)
-- ============================================
-- To add more members, create auth users with these emails in Supabase Dashboard → Authentication:
-- Then run this section to create their profiles
-- 
-- Additional member emails (create these auth users if you want more members):
--   member3@example.com, member4@example.com, member5@example.com, member6@example.com,
--   member7@example.com, member8@example.com, member9@example.com, member10@example.com,
--   member11@example.com, member12@example.com, member13@example.com, member14@example.com,
--   member15@example.com, member16@example.com, member17@example.com, member18@example.com

-- Create additional member profiles (will skip if auth users don't exist)
DO $$
BEGIN
  -- Member 3 - E-Board
  PERFORM create_demo_profile(
    'member3@example.com',
    'James Wilson',
    '+15555550007',
    2017,
    'Programming',
    'e_board'::public.app_role
  );

  -- Member 4 - Committee Chair
  PERFORM create_demo_profile(
    'member4@example.com',
    'Michael Anderson',
    '+15555550008',
    2019,
    'Community Service',
    'committee_chairman'::public.app_role
  );

  -- Member 5 - Member
  PERFORM create_demo_profile(
    'member5@example.com',
    'David Thompson',
    '+15555550009',
    2021,
    'Fundraising',
    'member'::public.app_role
  );

  -- Member 6 - Member
  PERFORM create_demo_profile(
    'member6@example.com',
    'Christopher Martinez',
    '+15555550010',
    2022,
    'Programming',
    'member'::public.app_role
  );

  -- Member 7 - Member
  PERFORM create_demo_profile(
    'member7@example.com',
    'Daniel Garcia',
    '+15555550011',
    2023,
    'Community Service',
    'member'::public.app_role
  );

  -- Member 8 - Member
  PERFORM create_demo_profile(
    'member8@example.com',
    'Matthew Rodriguez',
    '+15555550012',
    2021,
    'Fundraising',
    'member'::public.app_role
  );

  -- Member 9 - Member
  PERFORM create_demo_profile(
    'member9@example.com',
    'Andrew Lee',
    '+15555550013',
    2022,
    'Programming',
    'member'::public.app_role
  );

  -- Member 10 - Member
  PERFORM create_demo_profile(
    'member10@example.com',
    'Joseph Walker',
    '+15555550014',
    2023,
    'Community Service',
    'member'::public.app_role
  );

  -- Member 11 - Member
  PERFORM create_demo_profile(
    'member11@example.com',
    'Joshua Hall',
    '+15555550015',
    2020,
    'Fundraising',
    'member'::public.app_role
  );

  -- Member 12 - Member
  PERFORM create_demo_profile(
    'member12@example.com',
    'Ryan Young',
    '+15555550016',
    2021,
    'Programming',
    'member'::public.app_role
  );

  -- Member 13 - Member
  PERFORM create_demo_profile(
    'member13@example.com',
    'Nicholas King',
    '+15555550017',
    2022,
    'Community Service',
    'member'::public.app_role
  );

  -- Member 14 - Member
  PERFORM create_demo_profile(
    'member14@example.com',
    'Tyler Wright',
    '+15555550018',
    2023,
    'Fundraising',
    'member'::public.app_role
  );

  -- Member 15 - Member
  PERFORM create_demo_profile(
    'member15@example.com',
    'Brandon Lopez',
    '+15555550019',
    2021,
    'Programming',
    'member'::public.app_role
  );

  -- Member 16 - Member
  PERFORM create_demo_profile(
    'member16@example.com',
    'Justin Hill',
    '+15555550020',
    2022,
    'Community Service',
    'member'::public.app_role
  );

  -- Member 17 - Member
  PERFORM create_demo_profile(
    'member17@example.com',
    'Jonathan Scott',
    '+15555550021',
    2023,
    'Fundraising',
    'member'::public.app_role
  );

  -- Member 18 - Member
  PERFORM create_demo_profile(
    'member18@example.com',
    'Nathan Green',
    '+15555550022',
    2020,
    'Programming',
    'member'::public.app_role
  );
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

-- Additional standalone alumni records (not tied to auth.users) to fill Alumni portal
-- Use a function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION seed_alumni_records() RETURNS void AS $$
BEGIN
  -- Clear existing mock alumni first to prevent duplicates
  DELETE FROM public.alumni 
  WHERE email LIKE '%@example.com' 
    AND user_id IS NULL;

  -- Insert alumni records (check for existing email to avoid duplicates)
  INSERT INTO public.alumni (full_name, email, graduation_year, degree, current_company, current_position, location, linkedin_url, industry)
  SELECT * FROM (VALUES
    -- Technology & Engineering
    ('Marcus Johnson', 'marcus.johnson@example.com', 2012, 'Computer Science', 'TechCorp', 'Senior Software Engineer', 'Atlanta, GA', 'https://linkedin.com/in/marcus-johnson-tech', 'Technology'),
    ('Kevin Mitchell', 'kevin.mitchell@example.com', 2015, 'Electrical Engineering', 'Google', 'Product Manager', 'San Francisco, CA', 'https://linkedin.com/in/kevin-mitchell-pm', 'Technology'),
    ('Tyler Brown', 'tyler.brown@example.com', 2017, 'Computer Science', 'Microsoft', 'Cloud Solutions Architect', 'Seattle, WA', 'https://linkedin.com/in/tyler-brown-cloud', 'Technology'),
    ('Jordan Davis', 'jordan.davis@example.com', 2019, 'Information Systems', 'Amazon', 'Data Engineer', 'Austin, TX', 'https://linkedin.com/in/jordan-davis-data', 'Technology'),
    ('Devin Taylor', 'devin.taylor@example.com', 2021, 'Software Engineering', 'Meta', 'Frontend Developer', 'Menlo Park, CA', 'https://linkedin.com/in/devin-taylor-dev', 'Technology'),
    
    -- Finance & Banking
    ('Andre Thompson', 'andre.thompson@example.com', 2016, 'Finance', 'City Bank', 'Investment Analyst', 'New York, NY', 'https://linkedin.com/in/andre-thompson-finance', 'Finance'),
    ('Malik Washington', 'malik.washington@example.com', 2013, 'Business Administration', 'Goldman Sachs', 'Vice President', 'New York, NY', 'https://linkedin.com/in/malik-washington-vp', 'Finance'),
    ('Cameron Lewis', 'cameron.lewis@example.com', 2018, 'Economics', 'JPMorgan Chase', 'Financial Advisor', 'Chicago, IL', 'https://linkedin.com/in/cameron-lewis-advisor', 'Finance'),
    ('Isaiah Martinez', 'isaiah.martinez@example.com', 2020, 'Accounting', 'Deloitte', 'Senior Consultant', 'Dallas, TX', 'https://linkedin.com/in/isaiah-martinez-consultant', 'Finance'),
    
    -- Healthcare & Medicine
    ('Jamal Carter', 'jamal.carter@example.com', 2020, 'Public Health', 'HealthFirst', 'Project Manager', 'Los Angeles, CA', 'https://linkedin.com/in/jamal-carter-health', 'Healthcare'),
    ('Darius Moore', 'darius.moore@example.com', 2014, 'Biology', 'Johns Hopkins Hospital', 'Research Coordinator', 'Baltimore, MD', 'https://linkedin.com/in/darius-moore-research', 'Healthcare'),
    ('Terrence Jackson', 'terrence.jackson@example.com', 2017, 'Health Sciences', 'Mayo Clinic', 'Healthcare Administrator', 'Rochester, MN', 'https://linkedin.com/in/terrence-jackson-admin', 'Healthcare'),
    
    -- Education & Academia
    ('Derrick Williams', 'derrick.williams@example.com', 2014, 'Education', 'State University', 'Assistant Dean of Students', 'Chicago, IL', 'https://linkedin.com/in/derrick-williams-education', 'Higher Education'),
    ('Antonio Harris', 'antonio.harris@example.com', 2011, 'Mathematics', 'Howard University', 'Associate Professor', 'Washington, DC', 'https://linkedin.com/in/antonio-harris-professor', 'Higher Education'),
    ('Reginald Green', 'reginald.green@example.com', 2016, 'History', 'Morehouse College', 'Assistant Professor', 'Atlanta, GA', 'https://linkedin.com/in/reginald-green-history', 'Higher Education'),
    ('Marcus Wright', 'marcus.wright@example.com', 2019, 'Education', 'Atlanta Public Schools', 'High School Principal', 'Atlanta, GA', 'https://linkedin.com/in/marcus-wright-principal', 'Education'),
    
    -- Non-Profit & Community Service
    ('Brandon Scott', 'brandon.scott@example.com', 2018, 'Social Work', 'Community Impact', 'Program Director', 'Houston, TX', 'https://linkedin.com/in/brandon-scott-nonprofit', 'Non‑Profit'),
    ('Kendrick Adams', 'kendrick.adams@example.com', 2015, 'Public Administration', 'United Way', 'Community Outreach Manager', 'Detroit, MI', 'https://linkedin.com/in/kendrick-adams-outreach', 'Non‑Profit'),
    ('Jermaine Foster', 'jermaine.foster@example.com', 2017, 'Social Work', 'Boys & Girls Club', 'Youth Program Coordinator', 'Philadelphia, PA', 'https://linkedin.com/in/jermaine-foster-youth', 'Non‑Profit'),
    
    -- Law & Legal
    ('Tyrone Robinson', 'tyrone.robinson@example.com', 2013, 'Law', 'Robinson & Associates', 'Partner Attorney', 'Washington, DC', 'https://linkedin.com/in/tyrone-robinson-law', 'Legal'),
    ('Darnell Phillips', 'darnell.phillips@example.com', 2016, 'Law', 'Public Defender Office', 'Public Defender', 'Miami, FL', 'https://linkedin.com/in/darnell-phillips-defender', 'Legal'),
    ('Rashad Coleman', 'rashad.coleman@example.com', 2019, 'Law', 'Corporate Legal Group', 'Associate Attorney', 'Boston, MA', 'https://linkedin.com/in/rashad-coleman-corporate', 'Legal'),
    
    -- Business & Consulting
    ('Malcolm Turner', 'malcolm.turner@example.com', 2012, 'Business Administration', 'McKinsey & Company', 'Senior Consultant', 'New York, NY', 'https://linkedin.com/in/malcolm-turner-consulting', 'Consulting'),
    ('Dwayne Patterson', 'dwayne.patterson@example.com', 2015, 'Marketing', 'Procter & Gamble', 'Brand Manager', 'Cincinnati, OH', 'https://linkedin.com/in/dwayne-patterson-marketing', 'Consumer Goods'),
    ('Trevon Banks', 'trevon.banks@example.com', 2018, 'Business', 'Salesforce', 'Account Executive', 'San Francisco, CA', 'https://linkedin.com/in/trevon-banks-sales', 'Technology'),
    
    -- Government & Public Service
    ('Lamar Hayes', 'lamar.hayes@example.com', 2014, 'Political Science', 'City of Atlanta', 'City Council Member', 'Atlanta, GA', 'https://linkedin.com/in/lamar-hayes-council', 'Government'),
    ('Quinton Reed', 'quinton.reed@example.com', 2017, 'Public Policy', 'U.S. Department of Education', 'Policy Analyst', 'Washington, DC', 'https://linkedin.com/in/quinton-reed-policy', 'Government'),
    
    -- Media & Entertainment
    ('Jalen Brooks', 'jalen.brooks@example.com', 2016, 'Communications', 'ESPN', 'Sports Analyst', 'Bristol, CT', 'https://linkedin.com/in/jalen-brooks-media', 'Media'),
    ('Darius King', 'darius.king@example.com', 2019, 'Journalism', 'CNN', 'News Producer', 'Atlanta, GA', 'https://linkedin.com/in/darius-king-journalism', 'Media'),
    
    -- Real Estate & Construction
    ('Marcus Hill', 'marcus.hill@example.com', 2013, 'Business', 'Century 21', 'Real Estate Broker', 'Phoenix, AZ', 'https://linkedin.com/in/marcus-hill-realestate', 'Real Estate'),
    ('Brandon Young', 'brandon.young@example.com', 2017, 'Civil Engineering', 'Turner Construction', 'Project Manager', 'Denver, CO', 'https://linkedin.com/in/brandon-young-construction', 'Construction'),
    
    -- Entrepreneurship
    ('Kendall James', 'kendall.james@example.com', 2018, 'Business', 'TechStart Solutions', 'Founder & CEO', 'Austin, TX', 'https://linkedin.com/in/kendall-james-founder', 'Technology'),
    ('Damon Price', 'damon.price@example.com', 2020, 'Business', 'Urban Eats', 'Co-Founder', 'Nashville, TN', 'https://linkedin.com/in/damon-price-entrepreneur', 'Food & Beverage')
  ) AS v(full_name, email, graduation_year, degree, current_company, current_position, location, linkedin_url, industry)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.alumni a WHERE a.email = v.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT seed_alumni_records();

-- Clean up the function
DROP FUNCTION IF EXISTS seed_alumni_records();

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
FROM auth.users WHERE email = 'member1@example.com'
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
FROM auth.users WHERE email = 'chair@example.com'
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
FROM auth.users WHERE email = 'admin@example.com'
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
FROM auth.users WHERE email = 'alumni@example.com'
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
    JOIN auth.users u ON u.email IN ('admin@example.com', 'eboard@example.com', 'chair@example.com', 'member1@example.com', 'member2@example.com')
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
    JOIN auth.users u ON u.email = 'admin@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Reminder: Interest Meeting is coming up this week. Please review your assigned tasks.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'eboard@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Looking forward to the Service Day event! Who is available to help with setup?'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'chair@example.com'
    WHERE c.name = 'General'
    ON CONFLICT DO NOTHING;

    -- Seed messages in Events & Announcements channel
    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'New event added: Career Panel with alumni from various industries. Please RSVP.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'admin@example.com'
    WHERE c.name = 'Events & Announcements'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.messages (channel_id, user_id, content)
    SELECT c.id, u.id, 'Service Day details have been updated with meeting point and timeline.'
    FROM public.channels c
    JOIN auth.users u ON u.email = 'chair@example.com'
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
WHERE admin.email = 'admin@example.com'
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
WHERE eboard.email = 'eboard@example.com'
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
WHERE chair.email = 'chair@example.com'
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
WHERE admin.email = 'admin@example.com'
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
--   - admin@example.com / DemoAdmin123! (Admin role)
--   - eboard@example.com / DemoEBoard123! (E-Board role)
--   - chair@example.com / DemoChair123! (Committee Chair role)
--   - member1@example.com / DemoMember123! (Member role)
--   - member2@example.com / DemoMember123! (Member role)
--   - alumni@example.com / DemoAlumni123! (Alumni role)
--   - member3@example.com through member18@example.com (if auth users were created)
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

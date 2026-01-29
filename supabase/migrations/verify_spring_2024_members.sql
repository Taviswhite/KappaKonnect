-- Verify Spring 2024 Members
-- This script lists all members who should be in Spring 2024 and checks if they exist

-- Expected Spring 2024 members (from seed script comment):
-- bryce.perkins, ahmod.edwards, brian.singleton, kobe.denmarkgarnett, skylar.peterkin,
-- ahmad.edwards, gregory.allen, joseph.serra, kimahri.testamrk, keith.henderson,
-- joshua.carter, chase.knox, daniel.miller, brice.facey, marshall.williams,
-- brandon.mccaskill, mory.diakite, jordan.newsome

-- Check which Spring 2024 members exist in profiles
SELECT 
  p.full_name,
  p.email,
  p.crossing_year,
  ur.role,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ No Profile'
    WHEN p.crossing_year IS NULL THEN '⚠️ Missing crossing_year'
    WHEN p.crossing_year != 2024 THEN '⚠️ Wrong crossing_year (' || p.crossing_year || ')'
    ELSE '✅ OK'
  END as status
FROM (
  VALUES 
    ('Bryce Perkins', 'bryce@example.com'),
    ('Ahmod Newton', 'ahmod@example.com'),
    ('Brian Singleton II', 'brian@example.com'),
    ('Kobe Denmark-Garnett', 'kobe@example.com'),
    ('Skylar Peterkin', 'skylar@example.com'),
    ('Ahmad Edwards', 'ahmad@example.com'),
    ('Gregory Allen Jr.', 'gregory@example.com'),
    ('Joseph Serra', 'joseph@example.com'),
    ('Kimahri Testamrk', 'kimahri@example.com'),
    ('Keith Henderson Jr.', 'keith@example.com'),
    ('Joshua Carter', 'joshua@example.com'),
    ('Chase Knox', 'chase@example.com'),
    ('Daniel Miller', 'daniel@example.com'),
    ('Brice Facey', 'brice@example.com'),
    ('Marshall Williams', 'marshall@example.com'),
    ('Brandon McCaskill', 'brandon@example.com'),
    ('Mory Diakite', 'mory@example.com'),
    ('Jordan Newsome', 'jordan.newsome@example.com')
) AS expected(name, email)
LEFT JOIN public.profiles p ON p.email = expected.email
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
ORDER BY expected.name;

-- Count actual Spring 2024 members
SELECT 
  COUNT(*) as spring_2024_count,
  COUNT(CASE WHEN ur.role = 'e_board' THEN 1 END) as eboard_count,
  COUNT(CASE WHEN ur.role = 'committee_chairman' THEN 1 END) as chair_count,
  COUNT(CASE WHEN ur.role = 'member' THEN 1 END) as member_count,
  COUNT(CASE WHEN ur.role = 'alumni' THEN 1 END) as alumni_count
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE p.crossing_year = 2024;

-- List all profiles with crossing_year = 2024
SELECT 
  p.full_name,
  p.email,
  ur.role,
  p.graduation_year
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE p.crossing_year = 2024
ORDER BY p.full_name;

-- Verification query to check Spring 2025 members
-- Run this to see which members have crossing_year = 2025

SELECT 
  p.full_name,
  p.email,
  p.crossing_year,
  ur.role,
  CASE 
    WHEN p.crossing_year = 2025 THEN '✅ Spring 2025'
    WHEN p.crossing_year = 2024 THEN 'Spring 2024'
    WHEN p.crossing_year IS NULL THEN '❌ Missing crossing_year'
    ELSE 'Other: ' || p.crossing_year::text
  END as status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.email LIKE '%@example.com'
ORDER BY 
  CASE 
    WHEN p.crossing_year = 2025 THEN 1
    WHEN p.crossing_year = 2024 THEN 2
    ELSE 3
  END,
  p.full_name;

-- Count Spring 2025 members
SELECT 
  COUNT(*) as spring_2025_count,
  'Should be 14' as expected
FROM public.profiles
WHERE crossing_year = 2025;

-- List all Spring 2025 members
SELECT 
  full_name,
  email,
  role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.crossing_year = 2025
ORDER BY p.full_name;

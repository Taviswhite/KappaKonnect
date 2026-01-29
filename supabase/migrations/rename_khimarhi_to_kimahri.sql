-- Rename Khimarhi Testamark to Kimahri Testamrk
-- Updates both profiles and alumni tables

-- Update profiles table
UPDATE public.profiles
SET full_name = 'Kimahri Testamrk'
WHERE full_name = 'Khimarhi Testamark'
   OR full_name ILIKE '%khimarhi%testamark%';

-- Update alumni table
UPDATE public.alumni
SET full_name = 'Kimahri Testamrk'
WHERE full_name = 'Khimarhi Testamark'
   OR full_name ILIKE '%khimarhi%testamark%';

-- Verify the update
SELECT 
  'profiles' as table_name,
  full_name,
  email,
  crossing_year
FROM public.profiles
WHERE full_name ILIKE '%kimahri%' OR full_name ILIKE '%khimarhi%'
UNION ALL
SELECT 
  'alumni' as table_name,
  full_name,
  email,
  NULL as crossing_year
FROM public.alumni
WHERE full_name ILIKE '%kimahri%' OR full_name ILIKE '%khimarhi%'
ORDER BY table_name, full_name;

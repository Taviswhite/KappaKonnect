-- Spring 2014 line: 12 K.O.N.V.I.C.T.S. OF THE XI KOMMISSION
-- Add emails, individual line names, and hometown locations for corresponding alumni.
-- Chapter: Xi (Howard University); Crossing Year: Spring 2014

ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_name text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS location text;

-- Blake Van Putten – T.Y.K.O.O.N. – Los Angeles, CA
UPDATE public.alumni SET
  email = COALESCE(email, 'blake@example.com'),
  line_name = 'T.Y.K.O.O.N.',
  location = COALESCE(location, 'Los Angeles, CA'),
  graduation_year = 0,
  industry = 'Fashion Design/Entrepreneurship'
WHERE (full_name = 'Blake Van Putten' AND line_label = 'SPRING 2014')
   OR email = 'blake@example.com';

-- Desmond Taylor – POLITIKALLY KORRECT – Houston, TX
UPDATE public.alumni SET
  email = COALESCE(email, 'desmond@example.com'),
  line_name = 'POLITIKALLY KORRECT',
  location = COALESCE(location, 'Houston, TX'),
  graduation_year = 0,
  industry = 'Public Administration'
WHERE (full_name = 'Desmond Taylor' AND line_label = 'SPRING 2014')
   OR email = 'desmond@example.com';

-- Malcolm Carter – STONE KOLD – Englewood, NJ
UPDATE public.alumni SET
  email = COALESCE(email, 'malcolm@example.com'),
  line_name = 'STONE KOLD',
  location = COALESCE(location, 'Englewood, NJ'),
  graduation_year = 0,
  industry = 'Acting/Entertainment'
WHERE (full_name = 'Malcolm Carter' AND line_label = 'SPRING 2014')
   OR email = 'malcolm@example.com';

-- William Clayton III – FOUR LOKO – Clayton, NC
UPDATE public.alumni SET
  email = COALESCE(email, 'william@example.com'),
  line_name = 'FOUR LOKO',
  location = COALESCE(location, 'Clayton, NC'),
  graduation_year = 0,
  industry = 'Finance/Investment Banking'
WHERE (full_name = 'William Clayton III' AND line_label = 'SPRING 2014')
   OR email = 'william@example.com';

-- William Harris – MADE IN FULL – Denver, CO
UPDATE public.alumni SET
  email = COALESCE(email, 'william.h@example.com'),
  line_name = 'MADE IN FULL',
  location = COALESCE(location, 'Denver, CO'),
  graduation_year = 0,
  industry = 'Consulting'
WHERE (full_name = 'William Harris' AND line_label = 'SPRING 2014')
   OR email = 'william.h@example.com';

-- Vernon Yancy – CRENSHAW K.I.N.G. – Los Angeles, CA
UPDATE public.alumni SET
  email = COALESCE(email, 'vernon@example.com'),
  line_name = 'CRENSHAW K.I.N.G.',
  location = COALESCE(location, 'Los Angeles, CA'),
  graduation_year = 0,
  industry = 'Grooming/Entrepreneurship'
WHERE (full_name = 'Vernon Yancy' AND line_label = 'SPRING 2014')
   OR email = 'vernon@example.com';

-- Derhone Brown Jr. – BONE KOLLECTOR – Baltimore, MD
UPDATE public.alumni SET
  email = COALESCE(email, 'derhone@example.com'),
  line_name = 'BONE KOLLECTOR',
  location = COALESCE(location, 'Baltimore, MD'),
  graduation_year = 0
WHERE (full_name = 'Derhone Brown Jr.' AND line_label = 'SPRING 2014')
   OR email = 'derhone@example.com';

-- Andrew Melton – KOLLATERAL DAMAGE – Detroit, MI
UPDATE public.alumni SET
  email = COALESCE(email, 'andrew@example.com'),
  line_name = 'KOLLATERAL DAMAGE',
  location = COALESCE(location, 'Detroit, MI'),
  graduation_year = 0,
  industry = 'Media/Journalism'
WHERE (full_name = 'Andrew Melton' AND line_label = 'SPRING 2014')
   OR email = 'andrew@example.com';

-- Dominick Lewis (HK) – PABLO ESKOBAR – Los Angeles, CA
UPDATE public.alumni SET
  email = COALESCE(email, 'dominick@example.com'),
  full_name = 'Dominick Lewis (HK)',
  line_name = 'PABLO ESKOBAR',
  location = COALESCE(location, 'Los Angeles, CA'),
  graduation_year = 0,
  industry = 'Sports Management/Modeling'
WHERE (full_name = 'Dominick Lewis' AND line_label = 'SPRING 2014')
   OR full_name = 'Dominick Lewis (HK)'
   OR email = 'dominick@example.com';

-- Kyle Nichols – BLITZKRIEG – Chicago, IL
UPDATE public.alumni SET
  email = COALESCE(email, 'kyle@example.com'),
  line_name = 'BLITZKRIEG',
  location = COALESCE(location, 'Chicago, IL'),
  graduation_year = 0,
  industry = 'Real Estate'
WHERE (full_name = 'Kyle Nichols' AND line_label = 'SPRING 2014')
   OR email = 'kyle@example.com';

-- Devin Merritt – KAPTAIN AMERIKA – Philadelphia, PA
UPDATE public.alumni SET
  email = COALESCE(email, 'devin@example.com'),
  line_name = 'KAPTAIN AMERIKA',
  location = COALESCE(location, 'Philadelphia, PA'),
  graduation_year = 0,
  industry = 'Music/DJing'
WHERE (full_name = 'Devin Merritt' AND line_label = 'SPRING 2014')
   OR email = 'devin@example.com';

-- Jordan Bailey – STATE PROPERTY – Philadelphia, PA
UPDATE public.alumni SET
  email = COALESCE(email, 'jordan@example.com'),
  line_name = 'STATE PROPERTY',
  location = COALESCE(location, 'Philadelphia, PA'),
  graduation_year = 0,
  industry = 'Music Management/Marketing'
WHERE (full_name = 'Jordan Bailey' AND line_label = 'SPRING 2014')
   OR email = 'jordan@example.com';


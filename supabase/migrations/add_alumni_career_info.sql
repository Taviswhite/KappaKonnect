-- Update alumni with comprehensive career information
-- This migration updates existing alumni records with industry, company, position, and line information
-- Note: This only updates existing records - it does not create new alumni

-- Ensure columns exist
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_label text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS crossing_year integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_order integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS current_company text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS current_position text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS degree text;

-- =============================================================================
-- SPRING 2025 - 14 K.O.N.T.R.A.S of the Xi M.I.L.I.T.I.A
-- =============================================================================
-- Update existing Spring 2025 alumni with career information

UPDATE public.alumni SET
  industry = 'Biology/Neuroscience',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 1,
  graduation_year = 2027
WHERE full_name = 'Jerimiah Ramirez';

UPDATE public.alumni SET
  industry = 'Finance/Investment Banking',
  current_position = 'Intern',
  current_company = 'Barclays and Adams Street Partners',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 2,
  graduation_year = 2027
WHERE full_name = 'Doole Gaiende Edwards';

UPDATE public.alumni SET
  industry = 'Consulting/Finance',
  current_position = 'Intern',
  current_company = 'Boston Consulting Group and Deloitte',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 3,
  graduation_year = 2027
WHERE full_name = 'Grant Hill';

UPDATE public.alumni SET
  industry = 'Operational Finance',
  current_position = 'Operational Financial Analyst',
  current_company = 'Thermo Fisher Scientific',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 4,
  graduation_year = 2027
WHERE full_name = 'Andre Sawyerr';

UPDATE public.alumni SET
  industry = 'Alternative Finance',
  current_company = 'Blackstone',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 5,
  graduation_year = 2027
WHERE full_name = 'Jordan Atkins';

UPDATE public.alumni SET
  industry = 'Finance/Education',
  current_position = 'Intern',
  current_company = 'Friendship Public Charter School',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 6,
  graduation_year = 2027
WHERE full_name = 'Mael Blunt';

UPDATE public.alumni SET
  industry = 'Health/Physical Therapy',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 7,
  graduation_year = 2027
WHERE full_name = 'Malachi MacMillan';

UPDATE public.alumni SET
  industry = 'Risk Advisory/Music',
  current_position = 'Risk & Financial Advisory Intern',
  current_company = 'Deloitte',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 8,
  graduation_year = 2027
WHERE full_name = 'Amir Stevenson';

UPDATE public.alumni SET
  industry = 'Finance/Infrastructure',
  current_position = 'Intern',
  current_company = 'Tiger Infrastructure',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 9,
  graduation_year = 2027
WHERE full_name = 'Reginald Alexander';

UPDATE public.alumni SET
  industry = 'Finance/Private Equity',
  current_position = 'Intern',
  current_company = 'Barclays and Permira',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 10,
  graduation_year = 2027
WHERE full_name = 'Don Jordan Duplan';

UPDATE public.alumni SET
  industry = 'Civil Engineering',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 11,
  graduation_year = 2027
WHERE full_name = 'Dylan Darling';

UPDATE public.alumni SET
  industry = 'Marketing/Green Capital',
  current_position = 'Intern',
  current_company = 'Coalition for Green Capital DC',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 12,
  graduation_year = 2027
WHERE full_name = 'Jared Baker';

UPDATE public.alumni SET
  industry = 'Construction/Project Engineering',
  current_position = 'Intern',
  current_company = 'FH Paschen',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 13,
  graduation_year = 2027
WHERE full_name = 'Carsen Manuel';

UPDATE public.alumni SET
  industry = 'Business Management/Claims Management',
  current_position = 'Intern',
  current_company = 'Gallagher Bassett',
  line_label = 'SPRING 2025',
  crossing_year = 2025,
  chapter = 'Xi (Howard University)',
  line_order = 14,
  graduation_year = 2027
WHERE full_name = 'Kaden Cobb';

-- =============================================================================
-- SPRING 2024 - 18 S.O.L.D.1.E.R.S of the Xi Anarchy
-- =============================================================================

UPDATE public.alumni SET
  industry = 'Private Equity',
  current_position = 'Summer Analyst',
  current_company = 'Apollo Global Management and HPS Investment Partners',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 1,
  graduation_year = 2026
WHERE full_name LIKE 'Bryce Perkins%' OR full_name = 'Bryce Perkins';

UPDATE public.alumni SET
  industry = 'Investment Banking/Portfolio Operations',
  current_position = 'Intern',
  current_company = 'BMO Capital Markets and Centerbridge Partners',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 2,
  graduation_year = 2026
WHERE full_name LIKE 'Ahmod Newton%' OR full_name = 'Ahmod Newton';

UPDATE public.alumni SET
  industry = 'Law/Public Defense',
  current_position = 'Investigative Intern',
  current_company = 'Public Defense',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 3,
  graduation_year = 2026
WHERE full_name LIKE 'Bryan Singleton%' OR full_name = 'Bryan Singleton II';

UPDATE public.alumni SET
  industry = 'Barbering/Criminology',
  current_position = 'Barber',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 4,
  graduation_year = 2026
WHERE full_name LIKE 'Kobe Denmark%' OR full_name LIKE '%Denmark-Garnett%' OR full_name = 'Kobe Denmark-Garnett';

UPDATE public.alumni SET
  industry = 'Investment Management/Real Estate',
  current_position = 'Intern',
  current_company = 'Vanguard',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 5,
  graduation_year = 2026
WHERE full_name LIKE 'Skylar Peterkin%' OR full_name = 'Skylar Peterkin';

UPDATE public.alumni SET
  industry = 'Retail/Tech/Fashion',
  current_company = 'Apple',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 6,
  graduation_year = 2026
WHERE full_name LIKE 'Ahmad Edwards%' OR full_name = 'Ahmad Edwards';

UPDATE public.alumni SET
  industry = 'Tech',
  current_company = 'Microsoft',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 7,
  graduation_year = 2026
WHERE full_name LIKE 'Gregory Allen%' OR full_name = 'Gregory Allen Jr.';

UPDATE public.alumni SET
  industry = 'Marketing/Entertainment',
  current_position = 'Marketing Intern',
  current_company = 'F1 Arcade',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 8,
  graduation_year = 2026
WHERE full_name LIKE 'Joseph Serra%' OR full_name = 'Joseph Serra';

UPDATE public.alumni SET
  industry = 'Banking/Mortgage',
  current_position = 'Analyst Intern',
  current_company = 'KeyBank',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 9,
  graduation_year = 2026
WHERE full_name LIKE 'Khimarhi Testamark%' OR full_name = 'Khimarhi Testamark';

UPDATE public.alumni SET
  industry = 'Athletics',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 10,
  graduation_year = 2026
WHERE full_name LIKE 'Keith Henderson%' OR full_name = 'Keith Henderson Jr.';

UPDATE public.alumni SET
  industry = 'Scientific Research',
  current_position = 'Researcher',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 11,
  graduation_year = 2026
WHERE full_name LIKE 'Joshua Carter%' OR full_name = 'Joshua Carter';

UPDATE public.alumni SET
  industry = 'Architecture/Construction',
  current_position = 'Construction Intern',
  current_company = 'Gilbane Building Company',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 12,
  graduation_year = 2026
WHERE full_name LIKE 'Chase Knox%' OR full_name = 'Chase Knox';

UPDATE public.alumni SET
  industry = 'Civil Engineering/Beauty Entrepreneurship',
  current_company = 'Koko Rose Beauty Inc.',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 13,
  graduation_year = 2026
WHERE full_name LIKE 'Daniel Miller%' OR full_name = 'Daniel Miller';

UPDATE public.alumni SET
  industry = 'Pharmaceuticals/Retail',
  current_company = 'Doc Martens',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 14,
  graduation_year = 2026
WHERE full_name LIKE 'Bryce Facey%' OR full_name = 'Bryce Facey';

UPDATE public.alumni SET
  industry = 'Investment Analysis',
  current_position = 'Investment Analyst',
  current_company = 'The Carlyle Group',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 15,
  graduation_year = 2026
WHERE full_name LIKE 'Marshall Williams%' OR full_name = 'Marshall Williams';

UPDATE public.alumni SET
  industry = 'Consulting/Sales',
  current_position = 'Sales Intern',
  current_company = 'EY and Rocket Mortgage',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 16,
  graduation_year = 2026
WHERE full_name LIKE 'Brandon McCaskill%' OR full_name = 'Brandon McCaskill';

UPDATE public.alumni SET
  industry = 'Architecture/Fashion',
  current_position = 'Intern',
  current_company = 'Gensler',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 17,
  graduation_year = 2026
WHERE full_name LIKE 'Mory Diakite%' OR full_name = 'Mory Diakite';

UPDATE public.alumni SET
  industry = 'Veterinary Medicine',
  current_position = 'Lab Research Assistant',
  line_label = 'SPRING 2024',
  crossing_year = 2024,
  chapter = 'Xi (Howard University)',
  line_order = 18,
  graduation_year = 2026
WHERE full_name LIKE 'Jordan Newsome%' OR full_name = 'Jordan Newsome';

-- =============================================================================
-- FALL 2023 - 3 Raiders of the Xi Syndicate
-- =============================================================================

UPDATE public.alumni SET
  industry = 'Financial Analysis',
  current_position = 'Analyst',
  current_company = 'Goldman Sachs',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 1,
  graduation_year = 2025
WHERE full_name LIKE 'Chandler Searcy%' OR full_name = 'Chandler Searcy';

UPDATE public.alumni SET
  industry = 'Media Production/Journalism',
  current_position = 'Entertainment Producer',
  current_company = 'SiriusXM/The Today Show',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 2,
  graduation_year = 2025
WHERE full_name LIKE 'Michael Taylor%' OR full_name LIKE '%Taylor-White%' OR full_name = 'Michael Taylor-White';

UPDATE public.alumni SET
  industry = 'Biology/Chemistry',
  line_label = 'FALL 2023',
  crossing_year = 2023,
  chapter = 'Xi (Howard University)',
  line_order = 3,
  graduation_year = 2025
WHERE full_name LIKE 'Carl Clay%' OR full_name = 'Carl Clay';

-- =============================================================================
-- SPRING 2022 - 12 Capos of the Xi M.A.F.I.A (already exists, update career info)
-- =============================================================================

UPDATE public.alumni SET
  industry = 'Cybersecurity/IT',
  current_position = 'IT Specialist',
  current_company = 'Coca Cola',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 1
WHERE full_name LIKE 'Derrick Long%' OR full_name = 'Derrick Long';

UPDATE public.alumni SET
  industry = 'Physical Therapy',
  current_company = 'Ivy Rehab Physical Therapy',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 2
WHERE full_name LIKE 'Marcus Curvan%' OR full_name = 'Marcus Curvan';

UPDATE public.alumni SET
  industry = 'Law/Government',
  current_company = 'Temple University School of Law',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 3
WHERE full_name LIKE 'Cameron Kee%' OR full_name = 'Cameron Kee';

UPDATE public.alumni SET
  industry = 'Acting/Psychology',
  current_position = 'Actor',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 4
WHERE (full_name LIKE 'Joshua Bell%' OR full_name LIKE '%Bell-Bey%' OR full_name = 'Joshua Bell-Bey');

UPDATE public.alumni SET
  industry = 'Financial Planning',
  current_position = 'Associate',
  current_company = 'Morgan Stanley',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 5
WHERE full_name LIKE 'Christian Ransome%' OR full_name = 'Christian Ransome';

UPDATE public.alumni SET
  industry = 'Dentistry',
  current_position = 'Student Doctor',
  current_company = 'Howard University College of Dentistry',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 6
WHERE full_name LIKE 'Trevor Squirewell%' OR full_name = 'Trevor Squirewell';

UPDATE public.alumni SET
  industry = 'Consulting/Political Science',
  current_position = 'Senior Consultant',
  current_company = 'A&E Consulting',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 7
WHERE full_name LIKE 'Jonah Lee%' OR full_name = 'Jonah Lee';

UPDATE public.alumni SET
  industry = 'Consulting',
  current_position = 'Consulting Intern',
  current_company = 'PwC',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 8
WHERE full_name LIKE 'Lloyd Maxwell%' OR full_name = 'Lloyd Maxwell';

UPDATE public.alumni SET
  industry = 'Investment Banking',
  current_position = 'Associate',
  current_company = 'Goldman Sachs',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 9
WHERE full_name LIKE 'Chase Tomlin%' OR full_name = 'Chase Tomlin';

UPDATE public.alumni SET
  industry = 'Global Wealth Management',
  current_position = 'Analyst',
  current_company = 'UBS',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 10
WHERE full_name LIKE 'Jaron Dandridge%' OR full_name = 'Jaron Dandridge Jr.';

UPDATE public.alumni SET
  industry = 'Marketing',
  current_position = 'Intern',
  current_company = 'MSG and Horizon Media',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 11
WHERE full_name LIKE 'Michael Singleton%' OR full_name = 'Michael Singleton';

UPDATE public.alumni SET
  industry = 'Supply Chain/Commercial Real Estate',
  current_position = 'Intern',
  current_company = 'Microsoft and CBRE',
  line_label = 'SPRING 2022',
  crossing_year = 2022,
  chapter = 'Xi (Howard University)',
  line_order = 12
WHERE full_name LIKE 'Santana Wolfe%' OR full_name = 'Santana Wolfe';

-- =============================================================================
-- SPRING 2017 - 8 D.I.S.C.I.P.L.E.S. of the Xi Bloodline (already exists, update career info)
-- =============================================================================

UPDATE public.alumni SET
  industry = 'Banking/Analysis',
  current_position = 'Senior Business Analyst',
  current_company = 'Citi Bank',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 1
WHERE full_name LIKE 'Raymond Pottinger%' OR full_name = 'Raymond Pottinger Jr.';

UPDATE public.alumni SET
  industry = 'Real Estate/Engineering',
  current_company = 'Exit Strategy Realty',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 2
WHERE full_name LIKE 'Vincent Roofe%' OR full_name = 'Vincent Roofe III';

UPDATE public.alumni SET
  industry = 'Supply Chain Management',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 3
WHERE full_name LIKE 'Kalen Johnson%' OR full_name = 'Kalen Johnson';

UPDATE public.alumni SET
  industry = 'Athletics',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 4
WHERE full_name LIKE 'Johnny Cooper%' OR full_name = 'Johnny Cooper';

UPDATE public.alumni SET
  industry = 'Marketing',
  current_position = 'Intern',
  current_company = 'Potomac Management',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 5
WHERE full_name LIKE 'Jared McCain%' OR full_name = 'Jared McCain';

UPDATE public.alumni SET
  industry = 'Sports Coaching',
  current_position = 'WR Coach',
  current_company = 'Florida State University',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 6
WHERE full_name LIKE 'Guy Lemonier%' OR full_name = 'Guy Lemonier Jr.';

UPDATE public.alumni SET
  industry = 'Pharmacy/Dentistry',
  current_position = 'Licensed Pharmacy Technician',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 7
WHERE full_name LIKE 'Laguna Foster%' OR full_name = 'Laguna Foster Jr.';

UPDATE public.alumni SET
  industry = 'Dentistry',
  current_company = 'Art of Aesthetics Dental Practice',
  line_label = 'SPRING 2017',
  crossing_year = 2017,
  chapter = 'Xi (Howard University)',
  line_order = 8
WHERE full_name LIKE 'Quodarrious Toney%' OR full_name = 'Quodarrious Toney';

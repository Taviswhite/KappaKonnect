-- Spring 2016 line: 12 W.A.R.R.I.O.R.S. OF THE XI DYNASTY
-- Fix line_order 1, 2, 4–12 (skip 3) and add emails, line names, locations.
-- Match by email OR (full_name + line_label) so re-runs apply correctly.

ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_name text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS location text;

-- 1) Set line_order 4-12 for Walter through Solomon (position 3 skipped; run spring_2016_skip_3_renumber.sql)
UPDATE public.alumni SET line_order = 12, email = COALESCE(email, 'solomon@example.com'), line_name = 'KING KUNTA', location = COALESCE(location, 'Stone Mountain, GA'), graduation_year = 2019, industry = 'Private Equity'
WHERE (full_name = 'R. Solomon Mangham' AND line_label = 'SPRING 2016') OR email = 'solomon@example.com';

UPDATE public.alumni SET line_order = 11, email = COALESCE(email, 'johnathan@example.com'), line_name = 'I.L.L.M.A.T.I.K.', location = COALESCE(location, 'Queens, NY'), graduation_year = 2019, industry = 'Education'
WHERE (full_name = 'Johnathan Joseph' AND line_label = 'SPRING 2016') OR email = 'johnathan@example.com';

UPDATE public.alumni SET line_order = 10, email = COALESCE(email, 'matthew@example.com'), line_name = 'DEAD PRESIDENTS', location = COALESCE(location, 'Baltimore, MD'), graduation_year = 2019, industry = 'Music Industry'
WHERE (full_name = 'Matthew Walker' AND line_label = 'SPRING 2016') OR email = 'matthew@example.com';

UPDATE public.alumni SET line_order = 9, email = COALESCE(email, 'amir@example.com'), full_name = 'Amir Edgerton (HK)', line_name = 'STEPH KURRY', location = COALESCE(location, 'Washington, DC'), graduation_year = 2019, industry = 'Athletics'
WHERE (full_name = 'Amir Edgerton' AND line_label = 'SPRING 2016') OR full_name = 'Amir Edgerton (HK)' OR email = 'amir@example.com';

UPDATE public.alumni SET line_order = 8, email = COALESCE(email, 'brandon@example.com'), line_name = 'KOMMODORE', location = COALESCE(location, 'Orlando, FL'), graduation_year = 2019, industry = 'Music Industry/International Business'
WHERE (full_name = 'Brandon McClary' AND line_label = 'SPRING 2016') OR email = 'brandon@example.com';

UPDATE public.alumni SET line_order = 7, email = COALESCE(email, 'allen@example.com'), line_name = 'KROWN ROYAL', location = COALESCE(location, 'Baltimore, MD'), graduation_year = 2019, industry = 'Pharmaceutical Sales'
WHERE (full_name = 'Allen Royal III' AND line_label = 'SPRING 2016') OR email = 'allen@example.com';

UPDATE public.alumni SET line_order = 6, email = COALESCE(email, 'skyler@example.com'), line_name = 'CHI-ROK', location = COALESCE(location, 'Chicago, IL'), graduation_year = 2019, industry = 'Real Estate/Restaurateur'
WHERE (full_name = 'Skyler Lemons' AND line_label = 'SPRING 2016') OR email = 'skyler@example.com';

UPDATE public.alumni SET line_order = 5, email = COALESCE(email, 'cody@example.com'), full_name = 'Cody Williams', line_name = 'HEISMAN', location = COALESCE(location, 'Cleveland, OH'), graduation_year = 2019, industry = 'Architecture/Athletics'
WHERE (full_name = 'Cody Williams jr' AND line_label = 'SPRING 2016') OR full_name = 'Cody Williams' OR email = 'cody@example.com';

UPDATE public.alumni SET line_order = 4, email = COALESCE(email, 'walter@example.com'), line_name = 'S.N.I.P.E.R.', location = COALESCE(location, 'San Francisco, CA (by way of Washington D.C.)'), graduation_year = 2019, industry = 'Computer Science/Financial Services'
WHERE (full_name = 'Walter Peacock III' AND line_label = 'SPRING 2016') OR email = 'walter@example.com';

-- 2) Arin and Shaquille keep line_order 1 and 2; set email, line_name, location
UPDATE public.alumni SET email = COALESCE(email, 'arin@example.com'), line_name = 'SHOWTIME', location = COALESCE(location, 'Houston, TX'), graduation_year = 2019, industry = 'Wealth Management/Financial Services'
WHERE (full_name = 'Arin Holliman' AND line_label = 'SPRING 2016') OR email = 'arin@example.com';

UPDATE public.alumni SET email = COALESCE(email, 'shaquille@example.com'), line_name = 'BASKUIAT', location = COALESCE(location, 'Queens, NY'), graduation_year = 2019, industry = 'Aviation/Fashion/Engineering'
WHERE (full_name = 'Shaquille Frederick' AND line_label = 'SPRING 2016') OR email = 'shaquille@example.com';

-- (DNE placeholder removed: do not insert "Does Not Exist". Run remove_dne_placeholders.sql to delete any existing DNE rows; Spring 2016 numbering 1,2,4..12 via spring_2016_skip_3_renumber.sql.)

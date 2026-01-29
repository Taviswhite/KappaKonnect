-- Ensure Fall 2023 through Spring 2016 (and older) alumni show in the alumni portal
-- 1. Ensure columns exist and backfill line_label for 2023, 2022, 2017
-- 2. Insert missing historic lines (Spring 2016 down to Spring 1985) if not present
-- 3. Spring 2014 career/location/industry updates are in this file; for 2025/2024/2023/2022/2017 run add_alumni_career_info.sql

-- Ensure line_label, crossing, and career columns exist
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_label text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS crossing_year integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_order integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS current_company text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS current_position text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS degree text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_name text;

-- Backfill line_label for any alumni that have crossing_year but missing line_label
-- (so they show under correct section: FALL 2023, SPRING 2022, SPRING 2017, SPRING 2014)
UPDATE public.alumni SET line_label = 'FALL 2023'
  WHERE crossing_year = 2023 AND (line_label IS NULL OR line_label = '');
UPDATE public.alumni SET line_label = 'SPRING 2022'
  WHERE crossing_year = 2022 AND (line_label IS NULL OR line_label = '');
UPDATE public.alumni SET line_label = 'SPRING 2017'
  WHERE crossing_year = 2017 AND (line_label IS NULL OR line_label = '');
UPDATE public.alumni SET line_label = 'SPRING 2014'
  WHERE crossing_year = 2014 AND (line_label IS NULL OR line_label = '');

-- Normalize existing line_label to short form for filter (e.g. "SPRING 2012 - 13 UNKATCHABLE..." -> "SPRING 2012")
UPDATE public.alumni
SET line_label = UPPER(REGEXP_REPLACE(REGEXP_REPLACE(line_label, ' - .*$', ''), '^Spring ', 'SPRING '))
WHERE line_label ~ ' - ' OR line_label ~ '^Spring '
  AND line_label IS NOT NULL AND line_label != '';

-- Insert Spring 2016 through Spring 1985 if not present (same data as seed_all_alumni_lines)
-- SPRING 2016
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Arin Holliman', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 1),
  ('Shaquille Frederick', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 2),
  ('Walter Peacock III', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 3),
  ('Cody Williams jr', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 4),
  ('Skyler Lemons', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 5),
  ('Allen Royal III', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 6),
  ('Brandon McClary', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 7),
  ('Amir Edgerton', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 8),
  ('Matthew Walker', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 9),
  ('Johnathan Joseph', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 10),
  ('R. Solomon Mangham', 2019, 'SPRING 2016', 2016, 'Xi (Howard University)', 11)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2014
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Blake Van Putten', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 1),
  ('Desmond Taylor', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 2),
  ('Malcolm Carter', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 3),
  ('William Clayton III', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 4),
  ('William Harris', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 5),
  ('Vernon Yancy', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 6),
  ('Derhone Brown Jr.', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 7),
  ('Andrew Melton', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 8),
  ('Dominick Lewis', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 9),
  ('Kyle Nichols', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 10),
  ('Devin Merritt', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 11),
  ('Jordan Bailey', 2017, 'SPRING 2014', 2014, 'Xi (Howard University)', 12)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2013
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Kristopher Kirkpatrick', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 1),
  ('Charles Whitlock II', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 2),
  ('Andrew Addison', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 3),
  ('Zachary Spence', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 4),
  ('Brandon Gist', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 5),
  ('Vincent Watts', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 6),
  ('Joseph Greenlee', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 7),
  ('Adrian Thomas', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 8),
  ('James Cox II', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 9),
  ('Dorian Kirkwood', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 10),
  ('Joshua Wiggins', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 11),
  ('Jordan Butler', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 12),
  ('Innocent Akujuobi II', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 13),
  ('Austin Wilson', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 14),
  ('Brandon Baler Damon', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 15),
  ('Delano Hankins Jr', 2016, 'SPRING 2013', 2013, 'Xi (Howard University)', 16)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2012 (short line_label for filter)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Castell Abner III', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 1),
  ('Justin "Jam" Miles', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 2),
  ('Joshua Crockett', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 3),
  ('Daillen Hughes', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 4),
  ('Christopher Steele', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 5),
  ('Evan Stephens', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 6),
  ('Kameron Leach', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 7),
  ('Garnett Veney', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 8),
  ('Brandon Harris', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 9),
  ('Joshua Kato', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 10),
  ('Jordan Taylor', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 11),
  ('Carnegie Tirado', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 12),
  ('Bryan Rodgers', 2015, 'SPRING 2012', 2012, 'Xi (Howard University)', 13)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2010
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Lenon "Ricky" Thompson', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 1),
  ('Joseph "Joey" Laster III', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 2),
  ('DeAngelo Shears', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 3),
  ('David Clary', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 4),
  ('Julian K. Lewis', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 5),
  ('pPhifer Turner', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 6),
  ('Nickolas Sneed', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 7),
  ('Sid Banks', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 8),
  ('John Perez', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 9),
  ('Jamal Minor', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 10),
  ('Shelton "Jae" Murphy', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 11),
  ('Alexander Lewis', 2013, 'SPRING 2010', 2010, 'Xi (Howard University)', 12)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2009
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Donald Tyson', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 1),
  ('Deric Canty', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 2),
  ('Calvin Simmons Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 3),
  ('Robert Spears', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 4),
  ('Jason Cole', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 5),
  ('Maurice Cheeks', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 6),
  ('Jeremy Williams', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 7),
  ('Victor Medina', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 8),
  ('Rodney Hawkins Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 9),
  ('Alvin Staley Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 10),
  ('Jarred McKee', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 11),
  ('Brandon Montgomery', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 12),
  ('Darrelle Washington', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 13),
  ('Khalil Bus-Kwofe', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 14),
  ('Kyle Smith', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 15)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2007
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Emmanuel Onyeyerim', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 1),
  ('Arinze Emeagwali', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 2),
  ('Joseph Dagg Jr.', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 3),
  ('Presley Nelson Jr.', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 4),
  ('Jason Rodriguez', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 5),
  ('Justin Faust', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 6),
  ('Brandon Starling', 2010, 'SPRING 2007', 2007, 'Xi (Howard University)', 7)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2001
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Keith Stone', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 1),
  ('Will Naper', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 2),
  ('Pawlos Germay', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 3),
  ('Demar Rodgers', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 4),
  ('Victor McCraney', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 5),
  ('Mark Smith', 2004, 'SPRING 2001', 2001, 'Xi (Howard University)', 6)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1998
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Corgins Banner', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 1),
  ('Thomas Houston III', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 2),
  ('Lakeem Dwight', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 3),
  ('Darius Bickham', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 4),
  ('Mario Wimberly', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 5),
  ('Lee Smith III', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 6),
  ('Byron Whyte', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 7),
  ('Lir Burke III', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 8),
  ('Gary Monroe', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 9),
  ('Bakari Adams', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 10),
  ('Abdullah Zaki II', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 11),
  ('Mike Smith', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 12),
  ('Leonard Stevens Jr', 2001, 'SPRING 1998', 1998, 'Xi (Howard University)', 13)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1993 (skip position 5; Tyrone = 6, then 7–9)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('James Mcdowell', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 1),
  ('Brian Coleman', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 2),
  ('Gregory Billings', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 3),
  ('William Arnold Bryant', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 4),
  ('Tyrone Mitchell', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 6),
  ('Jesse Walton Jr.', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 7),
  ('Jesse Fenty', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 8),
  ('Sean Turley', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 9)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1992 (skip position 3; Amia Foston 18, Marshall 19, Byron Foston 20)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Lance Miller', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 1),
  ('Robert Jenkins Jr.', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 2),
  ('William Ticer', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 4),
  ('Gregory Davila', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 5),
  ('James Stovall', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 6),
  ('Nnamdi Lowrie', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 7),
  ('Broderick Harrell', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 8),
  ('Mark Davis', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 9),
  ('Rameon Witt', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 10),
  ('Ma''ani Martin', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 11),
  ('Antonio Coe', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 12),
  ('Marlon Everett', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 13),
  ('Roderick Turner', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 14),
  ('Mason Harris', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 15),
  ('William Rankins', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 16),
  ('Terrance C Jones', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 17),
  ('Amia Foston', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 18),
  ('Marshall Mitchell', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 19),
  ('Byron Foston', 1995, 'SPRING 1992', 1992, 'Xi (Howard University)', 20)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1986
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Lance Wyatt', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 1),
  ('Ronald Chandler', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 2),
  ('Glenn Abraham', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 3),
  ('Michael Stewart', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 4),
  ('Gregory Nicholson', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 5),
  ('Craig Collins', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 6),
  ('Anthony Murray', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 7),
  ('Michael Taylor', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 8),
  ('Douglass Dickerson', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 9),
  ('Johnathan Blake', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 10),
  ('Gerard Gibbons', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 11),
  ('Joseph Gibson', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 12),
  ('George Gardner', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 13),
  ('Dwight Ward', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 14),
  ('Keith Lathan', 1989, 'SPRING 1986', 1986, 'Xi (Howard University)', 15)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1985 (13: Obscene 13; Max Maurice 10, Phillip 11, Kenny 12, Paul 13)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Michael McFadden', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 1),
  ('Edward Lewis', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 2),
  ('Hakim Abdul Hadi', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 3),
  ('Kenny James', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 4),
  ('Greg Banks', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 5),
  ('Carrol Hughes', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 6),
  ('Robert Spencer', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 7),
  ('Teddy LeRose', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 8),
  ('Gerald Reid', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 9),
  ('Max Maurice', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 10),
  ('Phillip Lee', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 11),
  ('Kenny Tucker', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 12),
  ('Paul Chastang', 1988, 'SPRING 1985', 1985, 'Xi (Howard University)', 13)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- =============================================================================
-- Apply career/location/industry for Spring 2014 (so careers show in portal)
-- =============================================================================
UPDATE public.alumni SET
  email = COALESCE(email, 'blake@example.com'),
  line_name = COALESCE(line_name, 'T.Y.K.O.O.N.'),
  location = COALESCE(location, 'Los Angeles, CA'),
  industry = COALESCE(industry, 'Fashion Design/Entrepreneurship')
WHERE (full_name = 'Blake Van Putten' AND line_label = 'SPRING 2014') OR email = 'blake@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'desmond@example.com'),
  line_name = COALESCE(line_name, 'POLITIKALLY KORRECT'),
  location = COALESCE(location, 'Houston, TX'),
  industry = COALESCE(industry, 'Public Administration')
WHERE (full_name = 'Desmond Taylor' AND line_label = 'SPRING 2014') OR email = 'desmond@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'malcolm@example.com'),
  line_name = COALESCE(line_name, 'STONE KOLD'),
  location = COALESCE(location, 'Englewood, NJ'),
  industry = COALESCE(industry, 'Acting/Entertainment')
WHERE (full_name = 'Malcolm Carter' AND line_label = 'SPRING 2014') OR email = 'malcolm@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'william@example.com'),
  line_name = COALESCE(line_name, 'FOUR LOKO'),
  location = COALESCE(location, 'Clayton, NC'),
  industry = COALESCE(industry, 'Finance/Investment Banking')
WHERE (full_name = 'William Clayton III' AND line_label = 'SPRING 2014') OR email = 'william@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'william.h@example.com'),
  line_name = COALESCE(line_name, 'MADE IN FULL'),
  location = COALESCE(location, 'Denver, CO'),
  industry = COALESCE(industry, 'Consulting')
WHERE (full_name = 'William Harris' AND line_label = 'SPRING 2014') OR email = 'william.h@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'vernon@example.com'),
  line_name = COALESCE(line_name, 'CRENSHAW K.I.N.G.'),
  location = COALESCE(location, 'Los Angeles, CA'),
  industry = COALESCE(industry, 'Grooming/Entrepreneurship')
WHERE (full_name = 'Vernon Yancy' AND line_label = 'SPRING 2014') OR email = 'vernon@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'derhone@example.com'),
  line_name = COALESCE(line_name, 'BONE KOLLECTOR'),
  location = COALESCE(location, 'Baltimore, MD')
WHERE (full_name = 'Derhone Brown Jr.' AND line_label = 'SPRING 2014') OR email = 'derhone@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'andrew@example.com'),
  line_name = COALESCE(line_name, 'KOLLATERAL DAMAGE'),
  location = COALESCE(location, 'Detroit, MI'),
  industry = COALESCE(industry, 'Media/Journalism')
WHERE (full_name = 'Andrew Melton' AND line_label = 'SPRING 2014') OR email = 'andrew@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'dominick@example.com'),
  line_name = COALESCE(line_name, 'PABLO ESKOBAR'),
  location = COALESCE(location, 'Los Angeles, CA'),
  industry = COALESCE(industry, 'Sports Management/Modeling')
WHERE (full_name = 'Dominick Lewis' AND line_label = 'SPRING 2014') OR full_name = 'Dominick Lewis (HK)' OR email = 'dominick@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'kyle@example.com'),
  line_name = COALESCE(line_name, 'BLITZKRIEG'),
  location = COALESCE(location, 'Chicago, IL'),
  industry = COALESCE(industry, 'Real Estate')
WHERE (full_name = 'Kyle Nichols' AND line_label = 'SPRING 2014') OR email = 'kyle@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'devin@example.com'),
  line_name = COALESCE(line_name, 'KAPTAIN AMERIKA'),
  location = COALESCE(location, 'Philadelphia, PA'),
  industry = COALESCE(industry, 'Music/DJing')
WHERE (full_name = 'Devin Merritt' AND line_label = 'SPRING 2014') OR email = 'devin@example.com';

UPDATE public.alumni SET
  email = COALESCE(email, 'jordan.b@example.com'),
  line_name = COALESCE(line_name, 'STATE PROPERTY'),
  location = COALESCE(location, 'Philadelphia, PA'),
  industry = COALESCE(industry, 'Music Management/Marketing')
WHERE (full_name = 'Jordan Bailey' AND line_label = 'SPRING 2014') OR email = 'jordan.b@example.com';

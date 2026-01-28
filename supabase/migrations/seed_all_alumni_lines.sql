-- Backfill line_label for existing alumni (Fall 2023, Spring 2022, Spring 2017)
-- Then insert all historic lines from Spring 2016 down to Spring 1985.
-- alumni columns: full_name, graduation_year, line_label, crossing_year, chapter, line_order (and optional email, etc.)

-- Ensure line_label and crossing columns exist (in case add_crossing_to_alumni was not run)
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_label text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS crossing_year integer;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS chapter text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS line_order integer;

-- Set line_label for existing alumni (short form for filter: season + year only)
UPDATE public.alumni SET line_label = 'FALL 2023'
  WHERE crossing_year = 2023 AND line_order IN (1,2,3);
UPDATE public.alumni SET line_label = 'SPRING 2022'
  WHERE crossing_year = 2022 AND chapter IS NOT NULL;
UPDATE public.alumni SET line_label = 'SPRING 2017'
  WHERE crossing_year = 2017 AND chapter IS NOT NULL;

-- Helper: insert a line (avoids repeating column list). We use INSERT ... SELECT from VALUES.
-- Format: (full_name, graduation_year, line_label, crossing_year, chapter, line_order)

-- SPRING 2016 - 12 W.A.R.R.I.O.R.S. OF THE XI DYNASTY
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

-- SPRING 2014 - 12 K.O.N.V.I.C.T.S. OF THE XI KOMMISSION
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

-- SPRING 2013 - 16 O.U.T.L.A.W.S. OF THE XI REBELLION
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

-- SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Castell Abner III', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 1),
  ('Justin "Jam" Miles', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 2),
  ('Joshua Crockett', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 3),
  ('Daillen Hughes', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 4),
  ('Christopher Steele', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 5),
  ('Evan Stephens', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 6),
  ('Kameron Leach', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 7),
  ('Garnett Veney', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 8),
  ('Brandon Harris', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 9),
  ('Joshua Kato', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 10),
  ('Jordan Taylor', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 11),
  ('Carnegie Tirado', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 12),
  ('Bryan Rodgers', 2015, 'SPRING 2012 - 13 UNKATCHABLE B.A.N.D.I.T.S.', 2012, 'Xi (Howard University)', 13)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2010 - 12 KULPRITS OF K.H.A.O.S.
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

-- SPRING 2009 - 16 Sons of the Diamond H.E.I.S.T.
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Donald Tyson', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 1),
  ('Deric Canty', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 2),
  ('Calvin Simmons Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 3),
  ('Alix Martin', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 4),
  ('Robert Spears', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 5),
  ('Jason Cole', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 6),
  ('Maurice Cheeks', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 7),
  ('Jeremy Williams', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 8),
  ('Victor Medina', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 9),
  ('Rodney Hawkins Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 10),
  ('Alvin Staley Jr.', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 11),
  ('Jarred McKee', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 12),
  ('Brandon Montgomery', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 13),
  ('Darrelle Washington', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 14),
  ('Khalil Bus-Kwofe', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 15),
  ('Kyle Smith', 2012, 'SPRING 2009', 2009, 'Xi (Howard University)', 16)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2007 - 7 REBELS FOR THE XI KAUSE
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Emmanuel Onyeyerim', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 1),
  ('Arinze Emeagwali', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 2),
  ('Joseph Dagg Jr.', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 3),
  ('Presly Nelson Jr.', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 4),
  ('Jason Rodriguez', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 5),
  ('Justin Faust', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 6),
  ('Brandon Starling', 2010, 'SPRING 2007 - 7 REBELS FOR THE XI KAUSE', 2007, 'Xi (Howard University)', 7)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 2001 - 6 H.I.T.M.E.N. OF THE XI K.A.R.T.E.L. (R.I.P removed)
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

-- SPRING 1998 - 13 DIAMOND K.R.O.O.K.S. (DNE removed)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Corgins Banner', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 1),
  ('Thomas Houston III', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 2),
  ('Lakeem Dwight', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 3),
  ('Darius Bickham', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 4),
  ('Mario Wimberly', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 5),
  ('Lee Smith III', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 6),
  ('Byron Whyte', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 7),
  ('Lir Burke III', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 8),
  ('Gary Monroe', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 9),
  ('Bakari Adams', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 10),
  ('Abdullah Zaki II', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 11),
  ('Mike Smith', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 12),
  ('Leonard Stevens Jr', 2001, 'SPRING 1998 - 14 DIAMOND K.R.O.O.K.S.', 1998, 'Xi (Howard University)', 13)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1993 - T.E.K.H. 8 (R.I.P removed)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('James Mcdowell', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 1),
  ('Brian Coleman', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 2),
  ('Gregory Billings', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 3),
  ('William Arnold Bryant', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 4),
  ('Tyrone Mitchell', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 5),
  ('Jesse Walton Jr.', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 6),
  ('Jesse Fenty', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 7),
  ('Sean Turley', 1996, 'SPRING 1993', 1993, 'Xi (Howard University)', 8)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- SPRING 1992 - The 19 Konvicted F.E.L.O.N.S. (DNE removed)
INSERT INTO public.alumni (full_name, graduation_year, line_label, crossing_year, chapter, line_order)
SELECT * FROM (VALUES
  ('Lance Miller', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 1),
  ('Robert Jenkins Jr.', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 2),
  ('William Ticer', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 3),
  ('Gregory Davila', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 4),
  ('James Stovall', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 5),
  ('Nnamdi Lowrie', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 6),
  ('Broderick Harrell', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 7),
  ('Mark Davis', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 8),
  ('Rameon Witt', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 9),
  ('Ma''ani Martin', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 10),
  ('Antonio Coe', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 11),
  ('Marlon Everett', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 12),
  ('Roderick Turner', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 13),
  ('Mason Harris', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 14),
  ('William Rankins', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 15),
  ('Terrance C Jones', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 16),
  ('Amia Foston', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 17),
  ('Marshall Mitchell', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 18),
  ('Bryan Foston', 1995, 'SPRING 1992 - The 20 Konvicted F.E.L.O.N.S.', 1992, 'Xi (Howard University)', 19)
) AS v(full_name, graduation_year, line_label, crossing_year, chapter, line_order)
WHERE NOT EXISTS (SELECT 1 FROM public.alumni a WHERE a.line_label = v.line_label AND a.line_order = v.line_order AND a.full_name = v.full_name);

-- Spring 1986 - The Notorious 15 M.T.M.F
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

-- Spring 1985 - Obscene 13
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

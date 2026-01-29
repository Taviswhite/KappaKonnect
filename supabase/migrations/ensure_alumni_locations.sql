-- Set alumni location (hometown) from provided sources only.
-- Uses COALESCE so we never overwrite existing good data.
-- Match by email, or by (line_label/crossing_year + full_name) so rows are found even if line_label format differs.

ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS location text;

-- Spring 2025 & 2024: FORCE correct location (overwrite seed "Atlanta, GA" from seed_demo_data etc.)
-- Spring 2025
UPDATE public.alumni SET location = 'Silver Spring, Maryland' WHERE email = 'jeremiah@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name = 'Jerimiah Ramirez' OR full_name ILIKE 'Jerimiah Ramirez%' OR full_name ILIKE 'Jeremiah Ramirez%'));
UPDATE public.alumni SET location = 'Berkeley, California' WHERE email = 'doole@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Doole Gaiende Edwards%' OR full_name = 'Doole Gaiende Edwards'));
UPDATE public.alumni SET location = 'Atlanta, Georgia' WHERE email = 'grant@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name = 'Grant Hill' OR full_name ILIKE 'Grant Hill%'));
UPDATE public.alumni SET location = 'Anne Arundel County, Maryland' WHERE email = 'andre@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Andre Sawyerr%' OR full_name = 'Andre Sawyerr'));
UPDATE public.alumni SET location = 'South Orange, New Jersey' WHERE email = 'jordan@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name = 'Jordan Atkins' OR full_name ILIKE 'Jordan Atkins%'));
UPDATE public.alumni SET location = 'Oakland, California' WHERE email = 'mael@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Mael Blunt%' OR full_name = 'Mael Blunt'));
UPDATE public.alumni SET location = 'Queens, New York' WHERE email = 'malachi@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Malachi MacMillan%' OR full_name = 'Malachi MacMillan'));
UPDATE public.alumni SET location = 'Atlanta, Georgia' WHERE email = 'amir@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Amir Stevenson%' OR full_name = 'Amir Stevenson'));
UPDATE public.alumni SET location = 'Waldorf, Maryland' WHERE email = 'reginald@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Reginald Alexander%' OR full_name = 'Reginald Alexander'));
UPDATE public.alumni SET location = 'Rockland County, New York' WHERE email = 'don@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Don Jordan Duplan%' OR full_name = 'Don Jordan Duplan'));
UPDATE public.alumni SET location = 'Petersburg, Virginia' WHERE email = 'dylan@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Dylan Darling%' OR full_name = 'Dylan Darling'));
UPDATE public.alumni SET location = 'Miami, Florida' WHERE email = 'jared@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Jared Baker%' OR full_name = 'Jared Baker'));
UPDATE public.alumni SET location = 'Baton Rouge, Louisiana' WHERE email = 'carsen@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Carsen Manuel%' OR full_name = 'Carsen Manuel'));
UPDATE public.alumni SET location = 'Naperville, Illinois' WHERE email = 'kaden@example.com' OR ((TRIM(line_label) ILIKE 'spring%2025' OR crossing_year = 2025) AND (full_name ILIKE 'Kaden Cobb%' OR full_name = 'Kaden Cobb'));

-- Spring 2024
UPDATE public.alumni SET location = 'Chicago, Illinois' WHERE email = 'bryce@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Bryce Perkins%' OR full_name = 'Bryce Perkins'));
UPDATE public.alumni SET location = 'Philadelphia, Pennsylvania' WHERE email = 'ahmod@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Ahmod Newton%' OR full_name = 'Ahmod Newton'));
UPDATE public.alumni SET location = 'Detroit, Michigan' WHERE email = 'bryan@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Bryan Singleton%' OR full_name = 'Bryan Singleton II'));
UPDATE public.alumni SET location = 'Jacksonville, Florida' WHERE email = 'kobe@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Kobe Denmark%' OR full_name ILIKE '%Denmark-Garnett%'));
UPDATE public.alumni SET location = 'Cleveland, Ohio' WHERE email = 'ahmad@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Ahmad Edwards%' OR full_name = 'Ahmad Edwards'));
UPDATE public.alumni SET location = 'Bay Area, California' WHERE email = 'gregory@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Gregory Allen%' OR full_name = 'Gregory Allen Jr.'));
UPDATE public.alumni SET location = 'Ohio' WHERE email = 'joseph@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Joseph Serra%' OR full_name = 'Joseph Serra'));
UPDATE public.alumni SET location = 'Boston, Massachusetts' WHERE email = 'khimarhi@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Kimahri Testamrk%' OR full_name = 'Kimahri Testamrk'));
UPDATE public.alumni SET location = 'Raleigh, North Carolina' WHERE email = 'joshua@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Joshua Carter%' OR full_name = 'Joshua Carter'));
UPDATE public.alumni SET location = 'Chicago, Illinois' WHERE email = 'daniel@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Daniel Miller%' OR full_name = 'Daniel Miller'));
UPDATE public.alumni SET location = 'Richmond, Texas' WHERE email = 'brice@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Bryce Facey%' OR full_name = 'Bryce Facey'));
UPDATE public.alumni SET location = 'Cleveland, Ohio' WHERE email = 'marshall@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Marshall Williams%' OR full_name = 'Marshall Williams'));
UPDATE public.alumni SET location = 'Detroit, Michigan' WHERE email = 'brandon@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Brandon McCaskill%' OR full_name = 'Brandon McCaskill'));
UPDATE public.alumni SET location = 'Bronx, New York' WHERE email = 'mory@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Mory Diakite%' OR full_name = 'Mory Diakite'));
UPDATE public.alumni SET location = 'Brooklyn, New York' WHERE email = 'jordan.newsome@example.com' OR ((TRIM(line_label) ILIKE 'spring%2024' OR crossing_year = 2024) AND (full_name ILIKE 'Jordan Newsome%' OR full_name = 'Jordan Newsome'));
-- (Skylar Peterkin, Chase Knox, Keith Henderson — no origin in sources; leave blank)

-- =============================================================================
-- FALL 2023: 3 Raiders of the Xi Syndicate [sources]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Atlanta, GA') WHERE (full_name ILIKE 'Chandler Searcy%' OR full_name = 'Chandler Searcy') AND line_label = 'FALL 2023';
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Atlanta, GA') WHERE (full_name ILIKE 'Michael Taylor%' OR full_name ILIKE '%Taylor-White%' OR full_name = 'Michael Taylor-White') AND line_label = 'FALL 2023';
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Huntsville, AL') WHERE (full_name ILIKE 'Carl Clay%' OR full_name = 'Carl Clay') AND line_label = 'FALL 2023';

-- =============================================================================
-- SPRING 2022: 12 Capos of the Xi M.A.F.I.A [sources]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Montgomery, AL') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Derrick Long%' OR full_name = 'Derrick Long');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Philadelphia, PA') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Marcus Curvan%' OR full_name = 'Marcus Curvan');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Lawnside, NJ') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Cameron Kee%' OR full_name = 'Cameron Kee');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Joshua Bell%' OR full_name ILIKE '%Bell-Bey%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Philadelphia, PA') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Christian Ransome%' OR full_name = 'Christian Ransome');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Columbia, SC') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Trevor Squirewell%' OR full_name = 'Trevor Squirewell');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Pasadena, CA') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Jonah Lee%' OR full_name = 'Jonah Lee');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Lloyd Maxwell%' OR full_name = 'Lloyd Maxwell');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Detroit, MI') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Chase Tomlin%' OR full_name = 'Chase Tomlin');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Richmond, VA') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Jaron Dandridge%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Detroit, MI') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Michael Singleton%' OR full_name = 'Michael Singleton');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Teaneck, NJ') WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Santana Wolfe%' OR full_name = 'Santana Wolfe');

-- =============================================================================
-- SPRING 2017: 8 D.I.S.C.I.P.L.E.S. of the Xi Bloodline [sources]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Wilmington, DE') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Raymond Pottinger%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Vincent Roofe%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Houston, TX') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Kalen Johnson%' OR full_name = 'Kalen Johnson');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Rockford, IL') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Johnny Cooper%' OR full_name = 'Johnny Cooper');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Woodbridge, VA') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Jared McCain%' OR full_name = 'Jared McCain');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Miami, FL') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Guy Lemonier%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Norfolk, VA') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Laguna Foster%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Memphis, TN') WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Quodarrious Toney%' OR full_name = 'Quodarrious Toney');

-- =============================================================================
-- SPRING 2016: 12 W.A.R.R.I.O.R.S. OF THE XI DYNASTY [sources]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Houston, TX') WHERE line_label = 'SPRING 2016' AND (full_name = 'Arin Holliman' OR full_name ILIKE 'Arin Holliman%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Queens, NY') WHERE line_label = 'SPRING 2016' AND (full_name = 'Shaquille Frederick' OR full_name ILIKE 'Shaquille Frederick%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'San Francisco, CA (by way of Washington D.C.)') WHERE line_label = 'SPRING 2016' AND (full_name = 'Walter Peacock III' OR full_name ILIKE 'Walter Peacock%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Cleveland, OH') WHERE line_label = 'SPRING 2016' AND full_name ILIKE 'Cody Williams%';
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL') WHERE line_label = 'SPRING 2016' AND (full_name = 'Skyler Lemons' OR full_name ILIKE 'Skyler Lemons%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Baltimore, MD') WHERE line_label = 'SPRING 2016' AND (full_name = 'Allen Royal III' OR full_name ILIKE 'Allen Royal%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Orlando, FL') WHERE line_label = 'SPRING 2016' AND (full_name = 'Brandon McClary' OR full_name ILIKE 'Brandon McClary%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Washington, DC') WHERE line_label = 'SPRING 2016' AND full_name ILIKE 'Amir Edgerton%';
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Baltimore, MD') WHERE line_label = 'SPRING 2016' AND (full_name = 'Matthew Walker' OR full_name ILIKE 'Matthew Walker%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Queens, NY') WHERE line_label = 'SPRING 2016' AND (full_name = 'Johnathan Joseph' OR full_name ILIKE 'Johnathan Joseph%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Stone Mountain, GA') WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'R. Solomon Mangham%' OR full_name ILIKE 'R.Solomon%');

-- =============================================================================
-- SPRING 2014: 12 K.O.N.V.I.C.T.S. OF THE XI KOMMISSION [sources]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Los Angeles, CA') WHERE (full_name = 'Blake Van Putten' AND line_label = 'SPRING 2014') OR (email = 'blake@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Houston, TX') WHERE (full_name = 'Desmond Taylor' AND line_label = 'SPRING 2014') OR (email = 'desmond@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Englewood, NJ') WHERE (full_name = 'Malcolm Carter' AND line_label = 'SPRING 2014') OR (email = 'malcolm@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Clayton, NC') WHERE (full_name = 'William Clayton III' AND line_label = 'SPRING 2014') OR (email = 'william@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Denver, CO') WHERE (full_name = 'William Harris' AND line_label = 'SPRING 2014') OR (email = 'william.h@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Los Angeles, CA') WHERE (full_name = 'Vernon Yancy' AND line_label = 'SPRING 2014') OR (email = 'vernon@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Baltimore, MD') WHERE (full_name = 'Derhone Brown Jr.' AND line_label = 'SPRING 2014') OR (email = 'derhone@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Detroit, MI') WHERE (full_name = 'Andrew Melton' AND line_label = 'SPRING 2014') OR (email = 'andrew@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Los Angeles, CA') WHERE (full_name = 'Dominick Lewis (HK)' AND line_label = 'SPRING 2014') OR (full_name = 'Dominick Lewis (HK)') OR (email = 'dominick@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL') WHERE (full_name = 'Kyle Nichols' AND line_label = 'SPRING 2014') OR (email = 'kyle@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Philadelphia, PA') WHERE (full_name = 'Devin Merritt' AND line_label = 'SPRING 2014') OR (email = 'devin@example.com' AND line_label = 'SPRING 2014');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Philadelphia, PA') WHERE full_name = 'Jordan Bailey' AND line_label = 'SPRING 2014';

-- =============================================================================
-- SPRING 2013: 16 O.U.T.L.A.W.S. OF THE XI REBELLION [sources — only where listed]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Cleveland, OH') WHERE line_label = 'SPRING 2013' AND (full_name ILIKE 'Kristopher Kirkpatrick%' OR full_name ILIKE 'Christopher Kirkpatrick%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Cleveland, OH') WHERE line_label = 'SPRING 2013' AND (full_name ILIKE 'Charles Whitlock%' OR full_name ILIKE 'Charles Whitlock II%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Philadelphia, PA') WHERE line_label = 'SPRING 2013' AND full_name ILIKE 'Zachary Spence%';
-- (Andrew Addison, Brandon Gist, Vincent Watts, Joseph Greenlee, Adrian Thomas, Dorian Kirkwood, Joshua Wiggins, Jordan Butler, Innocent Akujuobi, Austin Wilson, Brandon Damon, Delano Hankins Jr. — no origin in sources; leave blank)

-- =============================================================================
-- SPRING 2012: 13 UNKATCHABLE B.A.N.D.I.T.S. [sources — only where listed]
-- =============================================================================
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Wilmington, DE') WHERE line_label = 'SPRING 2012' AND (full_name ILIKE 'Castell Abner%');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Annapolis, MD') WHERE line_label = 'SPRING 2012' AND (full_name ILIKE 'Justin Miles%' OR full_name = 'Justin Miles');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Fort Washington, MD') WHERE line_label = 'SPRING 2012' AND (full_name ILIKE 'Joshua Crockett%' OR full_name = 'Joshua Crockett');
UPDATE public.alumni SET location = COALESCE(NULLIF(TRIM(location), ''), 'Chester, VA') WHERE line_label = 'SPRING 2012' AND (full_name ILIKE 'Joshua Kato%' OR full_name = 'Joshua Kato');
-- (Daillen Hughes, Christopher Steele, Evan Stephens, Kameron Leach, Garnett Veney, Brandon Harris, Jordan Taylor, Carnegie Tirado, Bryan Rodgers — no origin in sources; leave blank)

-- No fallback: if sources do not list an origin, location remains null/blank.

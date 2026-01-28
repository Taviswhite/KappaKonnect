-- Update Spring 2025 and Spring 2024 profiles with correct line names, crossing years,
-- graduation years (where Class specified), and chapter.
-- Names and emails are NOT changed.

-- Set chapter for all Xi members
UPDATE public.profiles
SET chapter = 'Xi (Howard University)'
WHERE email IN (
  'jeremiah@example.com', 'doole@example.com', 'grant@example.com', 'bryce@example.com',
  'mael@example.com', 'don@example.com', 'carsen@example.com', 'jordan@example.com',
  'malachi@example.com', 'jared@example.com', 'skylar@example.com', 'kaden@example.com',
  'amir@example.com', 'dylan@example.com', 'ahmod@example.com', 'brian@example.com',
  'kobe@example.com', 'ahmad@example.com', 'gregory@example.com', 'joseph@example.com',
  'khimarhi@example.com', 'keith@example.com', 'joshua@example.com', 'chase@example.com',
  'daniel@example.com', 'brice@example.com', 'marshall@example.com', 'brandon@example.com',
  'mory@example.com', 'jordan.newsome@example.com', 'andre@example.com', 'reginald@example.com'
);

-- Spring 2025: 14 K.O.N.T.R.A.S of the Xi M.I.L.I.T.I.A
UPDATE public.profiles SET line_name = 'M.A.S FUERTE', crossing_year = 2025, graduation_year = 2027 WHERE email = 'jeremiah@example.com';
UPDATE public.profiles SET line_name = 'S.K.A.R', crossing_year = 2025, graduation_year = 2026 WHERE email = 'doole@example.com';
UPDATE public.profiles SET line_name = 'NO KONVICTIONS', crossing_year = 2025, graduation_year = 2026 WHERE email = 'grant@example.com';
UPDATE public.profiles SET line_name = 'KROWD KONTROL', crossing_year = 2025 WHERE email = 'andre@example.com';
UPDATE public.profiles SET line_name = 'DEADPOOL', crossing_year = 2025, graduation_year = 2027 WHERE email = 'jordan@example.com';
UPDATE public.profiles SET line_name = 'Black Ops VI', crossing_year = 2025, graduation_year = 2027 WHERE email = 'mael@example.com';
UPDATE public.profiles SET line_name = 'HOLLOWPOINT', crossing_year = 2025, graduation_year = 2027 WHERE email = 'malachi@example.com';
UPDATE public.profiles SET line_name = 'T.R.A.C.K HAWK', crossing_year = 2025, graduation_year = 2027 WHERE email = 'amir@example.com';
UPDATE public.profiles SET line_name = 'Ghost Rekon', crossing_year = 2025, graduation_year = 2026 WHERE email = 'reginald@example.com';
UPDATE public.profiles SET line_name = 'K.O.N.C.R.E.T.E; Rokk', crossing_year = 2025, graduation_year = 2026 WHERE email = 'don@example.com';
UPDATE public.profiles SET line_name = 'FINAL DESTINATION', crossing_year = 2025 WHERE email = 'dylan@example.com';
UPDATE public.profiles SET line_name = 'S.P.A.C.E KADET', crossing_year = 2025, graduation_year = 2026 WHERE email = 'jared@example.com';
UPDATE public.profiles SET line_name = 'IORNKLAD', crossing_year = 2025, graduation_year = 2026 WHERE email = 'carsen@example.com';
UPDATE public.profiles SET line_name = 'OPPENHEIMER', crossing_year = 2025, graduation_year = 2026 WHERE email = 'kaden@example.com';

-- Spring 2024: 18 s.o.l.d.1.e.r.s of the xi anarchy / KKA s.a.v.a.g.e.s (line names only; names/emails unchanged)
UPDATE public.profiles SET line_name = 'DEFKON 1', crossing_year = 2024 WHERE email = 'bryce@example.com';
UPDATE public.profiles SET line_name = 'K.R.A.T.O.S.', crossing_year = 2024 WHERE email = 'ahmod@example.com';
UPDATE public.profiles SET line_name = 'S.T.A.T.I.K. SHOCK (legacy)', crossing_year = 2024 WHERE email = 'brian@example.com';
UPDATE public.profiles SET line_name = 'KING K.O.B.R.A.', crossing_year = 2024 WHERE email = 'kobe@example.com';
UPDATE public.profiles SET line_name = 'WINTER SOLDIER', crossing_year = 2024 WHERE email = 'skylar@example.com';
UPDATE public.profiles SET line_name = 'APOKALYPSE', crossing_year = 2024 WHERE email = 'ahmad@example.com';
UPDATE public.profiles SET line_name = 'DIAMOND B.A.C.K.', crossing_year = 2024 WHERE email = 'gregory@example.com';
UPDATE public.profiles SET line_name = 'G.l. J.O.E.', crossing_year = 2024 WHERE email = 'joseph@example.com';
UPDATE public.profiles SET line_name = 'Q.U.I.C.K.S.A.N.D.', crossing_year = 2024 WHERE email = 'khimarhi@example.com';
UPDATE public.profiles SET line_name = 'WEAPON X', crossing_year = 2024 WHERE email = 'keith@example.com';
UPDATE public.profiles SET line_name = 'THE ALKHEMIST', crossing_year = 2024 WHERE email = 'joshua@example.com';
UPDATE public.profiles SET line_name = 'LOTTERY PICK', crossing_year = 2024 WHERE email = 'chase@example.com';
UPDATE public.profiles SET line_name = 'RIKKFLAIR', crossing_year = 2024 WHERE email = 'daniel@example.com';
UPDATE public.profiles SET line_name = 'DARK KNIGHT(4.0)', crossing_year = 2024 WHERE email = 'brice@example.com';
UPDATE public.profiles SET line_name = 'D.E.A.T.H. STAR', crossing_year = 2024 WHERE email = 'marshall@example.com';
UPDATE public.profiles SET line_name = 'KASH KIDD', crossing_year = 2024 WHERE email = 'brandon@example.com';
UPDATE public.profiles SET line_name = 'M.A.K.A.V.E.L.', crossing_year = 2024 WHERE email = 'mory@example.com';
UPDATE public.profiles SET line_name = 'BERSERKER', crossing_year = 2024 WHERE email = 'jordan.newsome@example.com';

-- ============================================
-- Update alumni.location (hometown) for Alumni page
-- ============================================

-- Spring 2025
UPDATE public.alumni SET location = 'Silver Spring, Maryland' WHERE email = 'jeremiah@example.com';
UPDATE public.alumni SET location = 'Berkeley, California' WHERE email = 'doole@example.com';
UPDATE public.alumni SET location = 'Atlanta, Georgia' WHERE email = 'grant@example.com';
UPDATE public.alumni SET location = 'Anne Arundel County, Maryland' WHERE email = 'andre@example.com';
UPDATE public.alumni SET location = 'South Orange, New Jersey' WHERE email = 'jordan@example.com';
UPDATE public.alumni SET location = 'Oakland, California' WHERE email = 'mael@example.com';
UPDATE public.alumni SET location = 'Queens, New York' WHERE email = 'malachi@example.com';
UPDATE public.alumni SET location = 'Atlanta, Georgia' WHERE email = 'amir@example.com';
UPDATE public.alumni SET location = 'Waldorf, Maryland' WHERE email = 'reginald@example.com';
UPDATE public.alumni SET location = 'Rockland County, New York' WHERE email = 'don@example.com';
UPDATE public.alumni SET location = 'Petersburg, Virginia' WHERE email = 'dylan@example.com';
UPDATE public.alumni SET location = 'Miami, Florida' WHERE email = 'jared@example.com';
UPDATE public.alumni SET location = 'Baton Rouge, Louisiana' WHERE email = 'carsen@example.com';
UPDATE public.alumni SET location = 'Naperville, Illinois' WHERE email = 'kaden@example.com';

-- Spring 2024
UPDATE public.alumni SET location = 'Chicago, Illinois' WHERE email = 'bryce@example.com';
UPDATE public.alumni SET location = 'Philadelphia, Pennsylvania' WHERE email = 'ahmod@example.com';
UPDATE public.alumni SET location = 'Detroit, Michigan' WHERE email = 'bryan@example.com';
UPDATE public.alumni SET location = 'Jacksonville, Florida' WHERE email = 'kobe@example.com';
UPDATE public.alumni SET location = 'Cleveland, Ohio' WHERE email = 'ahmad@example.com';
UPDATE public.alumni SET location = 'Bay Area, California' WHERE email = 'gregory@example.com';
UPDATE public.alumni SET location = 'Ohio' WHERE email = 'joseph@example.com';
UPDATE public.alumni SET location = 'Boston, Massachusetts' WHERE email = 'khimarhi@example.com';
UPDATE public.alumni SET location = 'Raleigh, North Carolina' WHERE email = 'joshua@example.com';
UPDATE public.alumni SET location = 'Chicago, Illinois' WHERE email = 'daniel@example.com';
UPDATE public.alumni SET location = 'Richmond, Texas' WHERE email = 'brice@example.com';
UPDATE public.alumni SET location = 'Cleveland, Ohio' WHERE email = 'marshall@example.com';
UPDATE public.alumni SET location = 'Detroit, Michigan' WHERE email = 'brandon@example.com';
UPDATE public.alumni SET location = 'Bronx, New York' WHERE email = 'mory@example.com';
UPDATE public.alumni SET location = 'Brooklyn, New York' WHERE email = 'jordan.newsome@example.com';

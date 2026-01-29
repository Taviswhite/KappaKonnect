-- Update graduation years from study guide / source data (Seniors -> Class of 2025, Juniors -> 2026, etc.)

-- =============================================================================
-- SPRING 2025 (Junior = 2026, Senior = 2025, Alumni = 2024)
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2025' AND (full_name = 'Jerimiah Ramirez' OR full_name ILIKE 'Jerimiah Ramirez%' OR full_name ILIKE 'Jeremiah Ramirez%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Doole Gaiende Edwards%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Grant Hill%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Andre Sawyerr%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Jordan Atkins%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Mael Blunt%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Malachi MacMillan%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Amir Stevenson%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Reginald Alexander%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Don Jordan Duplan%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Dylan Darling%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Jared Baker%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Carsen Manuel%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2025' AND (full_name ILIKE 'Kaden Cobb%');

-- =============================================================================
-- SPRING 2024 (from 18 S.O.L.D.1.E.R.S list)
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Marshall Williams%');
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Kimahri Testamrk%' OR full_name ILIKE 'Khimarhi%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Chase Knox%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Gregory Allen%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Daniel Miller%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Joshua Carter%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Jordan Newsome%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Keith Henderson%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Joseph Serra%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Brandon McCaskill%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Mory Diakite%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Bryce Perkins%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Ahmod Newton%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Bryan Singleton%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Kobe Denmark%' OR full_name ILIKE 'Kobe Denmark-Garnett%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Skylar Peterkin%');
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Ahmad Edwards%');
UPDATE public.alumni SET graduation_year = 2026 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Bryce Facey%' OR full_name ILIKE 'Brice Facey%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'SPRING 2024' AND (full_name ILIKE 'Santana Wolfe%');

-- =============================================================================
-- FALL 2023
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'FALL 2023' AND (full_name ILIKE 'Michael Taylor%' OR full_name ILIKE '%Taylor-White%' OR full_name ILIKE '%Taylor White%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'FALL 2023' AND (full_name ILIKE 'Chandler Searcy%');
UPDATE public.alumni SET graduation_year = 2025 WHERE line_label = 'FALL 2023' AND (full_name ILIKE 'Carl Clay%');

-- =============================================================================
-- SPRING 2022
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Lloyd Maxwell%');
UPDATE public.alumni SET graduation_year = 2024 WHERE line_label = 'SPRING 2022' AND (full_name ILIKE 'Chase Tomlin%');

-- =============================================================================
-- SPRING 2017
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2019 WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Raymond Pottinger%');
UPDATE public.alumni SET graduation_year = 2018 WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Kalen Johnson%');
UPDATE public.alumni SET graduation_year = 2019 WHERE line_label = 'SPRING 2017' AND (full_name ILIKE 'Guy Lemonier%');

-- =============================================================================
-- SPRING 2016
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2017 WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'Arin Holliman%');
UPDATE public.alumni SET graduation_year = 2018 WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'Shaquille Frederick%');
UPDATE public.alumni SET graduation_year = 2019 WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'Walter Peacock%');

-- =============================================================================
-- SPRING 2013
-- =============================================================================
UPDATE public.alumni SET graduation_year = 2015 WHERE line_label = 'SPRING 2013' AND (full_name ILIKE 'Dorian Kirkwood%');

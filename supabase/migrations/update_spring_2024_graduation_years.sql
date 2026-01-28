-- Spring 2024: 18 S.O.L.D.1.E.R.S of the Xi Anarchy — graduation years per roster/sources.
-- Updates graduation_year only. Safe to re-run.

UPDATE public.alumni SET graduation_year = 2024
WHERE line_label = 'SPRING 2024' AND (full_name = 'Marshall Williams' OR full_name LIKE 'Marshall Williams%');

UPDATE public.alumni SET graduation_year = 2024
WHERE line_label = 'SPRING 2024' AND (full_name = 'Khimarhi Testamark' OR full_name LIKE 'Khimarhi Testamark%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Chase Knox' OR full_name LIKE 'Chase Knox%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Santana Wolfe' OR full_name LIKE 'Santana Wolfe%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Keith Henderson Jr.' OR full_name LIKE 'Keith Henderson%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Joseph Serra' OR full_name LIKE 'Joseph Serra%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Brandon McCaskill' OR full_name LIKE 'Brandon McCaskill%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Gregory Allen Jr.' OR full_name LIKE 'Gregory Allen%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Mory Diakite' OR full_name LIKE 'Mory Diakite%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Daniel Miller' OR full_name LIKE 'Daniel Miller%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Joshua Carter' OR full_name LIKE 'Joshua Carter%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Bryce Perkins' OR full_name LIKE 'Bryce Perkins%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Ahmod Newton' OR full_name LIKE 'Ahmod Newton%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Bryan Singleton II' OR full_name LIKE 'Bryan Singleton%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Kobe Denmark-Garnett' OR full_name LIKE 'Kobe Denmark%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Skylar Peterkin' OR full_name LIKE 'Skylar Peterkin%');

UPDATE public.alumni SET graduation_year = 2024
WHERE line_label = 'SPRING 2024' AND (full_name = 'Ahmad Edwards' OR full_name LIKE 'Ahmad Edwards%');

UPDATE public.alumni SET graduation_year = 2026
WHERE line_label = 'SPRING 2024' AND (full_name = 'Bryce Facey' OR full_name LIKE 'Bryce Facey%');

UPDATE public.alumni SET graduation_year = 2025
WHERE line_label = 'SPRING 2024' AND (full_name = 'Jordan Newsome' OR full_name LIKE 'Jordan Newsome%');

-- Brice/Brian variants (by email) — keep in sync with fix_spring_2024_grad_years_bryce_brice_bryan_brian
UPDATE public.alumni SET graduation_year = 2026
WHERE email = 'brice@example.com';

UPDATE public.alumni SET graduation_year = 2026
WHERE email = 'brian@example.com';

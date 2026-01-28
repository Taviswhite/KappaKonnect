-- Add line_order to profiles so crossing display can show "1-Xi-25" format
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_order integer;

COMMENT ON COLUMN public.profiles.line_order IS 'Order on the line (e.g. 1 = number 1). Used for display like "1-Xi-25".';

-- Spring 2025: set line_order 1–14 so each displays "N-Xi-25"
UPDATE public.profiles SET line_order = 1  WHERE email = 'jeremiah@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 2  WHERE email = 'doole@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 3  WHERE email = 'grant@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 4  WHERE email = 'andre@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 5  WHERE email = 'jordan@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 6  WHERE email = 'mael@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 7  WHERE email = 'malachi@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 8  WHERE email = 'amir@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 9  WHERE email = 'reginald@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 10 WHERE email = 'don@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 11 WHERE email = 'dylan@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 12 WHERE email = 'jared@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 13 WHERE email = 'carsen@example.com' AND crossing_year = 2025;
UPDATE public.profiles SET line_order = 14 WHERE email = 'kaden@example.com' AND crossing_year = 2025;

-- Spring 2024: set line_order 1–18 so each displays "N-Xi-24"
UPDATE public.profiles SET line_order = 1  WHERE email = 'bryce@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 2  WHERE email = 'ahmod@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 3  WHERE email = 'brian@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 4  WHERE email = 'kobe@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 5  WHERE email = 'skylar@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 6  WHERE email = 'ahmad@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 7  WHERE email = 'gregory@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 8  WHERE email = 'joseph@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 9  WHERE email = 'khimarhi@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 10 WHERE email = 'keith@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 11 WHERE email = 'joshua@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 12 WHERE email = 'chase@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 13 WHERE email = 'daniel@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 14 WHERE email = 'brice@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 15 WHERE email = 'marshall@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 16 WHERE email = 'brandon@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 17 WHERE email = 'mory@example.com' AND crossing_year = 2024;
UPDATE public.profiles SET line_order = 18 WHERE email = 'jordan.newsome@example.com' AND crossing_year = 2024;

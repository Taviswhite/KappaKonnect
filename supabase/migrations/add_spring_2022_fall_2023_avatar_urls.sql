-- Set avatar_url for Spring 2022 (12 Capos) and Fall 2023 alumni. Images in public/avatars/.
-- Spring 2022
UPDATE public.alumni SET avatar_url = '/avatars/derrick.png' WHERE full_name ILIKE '%Derrick Long%';
UPDATE public.alumni SET avatar_url = '/avatars/marcus.png' WHERE full_name ILIKE '%Marcus Curvan%';
UPDATE public.alumni SET avatar_url = '/avatars/cameron.png' WHERE full_name ILIKE '%Cameron Kee%';
UPDATE public.alumni SET avatar_url = '/avatars/joshua.png' WHERE full_name ILIKE '%Joshua Bell%';
UPDATE public.alumni SET avatar_url = '/avatars/christian.png' WHERE full_name ILIKE '%Christian Ransome%';
UPDATE public.alumni SET avatar_url = '/avatars/trevor.png' WHERE full_name ILIKE '%Trevor Squirewell%';
UPDATE public.alumni SET avatar_url = '/avatars/jonah.png' WHERE full_name ILIKE '%Jonah Lee%';
UPDATE public.alumni SET avatar_url = '/avatars/lloyd.png' WHERE full_name ILIKE '%Lloyd Maxwell%';
UPDATE public.alumni SET avatar_url = '/avatars/chase.png' WHERE full_name ILIKE '%Chase Tomlin%';
UPDATE public.alumni SET avatar_url = '/avatars/jaron.png' WHERE full_name ILIKE '%Jaron Dandridge%';
UPDATE public.alumni SET avatar_url = '/avatars/michael-singleton.png' WHERE full_name ILIKE '%Michael Singleton%';
UPDATE public.alumni SET avatar_url = '/avatars/santana.png' WHERE full_name ILIKE '%Santana Wolfe%';
-- Fall 2023
UPDATE public.alumni SET avatar_url = '/avatars/chandler.png' WHERE full_name ILIKE '%Chandler Searcy%';
UPDATE public.alumni SET avatar_url = '/avatars/carl.png' WHERE full_name ILIKE '%Carl Clay%';
UPDATE public.alumni SET avatar_url = '/avatars/michael-taylor-white.png' WHERE full_name ILIKE '%Michael Taylor%' AND full_name ILIKE '%White%';

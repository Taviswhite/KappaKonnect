-- Career / industry details for Joshua Bell-Bey (4-Xi-22) and Chase Tomlin (9-Xi-22), Spring 2022.
-- Joshua: actor, film, Manager Trainee at McDonald's, mentor at Boys & Girls Club, ambassador for HumblyHood.
-- Chase: Investment Banking Associate at Goldman Sachs, ex–Private Equity Intern at Permira, Keeper of Exchequer.
UPDATE public.alumni
SET
  industry = 'Entertainment / Acting',
  current_position = 'Actor | Mentor | Ambassador',
  current_company = 'HumblyHood; Boys & Girls Club of America',
  bio = 'Career goal: actor. Film: It won''t hurt forever, trust me (2020). Manager Trainee at McDonald''s (3 years). Mentor at Boys & Girls Club of America; ambassador for HumblyHood. Registered 250+ voters (Nov 2017).'
WHERE full_name ILIKE '%Joshua Bell%';

UPDATE public.alumni
SET
  industry = 'Investment Banking / Finance',
  current_position = 'Investment Banking Associate',
  current_company = 'Goldman Sachs',
  bio = 'Investment Banking Associate at Goldman Sachs. Former Private Equity Intern at Permira; Summer Financial Counselor, Money Matters For Youth (2 years). Bloomberg Market Concepts credential (Nov 2020). Served as Keeper of Exchequer (Treasurer) for the chapter.'
WHERE full_name ILIKE '%Chase Tomlin%';

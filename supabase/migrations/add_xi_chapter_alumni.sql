-- Add Xi Chapter alumni (Fall 2023, Spring 2022, Spring 2017) to alumni portal
-- These are standalone alumni records (not tied to auth.users)
-- If you later create auth users for them, you can update user_id accordingly.

-- Make inserts idempotent by skipping rows that already exist for a given email
INSERT INTO public.alumni (
  full_name,
  email,
  graduation_year,
  degree,
  current_company,
  current_position,
  location,
  linkedin_url,
  avatar_url,
  industry
)
SELECT *
FROM (
  VALUES
    ('Chandler Searcy', 'chandler@example.com', 2024, NULL, NULL, NULL, 'Atlanta, Georgia', NULL, NULL, NULL),
    ('Michael Taylor-White', 'michael@example.com', 2024, NULL, NULL, 'Krowd Pleaser', 'Atlanta, Georgia', NULL, NULL, NULL),
    ('Carl Clay', 'carl@example.com', 2024, NULL, NULL, NULL, 'Huntsville, Alabama', NULL, NULL, NULL)
) AS v(full_name, email, graduation_year, degree, current_company, current_position, location, linkedin_url, avatar_url, industry)
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a WHERE a.email = v.email
);

INSERT INTO public.alumni (
  full_name,
  email,
  graduation_year,
  degree,
  current_company,
  current_position,
  location,
  linkedin_url,
  avatar_url,
  industry
)
SELECT *
FROM (
  VALUES
    ('Derrick Long', 'derrick@example.com', 2023, NULL, NULL, 'Khrome Hearts', 'Montgomery, Alabama', NULL, NULL, NULL),
    ('Marcus Curvan', 'marcus@example.com', 2023, NULL, NULL, 'Dos Equis', 'Philadelphia, Pennsylvania', NULL, NULL, NULL),
    ('Cameron Kee', 'cameron@example.com', 2023, NULL, NULL, 'Kruel Summers', 'Lawnside, New Jersey', NULL, NULL, NULL),
    ('Joshua Bell-Bey', 'joshua@example.com', 2023, NULL, NULL, 'Lucky Luciano', 'Chicago, Illinois', NULL, NULL, NULL),
    ('Christian Ransome', 'christian@example.com', 2023, NULL, NULL, 'Karlos Gambino', 'Philadelphia, Pennsylvania', NULL, NULL, NULL),
    ('Trevor Squirewell', 'trevor@example.com', 2023, NULL, NULL, 'Nova Kane', 'South Carolina', NULL, NULL, NULL),
    ('Jonah Lee', 'jonah@example.com', 2023, NULL, NULL, 'Kill Switch', 'Pasadena, California', NULL, NULL, NULL),
    ('Lloyd Maxwell', 'lloyd@example.com', 2023, NULL, NULL, 'Rockafeller Reckords', 'Chicago, Illinois', NULL, NULL, NULL),
    ('Chase Tomlin', 'chase@example.com', 2023, NULL, NULL, 'Kassius Klay', 'Detroit, Michigan', NULL, NULL, NULL),
    ('Jaron Dandridge Jr.', 'jaron@example.com', 2023, NULL, NULL, 'Krossbones', 'Richmond, Virginia', NULL, NULL, NULL),
    ('Michael Singleton', 'michael.singleton@example.com', 2023, NULL, NULL, 'Konissieur', 'Detroit, Michigan', NULL, NULL, NULL),
    ('Santana Wolfe', 'santana@example.com', 2023, NULL, NULL, 'Kane Breaker', 'Teaneck, New Jersey', NULL, NULL, NULL)
) AS v(full_name, email, graduation_year, degree, current_company, current_position, location, linkedin_url, avatar_url, industry)
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a WHERE a.email = v.email
);

INSERT INTO public.alumni (
  full_name,
  email,
  graduation_year,
  degree,
  current_company,
  current_position,
  location,
  linkedin_url,
  avatar_url,
  industry
)
SELECT *
FROM (
  VALUES
    ('Raymond Pottinger Jr.', 'raymond@example.com', 2018, NULL, NULL, 'Kovert Opps', 'Wilmington, Delaware', NULL, NULL, NULL),
    ('Vincent Roofe III', 'vincent@example.com', 2018, NULL, NULL, 'Kurrenxi', 'Chicago, Illinois', NULL, NULL, NULL),
    ('Kalen Johnson', 'kalen@example.com', 2018, NULL, NULL, 'Playaktion', 'Houston, Texas', NULL, NULL, NULL),
    ('Johnny Cooper', 'johnny@example.com', 2018, NULL, NULL, 'Kingpin', 'Rockford, Illinois', NULL, NULL, NULL),
    ('Jared McCain', 'jared.mccain@example.com', 2018, NULL, NULL, 'Attika', 'Woodbridge, Virginia', NULL, NULL, NULL),
    ('Guy Lemonier Jr.', 'guy@example.com', 2018, NULL, NULL, 'Vice', 'Miami, Florida', NULL, NULL, NULL),
    ('Laguna Foster Jr.', 'laguna@example.com', 2018, NULL, NULL, 'Holyfield', 'Norfolk, Virginia', NULL, NULL, NULL),
    ('Quodarrious Toney', 'quodarrious@example.com', 2018, NULL, NULL, 'Johnny Kash', 'Memphis, Tennessee', NULL, NULL, NULL)
) AS v(full_name, email, graduation_year, degree, current_company, current_position, location, linkedin_url, avatar_url, industry)
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a WHERE a.email = v.email
);


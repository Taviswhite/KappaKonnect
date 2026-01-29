-- Ensure Spring 2016 alumni have industry, location, and graduation_year so careers display.
-- Match by line_label + full_name so it works even when email is not set. graduation_year 2019 = Class of 2019.

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Wealth Management/Financial Services'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Houston, TX'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Arin Holliman' OR full_name ILIKE 'Arin Holliman%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Aviation/Fashion/Engineering'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Queens, NY'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Shaquille Frederick' OR full_name ILIKE 'Shaquille Frederick%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Computer Science/Financial Services'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'San Francisco, CA (by way of Washington D.C.)'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Walter Peacock III' OR full_name ILIKE 'Walter Peacock%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Architecture/Athletics'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Cleveland, OH'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'Cody Williams%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Real Estate/Restaurateur'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Chicago, IL'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Skyler Lemons' OR full_name ILIKE 'Skyler Lemons%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Pharmaceutical Sales'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Baltimore, MD'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Allen Royal III' OR full_name ILIKE 'Allen Royal%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Music Industry/International Business'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Orlando, FL'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Brandon McClary' OR full_name ILIKE 'Brandon McClary%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Athletics'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Washington, DC'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'Amir Edgerton%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Music Industry'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Baltimore, MD'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Matthew Walker' OR full_name ILIKE 'Matthew Walker%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Education'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Queens, NY'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name = 'Johnathan Joseph' OR full_name ILIKE 'Johnathan Joseph%');

UPDATE public.alumni SET
  industry = COALESCE(NULLIF(TRIM(industry), ''), 'Private Equity'),
  location = COALESCE(NULLIF(TRIM(location), ''), 'Stone Mountain, GA'),
  graduation_year = CASE WHEN COALESCE(graduation_year, 0) < 1900 THEN 2019 ELSE graduation_year END
WHERE line_label = 'SPRING 2016' AND (full_name ILIKE 'R. Solomon Mangham%' OR full_name ILIKE 'R.Solomon%');

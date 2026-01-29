-- Add industry (career field) for Spring 2013, Spring 2012, and Spring 2010 from provided sources.
-- Match by line_label (any case) or crossing_year + full_name. Only set where sources list career.

ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS industry text;

-- =============================================================================
-- SPRING 2013: 16 O.U.T.L.A.W.S. OF THE XI REBELLION [sources]
-- =============================================================================
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Sports Public Relations/Media') WHERE (TRIM(line_label) ILIKE 'spring%2013' OR crossing_year = 2013) AND (full_name ILIKE 'Charles Whitlock%' OR full_name = 'Charles Whitlock II');
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Computer Engineering') WHERE (TRIM(line_label) ILIKE 'spring%2013' OR crossing_year = 2013) AND full_name ILIKE 'Zachary Spence%';
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Military') WHERE (TRIM(line_label) ILIKE 'spring%2013' OR crossing_year = 2013) AND (full_name ILIKE 'James Cox%' OR full_name = 'James Cox II');
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Entrepreneurship/Media/Design') WHERE (TRIM(line_label) ILIKE 'spring%2013' OR crossing_year = 2013) AND (full_name ILIKE 'Dorian Kirkwood%' OR full_name ILIKE '%Kirkwood (HK)%');
-- (Kristopher Kirkpatrick, Andrew Addison, Brandon Gist, Vincent Watts, Joseph Greenlee, Adrian Thomas, Joshua Wiggins, Jordan Butler, Innocent Akujuobi II, Austin Wilson, Brandon Damon, Delano Hankins Jr. — not in sources; leave blank)

-- =============================================================================
-- SPRING 2012: 13 UNKATCHABLE B.A.N.D.I.T.S. [sources]
-- =============================================================================
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Law') WHERE (TRIM(line_label) ILIKE 'spring%2012' OR crossing_year = 2012) AND (full_name ILIKE 'Castell Abner%' OR full_name = 'Castell Abner III');
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Military/DJ/Photography/Cyber Security') WHERE (TRIM(line_label) ILIKE 'spring%2012' OR crossing_year = 2012) AND (full_name ILIKE 'Justin%Miles%' OR full_name ILIKE 'Justin Miles%' OR full_name = 'Justin Miles');
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Law') WHERE (TRIM(line_label) ILIKE 'spring%2012' OR crossing_year = 2012) AND (full_name ILIKE 'Joshua Crockett%' OR full_name ILIKE '%Crockett (HK)%');
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Psychology') WHERE (TRIM(line_label) ILIKE 'spring%2012' OR crossing_year = 2012) AND (full_name ILIKE 'Joshua Kato%' OR full_name = 'Joshua Kato');
-- (Daillen Hughes, Christopher Steele, Evan Stephens, Kameron Leach, Garnett Veney, Brandon Harris, Jordan Taylor, Carnegie Tirado, Bryan Rodgers — not in sources; leave blank)

-- =============================================================================
-- SPRING 2010: 12 KULPRITS OF K.H.A.O.S. [sources]
-- =============================================================================
UPDATE public.alumni SET industry = COALESCE(NULLIF(TRIM(industry), ''), 'Music/DJ') WHERE (TRIM(line_label) ILIKE 'spring%2010' OR crossing_year = 2010) AND full_name ILIKE 'Shelton%Murphy%';
-- (Lenon Thompson, Joseph Laster III, DeAngelo Shears, David Clary, Julian K. Lewis, Phifer Turner, Nickolas Sneed, Sid Banks, John Perez (HK), Jamal Minor, Alexander Lewis — not in sources; leave blank)

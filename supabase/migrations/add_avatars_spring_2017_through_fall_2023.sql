-- Ensure avatar_url is set for all alumni in lines Spring 2017 through Fall 2023
-- (and any other lines in that display range). Uses UI Avatars for anyone who
-- doesn't already have a stored image (e.g. /avatars/xxx.png from other migrations).

CREATE OR REPLACE FUNCTION ui_avatar_url(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF full_name IS NULL OR TRIM(full_name) = '' THEN
    RETURN NULL;
  END IF;
  RETURN 'https://ui-avatars.com/api/?name=' || REPLACE(REPLACE(TRIM(full_name), ' ', '+'), '''', '') || '&size=200&background=random&bold=true&color=fff';
END;
$$ LANGUAGE plpgsql;

-- Backfill all alumni who have no avatar_url so pics show for every line
-- (Spring 2017, 2016, 2014, … through Fall 2023). Keeps existing /avatars/xxx.png.
UPDATE public.alumni
SET avatar_url = ui_avatar_url(full_name)
WHERE (avatar_url IS NULL OR avatar_url = '')
  AND full_name IS NOT NULL
  AND TRIM(full_name) != '';

DROP FUNCTION IF EXISTS ui_avatar_url(TEXT);

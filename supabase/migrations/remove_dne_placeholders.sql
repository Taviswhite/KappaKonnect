-- Remove all "Do Not Exist" / "DNE" placeholder rows from alumni.
-- Skip these positions (like Spring 2016 position 3); numbering is already correct via spring_2016_skip_3_renumber.sql.
-- Safe to run multiple times.

DELETE FROM public.alumni
WHERE full_name ILIKE '%does not exist%'
   OR full_name ILIKE '%do not exist%'
   OR full_name ILIKE 'DNE'
   OR full_name = 'Does Not Exist (DNE)'
   OR email = 'doesnotexist@example.com';

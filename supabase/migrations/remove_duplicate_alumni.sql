-- Remove duplicate alumni records
-- Keeps the most recent record (by created_at or id) for each unique email or full_name

-- First, identify duplicates by email (if email exists)
DELETE FROM public.alumni
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(email))
             ORDER BY created_at DESC, id DESC
           ) as rn
    FROM public.alumni
    WHERE email IS NOT NULL AND email != ''
  ) t
  WHERE rn > 1
);

-- Then, identify duplicates by full_name (for records without email or after email dedup)
DELETE FROM public.alumni
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(full_name))
             ORDER BY 
               CASE WHEN email IS NOT NULL AND email != '' THEN 0 ELSE 1 END, -- Prefer records with email
               created_at DESC, 
               id DESC
           ) as rn
    FROM public.alumni
  ) t
  WHERE rn > 1
);

-- Optional: Add a comment showing how many duplicates were removed
-- You can check the result by running: SELECT COUNT(*) FROM public.alumni;

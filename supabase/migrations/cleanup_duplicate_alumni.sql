-- Clean up duplicate alumni records and ensure data integrity
-- This migration removes duplicate alumni, keeping only the most recent one per email

-- Step 1: Find and remove duplicate alumni by email (keep the one with the most recent created_at)
DELETE FROM public.alumni a1
WHERE EXISTS (
  SELECT 1
  FROM public.alumni a2
  WHERE a2.email = a1.email
    AND a2.email IS NOT NULL
    AND a2.id != a1.id
    AND (
      a2.created_at > a1.created_at
      OR (a2.created_at = a1.created_at AND a2.id > a1.id)
    )
);

-- Step 2: Also remove duplicates by user_id if they exist (keep the one linked to auth.users)
DELETE FROM public.alumni a1
WHERE EXISTS (
  SELECT 1
  FROM public.alumni a2
  WHERE a2.user_id = a1.user_id
    AND a2.user_id IS NOT NULL
    AND a2.id != a1.id
    AND (
      a2.created_at > a1.created_at
      OR (a2.created_at = a1.created_at AND a2.id > a1.id)
    )
);

-- Step 3: Ensure RLS policy allows all authenticated users to view alumni
DROP POLICY IF EXISTS "Authenticated users can view alumni" ON public.alumni;
CREATE POLICY "Authenticated users can view alumni"
    ON public.alumni FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Step 4: Verify no duplicates remain
-- Run this query manually to verify: 
-- SELECT email, COUNT(*) as count 
-- FROM public.alumni 
-- WHERE email IS NOT NULL
-- GROUP BY email 
-- HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Also verify by user_id:
-- SELECT user_id, COUNT(*) as count 
-- FROM public.alumni 
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id 
-- HAVING COUNT(*) > 1;
-- Should return 0 rows

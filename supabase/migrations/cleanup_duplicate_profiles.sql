-- Clean up duplicate profiles and ensure data integrity
-- This migration removes duplicate profiles, keeping only the most recent one per user_id

-- Step 1: Find and remove duplicate profiles by user_id (keep the one with the most recent created_at)
-- This handles cases where the UNIQUE constraint might not have been enforced
DELETE FROM public.profiles p1
WHERE EXISTS (
  SELECT 1
  FROM public.profiles p2
  WHERE p2.user_id = p1.user_id
    AND p2.id != p1.id
    AND (
      p2.created_at > p1.created_at
      OR (p2.created_at = p1.created_at AND p2.id > p1.id)
    )
);

-- Step 2: Also remove duplicates by email if they have different user_ids (keep the one linked to auth.users)
-- This handles cases where multiple profiles exist for the same email
DELETE FROM public.profiles p1
WHERE EXISTS (
  SELECT 1
  FROM public.profiles p2
  WHERE p2.email = p1.email
    AND p2.id != p1.id
    AND EXISTS (SELECT 1 FROM auth.users WHERE id = p2.user_id)
    AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p1.user_id)
);

-- Step 3: Ensure unique constraint exists on user_id
DO $$
BEGIN
  -- Drop constraint if it exists (to recreate it cleanly)
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key' 
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_key;
  END IF;
  
  -- Add unique constraint
  ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
END $$;

-- Step 4: Verify no duplicates remain
-- Run this query manually to verify: 
-- SELECT user_id, COUNT(*) as count 
-- FROM public.profiles 
-- GROUP BY user_id 
-- HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Also verify by email:
-- SELECT email, COUNT(*) as count 
-- FROM public.profiles 
-- GROUP BY email 
-- HAVING COUNT(*) > 1;
-- Should return 0 rows (or only rows where user_id is NULL, which is allowed for alumni)

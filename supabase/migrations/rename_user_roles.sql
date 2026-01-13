-- Rename user roles: advisor -> alumni, committee_chair -> committee_chairman
-- Note: This requires dropping and recreating the enum type

-- Step 1: Create new enum with updated values
CREATE TYPE public.app_role_new AS ENUM (
    'admin',
    'officer',
    'committee_chairman',
    'member',
    'alumni'
);

-- Step 2: Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE text USING role::text;

-- Step 3: Map old values to new values
UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'advisor' THEN 'alumni'
  WHEN role = 'committee_chair' THEN 'committee_chairman'
  ELSE role
END;

-- Step 4: Change column type to new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new USING role::public.app_role_new;

-- Step 5: Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 6: Update has_role function to use new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 7: Update RLS policies that reference the old role names
-- Update events policy
DROP POLICY IF EXISTS "Officers and admins can create events" ON public.events;
CREATE POLICY "Officers and admins can create events" 
  ON public.events FOR INSERT 
  TO authenticated 
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'officer'::public.app_role) 
    OR public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
  );

-- Update tasks policy (if it still exists, otherwise it's already been updated by allow_all_users_create_tasks.sql)
DROP POLICY IF EXISTS "Officers and admins can create tasks" ON public.tasks;

-- Step 8: Update handle_new_user function to use 'member' (no change needed, but ensuring it's correct)
-- The function already uses 'member' as default, which is correct

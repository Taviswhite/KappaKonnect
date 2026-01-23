-- Rename officer role to e_board and add document visibility/sharing
-- This migration handles the complete role rename and document visibility system

-- Step 1: Create new enum with e_board instead of officer
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role_new') THEN
    CREATE TYPE public.app_role_new AS ENUM (
        'admin',
        'e_board',
        'committee_chairman',
        'member',
        'alumni'
    );
  END IF;
END $$;

-- Step 2: Drop all policies and functions that depend on the old app_role enum
-- These must be dropped before we can drop the enum type

-- Drop all policies that might reference app_role
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies that use has_role function
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (policyname LIKE '%officer%' OR policyname LIKE '%admin%' OR policyname LIKE '%role%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop specific policies by name (in case the above doesn't catch them all)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins and alumni can create alumni records" ON public.alumni;
DROP POLICY IF EXISTS "Officers and admins can create events" ON public.events;
DROP POLICY IF EXISTS "Officers and admins can update events" ON public.events;
DROP POLICY IF EXISTS "Members can view events" ON public.events;
DROP POLICY IF EXISTS "Admins and officers can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can check themselves in" ON public.attendance;
DROP POLICY IF EXISTS "Officers and admins can create channels" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can view channels" ON public.channels;
DROP POLICY IF EXISTS "Officers and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "Officers and admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;

-- Drop triggers that might use the function
DROP TRIGGER IF EXISTS check_task_assignment_on_insert ON public.tasks;
DROP TRIGGER IF EXISTS check_task_assignment_on_update ON public.tasks;

-- Step 3: Drop the has_role function that depends on the old enum
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Step 4: Update user_roles table to use new enum
-- First, drop the default constraint
ALTER TABLE public.user_roles 
  ALTER COLUMN role DROP DEFAULT;

-- Step 5: Map old values to new values (convert to text first)
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE text USING role::text;

UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'officer' THEN 'e_board'
  ELSE role
END;

-- Step 6: Change column type to new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new USING role::public.app_role_new;

-- Step 7: Restore the default with the new enum type
ALTER TABLE public.user_roles 
  ALTER COLUMN role SET DEFAULT 'member'::public.app_role_new;

-- Step 8: Drop old enum (CASCADE will handle any remaining dependencies)
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Step 9: Rename new enum to app_role
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 10: Recreate has_role function with renamed enum
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

-- Step 11: Recreate policies that were dropped
-- Recreate "Authenticated users can view roles" policy
CREATE POLICY "Authenticated users can view roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Recreate "Admins can manage roles" policy
CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Recreate "Members can view events" policy
CREATE POLICY "Members can view events"
    ON public.events FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Recreate "Admins can delete events" policy
CREATE POLICY "Admins can delete events"
    ON public.events FOR DELETE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR created_by = auth.uid()
    );

-- Recreate "Admins and alumni can create alumni records" policy
CREATE POLICY "Admins and alumni can create alumni records"
    ON public.alumni FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'alumni'::public.app_role)
    );

-- Recreate attendance policies
CREATE POLICY "Authenticated users can view attendance"
    ON public.attendance FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can check themselves in"
    ON public.attendance FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Recreate channels policies
CREATE POLICY "Authenticated users can view channels"
    ON public.channels FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Step 12: Add visibility and sharing fields to documents table
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'shared')),
  ADD COLUMN IF NOT EXISTS shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  ADD COLUMN IF NOT EXISTS shared_with_roles text[] DEFAULT ARRAY[]::text[];

-- Step 13: Update existing documents to be private by default
UPDATE public.documents 
SET visibility = 'private' 
WHERE visibility IS NULL;

-- Step 14: Create new document visibility policies
-- (Old policies were already dropped in Step 2)
-- View policy: Users can see public documents, their own private documents, and documents shared with them
CREATE POLICY "Users can view visible documents"
    ON public.documents FOR SELECT
    TO authenticated
    USING (
        -- Public documents (visible to all)
        visibility = 'public'
        OR
        -- Own documents
        created_by = auth.uid()
        OR
        -- Documents shared with user
        (visibility = 'shared' AND auth.uid() = ANY(shared_with))
        OR
        -- Documents shared with user's role
        (
            visibility = 'shared' 
            AND EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role::text = ANY(shared_with_roles)
            )
        )
        OR
        -- E-Board and admins can see all documents
        (
            public.has_role(auth.uid(), 'admin'::public.app_role)
            OR public.has_role(auth.uid(), 'e_board'::public.app_role)
        )
    );

-- Create policy: E-Board and admins can create public documents, everyone can create private/shared
CREATE POLICY "Users can create documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            -- E-Board and admins can create public documents
            (visibility = 'public' AND (
                public.has_role(auth.uid(), 'admin'::public.app_role)
                OR public.has_role(auth.uid(), 'e_board'::public.app_role)
            ))
            OR
            -- Everyone can create private documents
            visibility = 'private'
            OR
            -- Everyone can create shared documents
            visibility = 'shared'
        )
    );

-- Update policy: Users can update their own documents, E-Board and admins can update any
CREATE POLICY "Users can update documents"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Delete policy: Users can delete their own documents, admins can delete any
CREATE POLICY "Users can delete documents"
    ON public.documents FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
    );

-- Step 15: Update all RLS policies that reference 'officer' to use 'e_board'
-- Events policies
-- (Old policies were already dropped in Step 2)
CREATE POLICY "E-Board and admins can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
        OR public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    );

CREATE POLICY "E-Board and admins can update events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
        OR created_by = auth.uid()
    );

-- Attendance policies
-- (Old policy was already dropped in Step 2)
CREATE POLICY "Admins and E-Board can manage attendance"
    ON public.attendance FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Channels policies
-- (Old policy was already dropped in Step 2)
CREATE POLICY "E-Board and admins can create channels"
    ON public.channels FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Task assignment policies (recreate function and triggers)
CREATE OR REPLACE FUNCTION public.check_task_assignment_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    IF NOT (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'e_board'::public.app_role) OR
      public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    ) THEN
      RAISE EXCEPTION 'Only E-Board, admins, and committee chairmen can assign tasks to members';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_task_assignment_on_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_task_assignment_permission();

CREATE TRIGGER check_task_assignment_on_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to)
  EXECUTE FUNCTION public.check_task_assignment_permission();

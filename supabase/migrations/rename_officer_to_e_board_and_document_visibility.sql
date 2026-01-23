-- Rename officer role to e_board and add document visibility/sharing
-- This migration handles the complete role rename and document visibility system

-- Step 1: Create new enum with e_board instead of officer
CREATE TYPE public.app_role_new AS ENUM (
    'admin',
    'e_board',
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
  WHEN role = 'officer' THEN 'e_board'
  ELSE role
END;

-- Step 4: Change column type to new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role_new USING role::public.app_role_new;

-- Step 5: Drop old enum and rename new one
DROP TYPE IF EXISTS public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 6: Update has_role function
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

-- Step 7: Add visibility and sharing fields to documents table
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'shared')),
  ADD COLUMN IF NOT EXISTS shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  ADD COLUMN IF NOT EXISTS shared_with_roles text[] DEFAULT ARRAY[]::text[];

-- Step 8: Update existing documents to be private by default
UPDATE public.documents 
SET visibility = 'private' 
WHERE visibility IS NULL;

-- Step 9: Drop old document policies
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Officers and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "Officers and admins can update documents" ON public.documents;

-- Step 10: Create new document visibility policies
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

-- Step 11: Update all RLS policies that reference 'officer' to use 'e_board'
-- Events policies
DROP POLICY IF EXISTS "Officers and admins can create events" ON public.events;
CREATE POLICY "E-Board and admins can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
        OR public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    );

DROP POLICY IF EXISTS "Officers and admins can update events" ON public.events;
CREATE POLICY "E-Board and admins can update events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
        OR created_by = auth.uid()
    );

-- Attendance policies
DROP POLICY IF EXISTS "Admins and officers can manage attendance" ON public.attendance;
CREATE POLICY "Admins and E-Board can manage attendance"
    ON public.attendance FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Channels policies
DROP POLICY IF EXISTS "Officers and admins can create channels" ON public.channels;
CREATE POLICY "E-Board and admins can create channels"
    ON public.channels FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Task assignment policies (update the function)
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

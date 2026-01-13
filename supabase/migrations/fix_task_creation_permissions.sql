-- Fix task creation permissions: Allow all authenticated users to create tasks
-- This migration ensures the correct RLS policy is in place

-- Step 1: Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Officers and admins can create tasks" ON public.tasks;

-- Step 2: Create/Replace the policy that allows all authenticated users to create tasks
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
CREATE POLICY "Authenticated users can create tasks" 
    ON public.tasks FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

-- Step 3: Ensure the trigger only blocks assignment, not task creation
-- The trigger should already be correct, but let's verify it allows null assigned_to
CREATE OR REPLACE FUNCTION public.check_task_assignment_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only check permissions if assigned_to is being set (not null)
  -- This allows anyone to create unassigned tasks
  IF NEW.assigned_to IS NOT NULL THEN
    -- Check if user is admin, officer, or committee_chairman
    IF NOT (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'officer'::public.app_role) OR
      public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    ) THEN
      -- User doesn't have permission to assign tasks
      RAISE EXCEPTION 'Only officers, admins, and committee chairmen can assign tasks to members. You can create the task without assigning it.';
    END IF;
  END IF;
  
  -- If assigned_to is null, allow the operation (anyone can create unassigned tasks)
  RETURN NEW;
END;
$$;

-- Step 4: Recreate triggers to ensure they're using the updated function
DROP TRIGGER IF EXISTS check_task_assignment_on_insert ON public.tasks;
CREATE TRIGGER check_task_assignment_on_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_task_assignment_permission();

DROP TRIGGER IF EXISTS check_task_assignment_on_update ON public.tasks;
CREATE TRIGGER check_task_assignment_on_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to)
  EXECUTE FUNCTION public.check_task_assignment_permission();

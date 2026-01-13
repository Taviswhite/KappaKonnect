-- Restrict task assignment to only officers, admins, and committee chairmen
-- This trigger ensures that only authorized users can set assigned_to when creating/updating tasks

CREATE OR REPLACE FUNCTION public.check_task_assignment_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If assigned_to is being set (not null), check if user has permission
  IF NEW.assigned_to IS NOT NULL THEN
    -- Check if user is admin, officer, or committee_chairman
    IF NOT (
      public.has_role(auth.uid(), 'admin'::public.app_role) OR
      public.has_role(auth.uid(), 'officer'::public.app_role) OR
      public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    ) THEN
      -- User doesn't have permission to assign tasks
      RAISE EXCEPTION 'Only officers, admins, and committee chairmen can assign tasks to members';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS check_task_assignment_on_insert ON public.tasks;
CREATE TRIGGER check_task_assignment_on_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_task_assignment_permission();

-- Create trigger for UPDATE operations (to prevent unauthorized assignment changes)
DROP TRIGGER IF EXISTS check_task_assignment_on_update ON public.tasks;
CREATE TRIGGER check_task_assignment_on_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to)
  EXECUTE FUNCTION public.check_task_assignment_permission();

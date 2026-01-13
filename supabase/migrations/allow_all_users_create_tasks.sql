-- Allow all authenticated users to create tasks
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Officers and admins can create tasks" ON public.tasks;

-- Create a new policy that allows all authenticated users to create tasks
CREATE POLICY "Authenticated users can create tasks" 
    ON public.tasks FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

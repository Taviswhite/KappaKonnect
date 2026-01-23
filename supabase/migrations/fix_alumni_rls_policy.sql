-- Fix Alumni RLS Policy to ensure authenticated users can view all alumni
-- This migration ensures the RLS policy explicitly allows authenticated users

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can view alumni" ON public.alumni;

-- Recreate with explicit TO authenticated clause
CREATE POLICY "Authenticated users can view alumni"
    ON public.alumni FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Verify RLS is enabled
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

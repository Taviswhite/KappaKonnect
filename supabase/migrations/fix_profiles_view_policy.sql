-- Fix profiles RLS policy to allow all authenticated users to view all profiles
-- This ensures the Members page works for all logged-in users

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create the correct policy: all authenticated users can view all profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

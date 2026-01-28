-- Add phone and bio columns to alumni table for personal info
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS bio text;

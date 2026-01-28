-- Add phone_public column to alumni table for user to opt-in to showing their phone
ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS phone_public boolean DEFAULT false;

-- Add meeting_link column to events table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'meeting_link'
  ) THEN
    ALTER TABLE public.events ADD COLUMN meeting_link text;
  END IF;
END $$;

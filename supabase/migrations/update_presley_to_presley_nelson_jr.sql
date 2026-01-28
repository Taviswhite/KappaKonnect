
-- Fix legacy spelling "Presly Nelson Jr" → "Presley Nelson Jr"
-- This updates the existing record, it does NOT create a new one.

UPDATE public.alumni
SET full_name = 'Presley Nelson Jr'
WHERE full_name ILIKE '%Presly Nelson Jr%'
   OR full_name ILIKE '%Presly%';

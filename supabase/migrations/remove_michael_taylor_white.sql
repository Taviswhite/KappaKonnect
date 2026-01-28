-- Remove \"Michael Taylor\" (but keep \"Michael Taylor-White\") from alumni
-- Safe to run multiple times (DELETE is idempotent)

DELETE FROM public.alumni
WHERE full_name = 'Michael Taylor';


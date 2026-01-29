-- Remove only the duplicate that said "Michael Taylor" (exact). Keep "Michael Taylor White" / "Michael Taylor-White".
-- Safe to run multiple times. Does not delete Michael Taylor-White (2-Xi-23, SiriusXM, Media Production/Journalism).

DELETE FROM public.alumni
WHERE full_name = 'Michael Taylor'
  AND crossing_year = 2023;

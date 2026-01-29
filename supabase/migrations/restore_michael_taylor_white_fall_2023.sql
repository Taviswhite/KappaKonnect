-- Add back the correct Michael Taylor White (2-Xi-23) — the one we should have kept.
-- Only delete the duplicate that said "Michael Taylor"; keep "Michael Taylor White" / "Michael Taylor-White".
-- This restores the Fall 2023 line_order 2 member with career info. Idempotent: skip if already exists.

INSERT INTO public.alumni (
  full_name,
  email,
  graduation_year,
  line_label,
  crossing_year,
  chapter,
  line_order,
  industry,
  current_position,
  current_company,
  location
)
SELECT 'Michael Taylor White', 'michael@example.com', 2025, 'FALL 2023', 2023, 'Xi (Howard University)', 2,
       'Media Production/Journalism', 'Entertainment Producer', 'SiriusXM/The Today Show', 'Atlanta, Georgia'
WHERE NOT EXISTS (
  SELECT 1 FROM public.alumni a
  WHERE a.email = 'michael@example.com' AND a.crossing_year = 2023
);

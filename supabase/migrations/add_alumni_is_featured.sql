-- Add is_featured to alumni for Chapter Advisors / Featured Alumni sections.
-- Admin and e_board can add/remove members via this flag.

ALTER TABLE public.alumni ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Allow admin and e_board to update alumni (e.g. is_featured).
DROP POLICY IF EXISTS "Admins and e_board can update alumni" ON public.alumni;
CREATE POLICY "Admins and e_board can update alumni"
  ON public.alumni FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'e_board'::public.app_role)
  );

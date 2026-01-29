-- Allow alumni to update their own record (career info, location, bio, etc.).
-- Admins and e_board can still update any alumni via "Admins and e_board can update alumni".
-- This ensures career and profile edits from the Alumni Profile page persist.

CREATE POLICY "Alumni can update own record"
  ON public.alumni FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

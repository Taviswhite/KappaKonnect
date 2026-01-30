-- Allow document creators to delete their own docs; E-Board can delete any document.
-- Fixes "can't delete docs" when only admins had delete permission.

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
ON public.documents FOR DELETE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "E-Board can delete documents" ON public.documents;
CREATE POLICY "E-Board can delete documents"
ON public.documents FOR DELETE
USING (has_role(auth.uid(), 'e_board'));

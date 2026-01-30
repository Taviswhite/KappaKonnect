-- Allow all authenticated users to create folders; users can update/delete their own.
-- Replaces "Officers and admins can manage folders" (which used 'officer', now e_board).

DROP POLICY IF EXISTS "Officers and admins can manage folders" ON public.document_folders;

CREATE POLICY "Authenticated users can create folders"
ON public.document_folders FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own folders"
ON public.document_folders FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete own folders"
ON public.document_folders FOR DELETE
USING (created_by = auth.uid());

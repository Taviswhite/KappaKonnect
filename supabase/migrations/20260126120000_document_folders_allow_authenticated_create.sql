-- Allow all authenticated users to create folders; users can update/delete their own.
-- Fixes "create folder not working" when only E-Board/admins policy was applied.

DROP POLICY IF EXISTS "Authenticated users can create folders" ON public.document_folders;
CREATE POLICY "Authenticated users can create folders"
ON public.document_folders FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own folders" ON public.document_folders;
CREATE POLICY "Users can update own folders"
ON public.document_folders FOR UPDATE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete own folders" ON public.document_folders;
CREATE POLICY "Users can delete own folders"
ON public.document_folders FOR DELETE
USING (created_by = auth.uid());

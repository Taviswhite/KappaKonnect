-- Ensure authenticated users can view all documents.
-- Fixes "can't view docs" when RLS was enabled but SELECT policy was missing or restrictive.

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents"
ON public.documents FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

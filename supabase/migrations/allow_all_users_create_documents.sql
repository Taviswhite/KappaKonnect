-- Allow all authenticated users to create documents
-- Previously only admins and E-Board could create documents

DROP POLICY IF EXISTS "Officers and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;

CREATE POLICY "Authenticated users can create documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

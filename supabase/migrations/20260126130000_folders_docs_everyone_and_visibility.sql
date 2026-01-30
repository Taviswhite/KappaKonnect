-- Everyone can create folders and documents.
-- Admin/E-Board can make files visible to all or choose who sees them; everyone can share with specific roles.
-- Add visibility columns and visibility-aware SELECT so users see: own, public, shared with them, and admin/eboard see all.

-- ========== DOCUMENT FOLDERS: Everyone can create; update/delete own ==========
DROP POLICY IF EXISTS "Authenticated users can create folders" ON public.document_folders;
CREATE POLICY "Authenticated users can create folders"
ON public.document_folders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own folders" ON public.document_folders;
CREATE POLICY "Users can update own folders"
ON public.document_folders FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete own folders" ON public.document_folders;
CREATE POLICY "Users can delete own folders"
ON public.document_folders FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ========== DOCUMENTS: Add visibility columns if missing ==========
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'shared')),
  ADD COLUMN IF NOT EXISTS shared_with_roles text[] DEFAULT ARRAY[]::text[];

-- Fix default for existing rows (avoid CHECK violation)
UPDATE public.documents SET visibility = 'private' WHERE visibility IS NULL;

-- ========== DOCUMENTS: Everyone can create ==========
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
CREATE POLICY "Authenticated users can create documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- ========== DOCUMENTS: Who can see what ==========
-- Users see: own docs, public docs, docs shared with their role; admin/eboard see all.
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents"
ON public.documents FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR visibility = 'public'
  OR (
    visibility = 'shared'
    AND COALESCE(shared_with_roles, ARRAY[]::text[]) && COALESCE(
      (SELECT ARRAY_AGG(role::text) FROM public.user_roles WHERE user_id = auth.uid()),
      ARRAY[]::text[]
    )
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'e_board'::public.app_role)
);

-- Verify Documents Table and RLS Policies
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if documents table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- 2. Check RLS policies on documents table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'documents';

-- 3. Test if you can insert (replace with your user_id)
-- SELECT auth.uid(); -- Run this first to get your user_id
-- Then test insert:
-- INSERT INTO public.documents (name, file_type, created_by)
-- VALUES ('Test Document', 'PDF', auth.uid())
-- RETURNING *;

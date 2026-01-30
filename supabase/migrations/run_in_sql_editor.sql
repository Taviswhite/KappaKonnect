-- =============================================================================
-- Run this entire script in Supabase Dashboard → SQL Editor → New query.
-- Safe to run multiple times (idempotent): uses IF NOT EXISTS and DROP IF EXISTS.
-- Requires: app_role enum, user_roles table, has_role() (from 000 or pg_dump).
-- =============================================================================

-- Function needed by triggers (no-op if already exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ===================== TABLES (skip if already exist) =====================
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Ensure user_id exists (000 uses user_id; some migrations use sender_id)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='sender_id') THEN
    UPDATE public.messages SET user_id = sender_id WHERE user_id IS NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'PDF',
  file_size TEXT,
  file_url TEXT,
  folder_id UUID REFERENCES public.document_folders(id) ON DELETE SET NULL,
  requires_signature BOOLEAN DEFAULT false,
  total_signers INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'shared')),
  shared_with_roles TEXT[] DEFAULT ARRAY[]::text[]
);

CREATE TABLE IF NOT EXISTS public.document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  graduation_year INTEGER NOT NULL,
  degree TEXT,
  current_company TEXT,
  current_position TEXT,
  location TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add visibility columns if table existed without them
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS shared_with_roles TEXT[] DEFAULT ARRAY[]::text[];
UPDATE public.documents SET visibility = 'private' WHERE visibility IS NULL;

-- ===================== ENABLE RLS =====================
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- ===================== POLICIES - CHANNELS =====================
DROP POLICY IF EXISTS "Authenticated users can view channels" ON public.channels;
CREATE POLICY "Authenticated users can view channels" ON public.channels FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "E-Board and admins can create channels" ON public.channels;
CREATE POLICY "E-Board and admins can create channels" ON public.channels FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));
DROP POLICY IF EXISTS "E-Board and admins can update channels" ON public.channels;
CREATE POLICY "E-Board and admins can update channels" ON public.channels FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board') OR created_by = auth.uid());
DROP POLICY IF EXISTS "Admins can delete channels" ON public.channels;
CREATE POLICY "Admins can delete channels" ON public.channels FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- ===================== POLICIES - MESSAGES =====================
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
CREATE POLICY "Authenticated users can view messages" ON public.messages FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- ===================== POLICIES - DIRECT MESSAGES =====================
DROP POLICY IF EXISTS "Users can view their own DMs" ON public.direct_messages;
CREATE POLICY "Users can view their own DMs" ON public.direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Users can send DMs" ON public.direct_messages;
CREATE POLICY "Users can send DMs" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can delete their sent DMs" ON public.direct_messages;
CREATE POLICY "Users can delete their sent DMs" ON public.direct_messages FOR DELETE USING (auth.uid() = sender_id);

-- ===================== POLICIES - DOCUMENTS =====================
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR visibility = 'public'
  OR (visibility = 'shared' AND COALESCE(shared_with_roles, ARRAY[]::text[]) && COALESCE((SELECT ARRAY_AGG(role::text) FROM public.user_roles WHERE user_id = auth.uid()), ARRAY[]::text[]))
  OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board')
);
DROP POLICY IF EXISTS "E-Board and admins can create documents" ON public.documents;
CREATE POLICY "E-Board and admins can create documents" ON public.documents FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
CREATE POLICY "Authenticated users can create documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "E-Board and admins can update documents" ON public.documents;
CREATE POLICY "E-Board and admins can update documents" ON public.documents FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board') OR created_by = auth.uid());
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (created_by = auth.uid());
DROP POLICY IF EXISTS "E-Board can delete documents" ON public.documents;
CREATE POLICY "E-Board can delete documents" ON public.documents FOR DELETE USING (has_role(auth.uid(), 'e_board'));

-- ===================== POLICIES - DOCUMENT FOLDERS =====================
DROP POLICY IF EXISTS "Authenticated users can view folders" ON public.document_folders;
CREATE POLICY "Authenticated users can view folders" ON public.document_folders FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "E-Board and admins can manage folders" ON public.document_folders;
CREATE POLICY "E-Board and admins can manage folders" ON public.document_folders FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));
DROP POLICY IF EXISTS "Authenticated users can create folders" ON public.document_folders;
CREATE POLICY "Authenticated users can create folders" ON public.document_folders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can update own folders" ON public.document_folders;
CREATE POLICY "Users can update own folders" ON public.document_folders FOR UPDATE USING (created_by = auth.uid());
DROP POLICY IF EXISTS "Users can delete own folders" ON public.document_folders;
CREATE POLICY "Users can delete own folders" ON public.document_folders FOR DELETE USING (created_by = auth.uid());

-- ===================== POLICIES - DOCUMENT SIGNATURES =====================
DROP POLICY IF EXISTS "Authenticated users can view signatures" ON public.document_signatures;
CREATE POLICY "Authenticated users can view signatures" ON public.document_signatures FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can sign documents" ON public.document_signatures;
CREATE POLICY "Users can sign documents" ON public.document_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================== POLICIES - ALUMNI =====================
DROP POLICY IF EXISTS "Authenticated users can view alumni" ON public.alumni;
CREATE POLICY "Authenticated users can view alumni" ON public.alumni FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "E-Board and admins can manage alumni" ON public.alumni;
CREATE POLICY "E-Board and admins can manage alumni" ON public.alumni FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));
DROP POLICY IF EXISTS "E-Board and admins can update alumni" ON public.alumni;
CREATE POLICY "E-Board and admins can update alumni" ON public.alumni FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));
DROP POLICY IF EXISTS "Admins can delete alumni" ON public.alumni;
CREATE POLICY "Admins can delete alumni" ON public.alumni FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- ===================== TRIGGERS (drop first so re-run is safe) =====================
DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_alumni_updated_at ON public.alumni;
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON public.alumni FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== REALTIME (ignore error if already added) =====================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

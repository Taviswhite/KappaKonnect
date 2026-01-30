
-- =====================
-- CHAT TABLES
-- =====================

-- Channels table for group chats
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table for chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- DOCUMENTS TABLES
-- =====================

-- Document folders
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents table
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

-- Document signatures tracking
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- =====================
-- ALUMNI TABLE
-- =====================

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

-- =====================
-- ENABLE RLS
-- =====================

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES - CHANNELS
-- =====================

CREATE POLICY "Authenticated users can view channels"
ON public.channels FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can create channels" ON public.channels;
DROP POLICY IF EXISTS "E-Board and admins can create channels" ON public.channels;
CREATE POLICY "E-Board and admins can create channels"
ON public.channels FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));

DROP POLICY IF EXISTS "Officers and admins can update channels" ON public.channels;
DROP POLICY IF EXISTS "E-Board and admins can update channels" ON public.channels;
CREATE POLICY "E-Board and admins can update channels"
ON public.channels FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board') OR created_by = auth.uid());

CREATE POLICY "Admins can delete channels"
ON public.channels FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES - MESSAGES
-- =====================

CREATE POLICY "Authenticated users can view messages"
ON public.messages FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id OR has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES - DIRECT MESSAGES
-- =====================

CREATE POLICY "Users can view their own DMs"
ON public.direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send DMs"
ON public.direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their sent DMs"
ON public.direct_messages FOR DELETE
USING (auth.uid() = sender_id);

-- =====================
-- RLS POLICIES - DOCUMENTS
-- =====================

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents"
ON public.documents FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "E-Board and admins can create documents" ON public.documents;
CREATE POLICY "E-Board and admins can create documents"
ON public.documents FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));

-- Everyone can create documents (own files; admin/eboard can set visibility to public)
DROP POLICY IF EXISTS "Authenticated users can create documents" ON public.documents;
CREATE POLICY "Authenticated users can create documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "E-Board and admins can update documents" ON public.documents;
CREATE POLICY "E-Board and admins can update documents"
ON public.documents FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board') OR created_by = auth.uid());

CREATE POLICY "Admins can delete documents"
ON public.documents FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Users can delete documents they created; E-Board can delete any
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
ON public.documents FOR DELETE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "E-Board can delete documents" ON public.documents;
CREATE POLICY "E-Board can delete documents"
ON public.documents FOR DELETE
USING (has_role(auth.uid(), 'e_board'));

-- =====================
-- RLS POLICIES - DOCUMENT FOLDERS
-- =====================

CREATE POLICY "Authenticated users can view folders"
ON public.document_folders FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can manage folders" ON public.document_folders;
DROP POLICY IF EXISTS "E-Board and admins can manage folders" ON public.document_folders;
CREATE POLICY "E-Board and admins can manage folders"
ON public.document_folders FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));

-- Allow any authenticated user to create folders; users can update/delete their own
CREATE POLICY "Authenticated users can create folders"
ON public.document_folders FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own folders"
ON public.document_folders FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Users can delete own folders"
ON public.document_folders FOR DELETE
USING (created_by = auth.uid());

-- =====================
-- RLS POLICIES - DOCUMENT SIGNATURES
-- =====================

CREATE POLICY "Authenticated users can view signatures"
ON public.document_signatures FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can sign documents"
ON public.document_signatures FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================
-- RLS POLICIES - ALUMNI
-- =====================

CREATE POLICY "Authenticated users can view alumni"
ON public.alumni FOR SELECT
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can manage alumni" ON public.alumni;
DROP POLICY IF EXISTS "E-Board and admins can manage alumni" ON public.alumni;
CREATE POLICY "E-Board and admins can manage alumni"
ON public.alumni FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));

DROP POLICY IF EXISTS "Officers and admins can update alumni" ON public.alumni;
DROP POLICY IF EXISTS "E-Board and admins can update alumni" ON public.alumni;
CREATE POLICY "E-Board and admins can update alumni"
ON public.alumni FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'e_board'));

CREATE POLICY "Admins can delete alumni"
ON public.alumni FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- =====================
-- TRIGGERS FOR UPDATED_AT
-- =====================

CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alumni_updated_at
BEFORE UPDATE ON public.alumni
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- ENABLE REALTIME FOR CHAT
-- =====================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

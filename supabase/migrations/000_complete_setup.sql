-- ============================================
-- KAPPAKONNECT COMPLETE DATABASE SETUP
-- ============================================
-- This is a consolidated migration file that ensures
-- all tables, functions, and policies are created correctly.
-- Run this in Supabase SQL Editor if migrations fail.
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Create app_role enum (updated version)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'admin',
      'e_board',
      'committee_chairman',
      'member',
      'alumni'
    );
  END IF;
END $$;

-- ============================================
-- CORE TABLES (Create tables first, then functions)
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    avatar_url text,
    graduation_year integer,
    committee text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    linkedin_url text,
    bio text,
    crossing_year integer,
    line_name text,
    chapter text
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
    UNIQUE(user_id, role)
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    location text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    event_type text DEFAULT 'meeting'::text,
    meeting_link text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    assigned_to uuid REFERENCES auth.users(id),
    due_date timestamp with time zone,
    status text DEFAULT 'todo'::text CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority text DEFAULT 'medium'::text CHECK (priority IN ('low', 'medium', 'high')),
    committee text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    checked_in_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    status text DEFAULT 'going'::text NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- ============================================
-- CHAT TABLES
-- ============================================

-- Channels table
CREATE TABLE IF NOT EXISTS public.channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    is_private boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- DOCUMENT TABLES
-- ============================================

-- Document folders table
CREATE TABLE IF NOT EXISTS public.document_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    file_type text NOT NULL DEFAULT 'PDF',
    file_size text,
    file_url text,
    folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL,
    requires_signature boolean DEFAULT false,
    total_signers integer DEFAULT 0,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Document signatures table
CREATE TABLE IF NOT EXISTS public.document_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    signed_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(document_id, user_id)
);

-- ============================================
-- ALUMNI TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.alumni (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    email text,
    graduation_year integer NOT NULL,
    degree text,
    current_company text,
    current_position text,
    location text,
    linkedin_url text,
    avatar_url text,
    industry text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- FUNCTIONS (Create after tables exist)
-- ============================================

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps (idempotent: drop first so re-runs don't fail)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - USER ROLES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============================================
-- RLS POLICIES - EVENTS
-- ============================================

DROP POLICY IF EXISTS "Members can view events" ON public.events;
CREATE POLICY "Members can view events"
    ON public.events FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can create events" ON public.events;
DROP POLICY IF EXISTS "E-Board and admins can create events" ON public.events;
CREATE POLICY "E-Board and admins can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) 
        OR public.has_role(auth.uid(), 'e_board'::public.app_role) 
        OR public.has_role(auth.uid(), 'committee_chairman'::public.app_role)
    );

DROP POLICY IF EXISTS "Officers and admins can update events" ON public.events;
DROP POLICY IF EXISTS "E-Board and admins can update events" ON public.events;
CREATE POLICY "E-Board and admins can update events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) 
        OR public.has_role(auth.uid(), 'e_board'::public.app_role) 
        OR created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
    ON public.events FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR created_by = auth.uid());

-- ============================================
-- RLS POLICIES - TASKS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "Authenticated users can view tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "All users can create tasks" ON public.tasks;
CREATE POLICY "All users can create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (created_by = auth.uid() OR assigned_to = auth.uid());

-- ============================================
-- RLS POLICIES - ATTENDANCE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
CREATE POLICY "Authenticated users can view attendance"
    ON public.attendance FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can check themselves in" ON public.attendance;
CREATE POLICY "Users can check themselves in"
    ON public.attendance FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and officers can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins and E-Board can manage attendance" ON public.attendance;
CREATE POLICY "Admins and E-Board can manage attendance"
    ON public.attendance FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role) 
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- ============================================
-- RLS POLICIES - RSVPS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view RSVPs" ON public.rsvps;
CREATE POLICY "Authenticated users can view RSVPs"
    ON public.rsvps FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create own RSVP" ON public.rsvps;
CREATE POLICY "Users can create own RSVP"
    ON public.rsvps FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own RSVP" ON public.rsvps;
CREATE POLICY "Users can update own RSVP"
    ON public.rsvps FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - CHANNELS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view channels" ON public.channels;
CREATE POLICY "Authenticated users can view channels"
    ON public.channels FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can create channels" ON public.channels;
DROP POLICY IF EXISTS "E-Board and admins can create channels" ON public.channels;
CREATE POLICY "E-Board and admins can create channels"
    ON public.channels FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) 
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- ============================================
-- RLS POLICIES - MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
CREATE POLICY "Authenticated users can view messages"
    ON public.messages FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
CREATE POLICY "Authenticated users can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - DOCUMENTS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents"
    ON public.documents FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Officers and admins can create documents" ON public.documents;
DROP POLICY IF EXISTS "E-Board and admins can create documents" ON public.documents;
CREATE POLICY "Authenticated users can create documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES - ALUMNI
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view alumni" ON public.alumni;
CREATE POLICY "Authenticated users can view alumni"
    ON public.alumni FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins and alumni can create alumni records" ON public.alumni;
CREATE POLICY "Admins and alumni can create alumni records"
    ON public.alumni FOR INSERT
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role) 
        OR public.has_role(auth.uid(), 'alumni'::public.app_role)
    );

-- ============================================
-- COMPLETE!
-- ============================================

-- Verify tables were created
DO $$
DECLARE
    table_count integer;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'profiles', 'user_roles', 'events', 'tasks', 'attendance', 
        'rsvps', 'channels', 'messages', 'direct_messages', 
        'documents', 'document_folders', 'document_signatures', 'alumni'
    );
    
    RAISE NOTICE 'Created % tables successfully', table_count;
END $$;
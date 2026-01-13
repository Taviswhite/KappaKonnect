CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'officer',
    'committee_chair',
    'member',
    'advisor'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
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
  
  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid NOT NULL,
    checked_in_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    event_type text DEFAULT 'meeting'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    payment_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
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


--
-- Name: rsvps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rsvps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid NOT NULL,
    status text DEFAULT 'going'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rsvps_status_check CHECK ((status = ANY (ARRAY['going'::text, 'maybe'::text, 'not_going'::text])))
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    assigned_to uuid,
    due_date timestamp with time zone,
    status text DEFAULT 'todo'::text,
    priority text DEFAULT 'medium'::text,
    committee text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'completed'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL
);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_user_id_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_user_id_event_id_key UNIQUE (user_id, event_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: rsvps rsvps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_pkey PRIMARY KEY (id);


--
-- Name: rsvps rsvps_user_id_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_user_id_event_id_key UNIQUE (user_id, event_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance attendance_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rsvps rsvps_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: rsvps rsvps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvps
    ADD CONSTRAINT rsvps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: attendance Admins and officers can manage attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and officers can manage attendance" ON public.attendance TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'officer'::public.app_role)));


--
-- Name: events Admins can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR (created_by = auth.uid())));


--
-- Name: payments Admins can manage all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all payments" ON public.payments TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rsvps Authenticated users can view RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view RSVPs" ON public.rsvps FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: attendance Authenticated users can view attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view attendance" ON public.attendance FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: user_roles Authenticated users can view roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view roles" ON public.user_roles FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: tasks Authenticated users can view tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: events Members can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view events" ON public.events FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: events Officers and admins can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Officers and admins can create events" ON public.events FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'officer'::public.app_role) OR public.has_role(auth.uid(), 'committee_chair'::public.app_role)));


--
-- Name: tasks Officers and admins can create tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Officers and admins can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'officer'::public.app_role) OR public.has_role(auth.uid(), 'committee_chair'::public.app_role)));


--
-- Name: events Officers and admins can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Officers and admins can update events" ON public.events FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'officer'::public.app_role) OR (created_by = auth.uid())));


--
-- Name: attendance Users can check themselves in; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can check themselves in" ON public.attendance FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: rsvps Users can manage their own RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own RSVPs" ON public.rsvps TO authenticated USING ((auth.uid() = user_id));


--
-- Name: tasks Users can update assigned tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE TO authenticated USING (((assigned_to = auth.uid()) OR (created_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: payments Users can view own payments, admins can view all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own payments, admins can view all" ON public.payments FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Users can view profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'officer'::public.app_role)));


--
-- Name: attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: rsvps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;
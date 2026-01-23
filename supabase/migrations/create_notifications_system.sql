-- Create notifications table and system
-- This migration creates the notifications table and sets up RLS policies

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'announcement' CHECK (type IN ('announcement', 'event', 'task', 'message', 'member', 'system')),
    link text,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Step 2: Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled boolean DEFAULT true,
    push_enabled boolean DEFAULT false,
    events_enabled boolean DEFAULT true,
    tasks_enabled boolean DEFAULT true,
    messages_enabled boolean DEFAULT true,
    members_enabled boolean DEFAULT true,
    announcements_enabled boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Step 3: Create push subscription table for PWA notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, endpoint)
);

-- Step 4: Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for notifications
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- E-Board and admins can create notifications (announcements)
CREATE POLICY "E-Board and admins can create notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'e_board'::public.app_role)
    );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Step 6: RLS Policies for notification preferences
CREATE POLICY "Users can manage own preferences"
    ON public.notification_preferences FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Step 7: RLS Policies for push subscriptions
CREATE POLICY "Users can manage own push subscriptions"
    ON public.push_subscriptions FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Step 8: Function to create notification for all users (for announcements)
CREATE OR REPLACE FUNCTION public.create_announcement(
    _title text,
    _message text,
    _link text DEFAULT NULL,
    _created_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _user_id uuid;
BEGIN
    -- Check if user has permission (E-Board or admin)
    IF NOT (
        public.has_role(_created_by, 'admin'::public.app_role)
        OR public.has_role(_created_by, 'e_board'::public.app_role)
    ) THEN
        RAISE EXCEPTION 'Only E-Board and admins can create announcements';
    END IF;

    -- Create notification for all users
    FOR _user_id IN SELECT id FROM auth.users
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type, link, created_by)
        VALUES (_user_id, _title, _message, 'announcement', _link, _created_by);
    END LOOP;
END;
$$;

-- Step 9: Function to create notification for specific users
CREATE OR REPLACE FUNCTION public.create_notification(
    _user_id uuid,
    _title text,
    _message text,
    _type text DEFAULT 'system',
    _link text DEFAULT NULL,
    _created_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _notification_id uuid;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, link, created_by)
    VALUES (_user_id, _title, _message, _type, _link, _created_by)
    RETURNING id INTO _notification_id;
    
    RETURN _notification_id;
END;
$$;

-- Step 10: Trigger to update notification_preferences updated_at
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_preferences_updated_at();

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

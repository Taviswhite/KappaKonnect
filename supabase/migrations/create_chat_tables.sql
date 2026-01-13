-- Create chat channels table
CREATE TABLE IF NOT EXISTS public.channels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_pinned boolean DEFAULT false,
    is_private boolean DEFAULT false
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create channel members table (for private channels and member tracking)
CREATE TABLE IF NOT EXISTS public.channel_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    last_read_at timestamp with time zone,
    UNIQUE(channel_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels
CREATE POLICY "Anyone can view public channels"
    ON public.channels FOR SELECT
    USING (is_private = false OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create channels"
    ON public.channels FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels"
    ON public.channels FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in accessible channels"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.channels
            WHERE channels.id = messages.channel_id
            AND (channels.is_private = false OR channels.created_by = auth.uid())
        )
    );

CREATE POLICY "Authenticated users can send messages"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.channels
            WHERE channels.id = messages.channel_id
            AND (channels.is_private = false OR channels.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
    ON public.messages FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for channel_members
CREATE POLICY "Users can view channel members"
    ON public.channel_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.channels
            WHERE channels.id = channel_members.channel_id
            AND (channels.is_private = false OR channels.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can join channels"
    ON public.channel_members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default "general" channel
INSERT INTO public.channels (name, description, is_private, created_by)
SELECT 'general', 'General discussion channel', false, id
FROM auth.users
LIMIT 1
ON CONFLICT (name) DO NOTHING;

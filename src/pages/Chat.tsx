import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Hash, Users, Pin, MoreVertical, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateChannelDialog } from "@/components/dialogs/CreateChannelDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_pinned: boolean;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const Chat = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        // Some databases (like your demo project) may not have the is_pinned column,
        // so we only order by created_at to avoid 400 errors from PostgREST.
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Channel[];
    },
  });

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Fetch messages for selected channel
  const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ["messages", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      
      try {
        // First fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("channel_id", selectedChannelId)
          .order("created_at", { ascending: true });
        
        if (messagesError) {
          // If table doesn't exist, return empty array
          if (messagesError.code === "42P01") {
            console.warn("Messages table doesn't exist yet. Run the chat migration.");
            return [];
          }
          throw messagesError;
        }
        if (!messagesData || messagesData.length === 0) return [];

        // Then fetch profiles for each message
        const userIds = [...new Set(messagesData.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        // Combine messages with profiles
        const messagesWithProfiles = messagesData.map(msg => ({
          ...msg,
          profiles: profilesData?.find(p => p.user_id === msg.user_id) || null,
        }));

        return messagesWithProfiles as Message[];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!selectedChannelId,
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedChannelId) return;

    const channel = supabase
      .channel(`messages:${selectedChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${selectedChannelId}`,
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data: messageData } = await supabase
            .from("messages")
            .select("*")
            .eq("id", payload.new.id)
            .single();

          if (messageData) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("user_id, full_name, avatar_url")
              .eq("user_id", messageData.user_id)
              .single();

            const newMessage: Message = {
              ...messageData,
              profiles: profileData || null,
            };

            queryClient.setQueryData(["messages", selectedChannelId], (old: Message[] = []) => {
              if (!old.find((m) => m.id === newMessage.id)) {
                return [...old, newMessage];
              }
              return old;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannelId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChannelId || !user) throw new Error("Missing channel or user");
      
      const { data, error } = await supabase.from("messages").insert({
        channel_id: selectedChannelId,
        user_id: user.id,
        content: content.trim(),
      }).select().single();
      
      if (error) {
        // Check if table doesn't exist
        if (error.code === "42P01") {
          throw new Error("Messages table doesn't exist. Please run the chat migration.");
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChannelId] });
    },
    onError: (error: Error) => {
      if (error.message.includes("table doesn't exist")) {
        toast.error("Chat tables not set up. Please run the migration first.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      console.error("Error sending message:", error);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChannelId || !user) return;
    sendMessageMutation.mutate(message);
  };

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Sidebar */}
        <div className="w-64 glass-card rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats..." 
                className="pl-10 bg-secondary/50"
                onChange={() => toast.info("Search functionality coming soon!")}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-3">
            {/* Channels */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Channels
                </span>
                <CreateChannelDialog
                  onChannelCreated={() => {
                    queryClient.invalidateQueries({ queryKey: ["channels"] });
                  }}
                >
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <span className="text-lg">+</span>
                  </Button>
                </CreateChannelDialog>
              </div>
              {channelsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-secondary/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : channels.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">
                  No channels yet. Create one to get started!
                </p>
              ) : (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left",
                      selectedChannelId === channel.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Hash className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{channel.name}</span>
                      {/* Only show pin icon if the column exists in this project */}
                      {channel.is_pinned && <Pin className="w-3 h-3" />}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 glass-card rounded-xl flex flex-col overflow-hidden">
          {selectedChannel ? (
            <>
              {/* Header */}
              <div className="h-16 px-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h2 className="font-display font-bold text-foreground">{selectedChannel.name}</h2>
                    {selectedChannel.description && (
                      <p className="text-xs text-muted-foreground">{selectedChannel.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast.info("Channel members coming soon!")}
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast.info("Pin channel coming soon!")}
                  >
                    <Pin className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast.info("Channel options coming soon!")}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={messagesContainerRef}>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/30 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
                          <div className="h-4 w-full bg-secondary/30 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messagesError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">Error loading messages. Check console for details.</p>
                      <p className="text-xs text-muted-foreground mt-2">Make sure the messages table exists.</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 group">
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {msg.profiles?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {msg.profiles?.full_name || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-foreground/90 mt-1 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast.info("File attachments coming soon!")}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder={`Message #${selectedChannel.name}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-secondary/50"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toast.info("Emoji picker coming soon!")}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Hash className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">No Channel Selected</h3>
                <p className="text-muted-foreground">
                  {channels.length === 0
                    ? "Create a channel to get started!"
                    : "Select a channel from the sidebar"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;

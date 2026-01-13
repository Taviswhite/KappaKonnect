import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Hash, Users, Pin, MoreVertical, Smile, Paperclip, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles:sender_id(full_name, avatar_url)")
        .eq("channel_id", selectedChannelId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChannelId,
  });

  // Fetch profiles for DMs
  const { data: members = [] } = useQuery({
    queryKey: ["chat-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .neq("user_id", user?.id || "")
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set first channel as default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedChannelId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${selectedChannelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", selectedChannelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannelId, queryClient]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !selectedChannelId) throw new Error("Not authenticated or no channel selected");
      const { error } = await supabase.from("messages").insert({
        channel_id: selectedChannelId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChannelId] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage.mutate(message.trim());
    }
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
              <Input placeholder="Search chats..." className="pl-10 bg-secondary/50" />
            </div>
          </div>

          <ScrollArea className="flex-1 p-3">
            {/* Channels */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Channels
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast.info("Create channel coming soon!")}>
                  <span className="text-lg">+</span>
                </Button>
              </div>
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">No channels yet</p>
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
                  </button>
                ))
              )}
            </div>

            {/* Direct Messages */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Direct Messages
                </span>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">No members</p>
              ) : (
                members.map((member) => (
                  <button
                    key={member.user_id}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left hover:bg-secondary"
                    onClick={() => toast.info("Direct messages coming soon!")}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{member.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm">{member.full_name}</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 glass-card rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="font-display font-bold text-foreground">
                  {selectedChannel?.name || "Select a channel"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChannel?.description || "No description"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Pin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to send a message!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg: any) => (
                  <div key={msg.id} className="flex items-start gap-3 group">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {msg.profiles?.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {msg.profiles?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "h:mm a")}
                        </span>
                      </div>
                      <p className="text-foreground/90 mt-1">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder={`Message #${selectedChannel?.name || "channel"}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-secondary/50"
              />
              <Button variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="hero" size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;

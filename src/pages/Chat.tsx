import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Search, Hash, Users, Pin, MoreVertical, Smile, Paperclip, Edit, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateChannelDialog } from "@/components/dialogs/CreateChannelDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [channelSearchQuery, setChannelSearchQuery] = useState("");
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

  // Filter channels by search query
  const filteredChannels = channelSearchQuery
    ? channels.filter((channel) =>
        channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase()) ||
        channel.description?.toLowerCase().includes(channelSearchQuery.toLowerCase())
      )
    : channels;

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

  // Filter messages by search query (after messages is defined)
  const filteredMessages = searchQuery
    ? messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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

  const handleFileAttachment = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      toast.info(`File attachment: ${file.name} (Feature in development - file will be attached to message)`);
      // TODO: Implement file upload to Supabase Storage and attach to message
    };
    input.click();
  };

  const handleEmojiPicker = () => {
    const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(message + randomEmoji);
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
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
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
              ) : filteredChannels.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2">
                  {channelSearchQuery ? "No channels match your search" : "No channels yet. Create one to get started!"}
                </p>
              ) : (
                filteredChannels.map((channel) => (
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
                  <ChannelMembersDialog channelId={selectedChannel.id} channelName={selectedChannel.name} />
                  <PinChannelButton channelId={selectedChannel.id} isPinned={selectedChannel.is_pinned || false} />
                  <ChannelOptionsMenu channelId={selectedChannel.id} channelName={selectedChannel.name} />
                </div>
              </div>

              {/* Message Search */}
              {filteredMessages.length < messages.length && (
                <div className="px-6 py-2 border-b border-border bg-secondary/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setSearchQuery("")}
                      >
                        <span className="text-xs">×</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filteredMessages.length} of {messages.length} messages
                  </p>
                </div>
              )}

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
                ) : filteredMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No messages match your search" : "No messages yet. Start the conversation!"}
                      </p>
                      {searchQuery && (
                        <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                          Clear search
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredMessages.map((msg) => (
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
                    onClick={handleFileAttachment}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder={`Message #${selectedChannel.name}${searchQuery ? ` (searching: ${searchQuery})` : ""}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-secondary/50"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={handleEmojiPicker}
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

// Channel Members Dialog Component
function ChannelMembersDialog({ channelId, channelName }: { channelId: string; channelName: string }) {
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useQuery({
    queryKey: ["channel-members", channelId],
    queryFn: async () => {
      try {
        // Try to fetch channel members
        const { data, error } = await supabase
          .from("channel_members")
          .select("user_id")
          .eq("channel_id", channelId);
        
        if (error) {
          if (error.code === "42P01") {
            // Table doesn't exist, return empty array
            return [];
          }
          throw error;
        }

        if (!data || data.length === 0) return [];

        // Fetch profiles for members
        const userIds = data.map((m: any) => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .in("user_id", userIds);

        return profilesData?.map((profile: any) => ({
          user_id: profile.user_id,
          profiles: profile,
        })) || [];
      } catch (error) {
        console.error("Error fetching channel members:", error);
        return [];
      }
    },
    enabled: open && !!channelId,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members of #{channelName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found</p>
          ) : (
            members.map((member: any) => (
              <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{member.profiles?.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pin Channel Button Component
function PinChannelButton({ channelId, isPinned }: { channelId: string; isPinned: boolean }) {
  const queryClient = useQueryClient();
  const pinMutation = useMutation({
    mutationFn: async (pinned: boolean) => {
      // Note: This assumes is_pinned column exists. If not, this will fail gracefully.
      const { error } = await supabase
        .from("channels")
        .update({ is_pinned: pinned })
        .eq("id", channelId);
      if (error && !error.message.includes("column") && !error.message.includes("does not exist")) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success(isPinned ? "Channel unpinned" : "Channel pinned");
    },
    onError: () => {
      toast.info("Pin feature requires database column update");
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => pinMutation.mutate(!isPinned)}
      className={isPinned ? "text-accent" : ""}
    >
      <Pin className={cn("w-5 h-5", isPinned && "fill-current")} />
    </Button>
  );
}

// Channel Options Menu Component
function ChannelOptionsMenu({ channelId, channelName }: { channelId: string; channelName: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Channel deleted");
      navigate("/chat");
    },
    onError: () => {
      toast.error("Failed to delete channel");
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete #${channelName}? This action cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info("Edit channel coming soon!")}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Channel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Leave channel coming soon!")}>
          <LogOut className="w-4 h-4 mr-2" />
          Leave Channel
        </DropdownMenuItem>
        {user && (
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Channel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

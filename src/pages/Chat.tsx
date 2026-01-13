import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Hash, Users, Pin, MoreVertical, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

const channels = [
  { id: 1, name: "general", unread: 3, type: "channel" },
  { id: 2, name: "announcements", unread: 0, type: "channel", pinned: true },
  { id: 3, name: "executive-board", unread: 1, type: "channel" },
  { id: 4, name: "social-committee", unread: 0, type: "channel" },
  { id: 5, name: "service-committee", unread: 5, type: "channel" },
];

const directMessages = [
  { id: 1, name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", online: true, unread: 2 },
  { id: 2, name: "David Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", online: true, unread: 0 },
  { id: 3, name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100", online: false, unread: 0 },
];

const messages = [
  {
    id: 1,
    user: { name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    content: "Hey everyone! Don't forget about the chapter meeting tonight at 7 PM.",
    time: "2:30 PM",
    reactions: [{ emoji: "👍", count: 5 }, { emoji: "✅", count: 3 }],
  },
  {
    id: 2,
    user: { name: "David Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    content: "Thanks for the reminder! I'll be there. Also, I have the budget report ready to present.",
    time: "2:35 PM",
    reactions: [],
  },
  {
    id: 3,
    user: { name: "James Davis", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    content: "Great! We'll go through the budget first, then discuss the upcoming community service event. Make sure to bring any ideas you have for spring initiatives.",
    time: "2:38 PM",
    reactions: [{ emoji: "🔥", count: 2 }],
  },
  {
    id: 4,
    user: { name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100" },
    content: "I've been working on the alumni networking event proposal. Should I share it tonight?",
    time: "2:45 PM",
    reactions: [{ emoji: "👍", count: 4 }],
  },
];

const Chat = () => {
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [message, setMessage] = useState("");

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
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <span className="text-lg">+</span>
                </Button>
              </div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.name)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left",
                    selectedChannel === channel.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Hash className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{channel.name}</span>
                  {channel.pinned && <Pin className="w-3 h-3" />}
                  {channel.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Direct Messages */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Direct Messages
                </span>
              </div>
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left hover:bg-secondary"
                >
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={dm.avatar} />
                      <AvatarFallback className="text-xs">{dm.name[0]}</AvatarFallback>
                    </Avatar>
                    {dm.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">{dm.name}</span>
                  {dm.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {dm.unread}
                    </span>
                  )}
                </button>
              ))}
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
                <h2 className="font-display font-bold text-foreground">{selectedChannel}</h2>
                <p className="text-xs text-muted-foreground">42 members</p>
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
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={msg.user.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {msg.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{msg.user.name}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-foreground/90 mt-1">{msg.content}</p>
                    {msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {msg.reactions.map((reaction, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-sm"
                          >
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder={`Message #${selectedChannel}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-secondary/50"
              />
              <Button variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="hero" size="icon">
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

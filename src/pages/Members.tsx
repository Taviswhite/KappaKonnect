import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Mail, Phone, Grid, List, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const members = [
  {
    id: 1,
    name: "James Davis",
    role: "President",
    email: "james.davis@email.com",
    phone: "(555) 123-4567",
    year: "Senior",
    committee: "Executive Board",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Vice President",
    email: "marcus.j@email.com",
    phone: "(555) 234-5678",
    year: "Senior",
    committee: "Executive Board",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    id: 3,
    name: "David Williams",
    role: "Treasurer",
    email: "david.w@email.com",
    phone: "(555) 345-6789",
    year: "Junior",
    committee: "Finance",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
  {
    id: 4,
    name: "Alex Thompson",
    role: "Secretary",
    email: "alex.t@email.com",
    phone: "(555) 456-7890",
    year: "Junior",
    committee: "Executive Board",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200",
  },
  {
    id: 5,
    name: "Michael Brown",
    role: "Social Chair",
    email: "michael.b@email.com",
    phone: "(555) 567-8901",
    year: "Sophomore",
    committee: "Social",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    id: 6,
    name: "Chris Martinez",
    role: "Service Chair",
    email: "chris.m@email.com",
    phone: "(555) 678-9012",
    year: "Junior",
    committee: "Service",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
];

const roleColors: Record<string, string> = {
  President: "bg-primary/20 text-primary border-primary/30",
  "Vice President": "bg-primary/20 text-primary border-primary/30",
  Treasurer: "bg-accent/20 text-accent border-accent/30",
  Secretary: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Social Chair": "bg-green-500/20 text-green-400 border-green-500/30",
  "Service Chair": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const Members = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.committee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground mt-1">Directory of all chapter members</p>
          </div>
          <Button variant="hero" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Members", value: 48 },
            { label: "Active", value: 45 },
            { label: "Alumni", value: 120 },
            { label: "New This Year", value: 8 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Members Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-display">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {member.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn("text-xs mt-1", roleColors[member.role] || "bg-muted")}
                    >
                      {member.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {member.year} • {member.committee}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {member.email}
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {member.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-display font-semibold text-foreground">Member</th>
                  <th className="text-left p-4 font-display font-semibold text-foreground">Role</th>
                  <th className="text-left p-4 font-display font-semibold text-foreground">Committee</th>
                  <th className="text-left p-4 font-display font-semibold text-foreground">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-primary">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={cn("text-xs", roleColors[member.role] || "bg-muted")}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{member.committee}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Members;

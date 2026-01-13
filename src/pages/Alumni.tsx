import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Mail, Linkedin, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const alumni = [
  {
    id: 1,
    name: "Robert Mitchell",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    graduationYear: 2020,
    company: "Goldman Sachs",
    position: "Investment Analyst",
    location: "New York, NY",
    email: "robert.m@email.com",
    linkedin: "linkedin.com/in/robertm",
    chapter: "Alpha",
    willing_to_mentor: true,
  },
  {
    id: 2,
    name: "William Carter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    graduationYear: 2018,
    company: "Google",
    position: "Software Engineer",
    location: "San Francisco, CA",
    email: "william.c@email.com",
    linkedin: "linkedin.com/in/williamc",
    chapter: "Alpha",
    willing_to_mentor: true,
  },
  {
    id: 3,
    name: "Daniel Foster",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    graduationYear: 2015,
    company: "McKinsey & Company",
    position: "Senior Consultant",
    location: "Chicago, IL",
    email: "daniel.f@email.com",
    linkedin: "linkedin.com/in/danielf",
    chapter: "Beta",
    willing_to_mentor: false,
  },
  {
    id: 4,
    name: "Christopher Lee",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    graduationYear: 2022,
    company: "JPMorgan Chase",
    position: "Financial Analyst",
    location: "New York, NY",
    email: "chris.lee@email.com",
    linkedin: "linkedin.com/in/chrislee",
    chapter: "Alpha",
    willing_to_mentor: true,
  },
];

const upcomingEvents = [
  { id: 1, title: "Alumni Networking Night", date: "Jan 22, 2026", location: "Downtown Hotel" },
  { id: 2, title: "Career Panel Discussion", date: "Feb 5, 2026", location: "Virtual" },
  { id: 3, title: "Homecoming Weekend", date: "Mar 15, 2026", location: "Campus" },
];

const Alumni = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Alumni Portal</h1>
            <p className="text-muted-foreground mt-1">Connect with brothers who came before</p>
          </div>
          <Button variant="hero" size="sm">
            Invite Alumni
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Alumni", value: "1,250+" },
            { label: "Active Mentors", value: "85" },
            { label: "Chapters Represented", value: "12" },
            { label: "Career Fields", value: "50+" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-lg p-4 text-center">
              <p className="text-2xl font-display font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alumni Directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search alumni..." className="pl-10 bg-secondary/50" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {alumni.map((alum, index) => (
                <div
                  key={alum.id}
                  className="glass-card rounded-xl p-6 hover:scale-[1.01] transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={alum.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-display">
                        {alum.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground">{alum.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-secondary/50">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Class of {alum.graduationYear}
                            </Badge>
                            {alum.willing_to_mentor && (
                              <Badge variant="outline" className="text-xs bg-accent/20 text-accent border-accent/30">
                                Open to Mentor
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Linkedin className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {alum.position} at <span className="text-foreground font-medium">{alum.company}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {alum.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Alumni Events */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-secondary/30">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">Top Industries</h2>
              <div className="space-y-3">
                {[
                  { industry: "Finance & Banking", count: 320 },
                  { industry: "Technology", count: 280 },
                  { industry: "Consulting", count: 190 },
                  { industry: "Healthcare", count: 140 },
                  { industry: "Law", count: 120 },
                ].map((item) => (
                  <div key={item.industry} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.industry}</span>
                    <span className="text-sm font-medium text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Alumni;

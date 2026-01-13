import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Mail, Linkedin, MapPin, Briefcase, GraduationCap, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { CreateAlumniDialog } from "@/components/dialogs/CreateAlumniDialog";

const Alumni = () => {
  // Fetch alumni
  const { data: alumni = [], isLoading: alumniLoading } = useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni")
        .select("*")
        .order("graduation_year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch upcoming alumni events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["alumni-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalAlumni = alumni.length;
  const industries = alumni.reduce((acc: Record<string, number>, alum) => {
    if (alum.industry) {
      acc[alum.industry] = (acc[alum.industry] || 0) + 1;
    }
    return acc;
  }, {});
  const topIndustries = Object.entries(industries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Alumni Portal</h1>
            <p className="text-muted-foreground mt-1">Connect with brothers who came before</p>
          </div>
          <CreateAlumniDialog 
            trigger={<Button variant="hero" size="sm">Add Alumni</Button>}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Alumni", value: totalAlumni.toString() },
            { label: "Industries", value: Object.keys(industries).length.toString() },
            { label: "Locations", value: [...new Set(alumni.map(a => a.location).filter(Boolean))].length.toString() },
            { label: "Companies", value: [...new Set(alumni.map(a => a.current_company).filter(Boolean))].length.toString() },
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
              <Button variant="outline" size="sm" onClick={() => toast.info("Filter coming soon!")}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {alumniLoading ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                Loading alumni...
              </div>
            ) : alumni.length === 0 ? (
              <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p>No alumni registered yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alumni.map((alum, index) => (
                  <div
                    key={alum.id}
                    className="glass-card rounded-xl p-6 hover:scale-[1.01] transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary">
                        <AvatarImage src={alum.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-display">
                          {alum.full_name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display font-bold text-lg text-foreground">{alum.full_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-secondary/50">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Class of {alum.graduation_year}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {alum.email && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`mailto:${alum.email}`)}>
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            {alum.linkedin_url && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(alum.linkedin_url, "_blank")}>
                                <Linkedin className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {(alum.current_position || alum.current_company) && (
                            <p className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              {alum.current_position}{alum.current_position && alum.current_company && " at "}
                              {alum.current_company && <span className="text-foreground font-medium">{alum.current_company}</span>}
                            </p>
                          )}
                          {alum.location && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {alum.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Alumni Events */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-secondary/30">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.start_time), "MMM d, yyyy")}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">Top Industries</h2>
              {topIndustries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No industry data</p>
              ) : (
                <div className="space-y-3">
                  {topIndustries.map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{industry}</span>
                      <span className="text-sm font-medium text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Alumni;

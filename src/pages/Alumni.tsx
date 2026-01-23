import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Mail, Linkedin, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateAlumniDialog } from "@/components/dialogs/CreateAlumniDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";

const Alumni = () => {
  const [search, setSearch] = useState("");
  const { hasRole, user } = useAuth();

  // Check if user can add alumni (admin or alumni role)
  const canAddAlumni = hasRole("admin") || hasRole("alumni");

  // Fetch alumni from database (alumni table)
  const { data: alumni = [], isLoading, error: alumniError } = useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      if (!user) {
        console.warn("User not authenticated - RLS will block query");
        return [];
      }
      
      const { data, error } = await supabase
        .from("alumni")
        .select("*")
        .order("graduation_year", { ascending: false });
      
      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === "42P01") {
          console.warn("Alumni table does not exist");
          return [];
        }
        // RLS policy violation
        if (error.code === "42501" || error.message?.includes("permission denied")) {
          console.error("RLS policy blocked query. User:", user.id);
          throw new Error("Permission denied. Make sure you're logged in.");
        }
        console.error("Error fetching alumni:", error);
        throw error;
      }
      
      // Deduplicate by email or id (keep first occurrence)
      if (data) {
        const seen = new Set<string>();
        const deduplicated = data.filter((alum) => {
          const key = alum.email || alum.id;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        return deduplicated;
      }
      
      return data || [];
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["alumni-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title, start_time, location")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Filter alumni by search
  const filteredAlumni = (alumni || []).filter((alum) =>
    alum.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    alum.email?.toLowerCase().includes(search.toLowerCase()) ||
    alum.current_company?.toLowerCase().includes(search.toLowerCase()) ||
    alum.current_position?.toLowerCase().includes(search.toLowerCase()) ||
    alum.industry?.toLowerCase().includes(search.toLowerCase()) ||
    alum.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats
  const totalAlumni = alumni.length;
  const activeMentors = alumni.filter((a) => a.linkedin_url).length;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Alumni Portal</h1>
            <p className="text-muted-foreground mt-1">Connect with brothers who came before</p>
          </div>
          {canAddAlumni && (
            <CreateAlumniDialog>
              <Button variant="hero" size="sm">
                Add Alumni
              </Button>
            </CreateAlumniDialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">{totalAlumni}</p>
            <p className="text-sm text-muted-foreground">Total Alumni</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">{activeMentors}</p>
            <p className="text-sm text-muted-foreground">With LinkedIn</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">
              {new Set(alumni.map((a) => a.industry).filter(Boolean)).size}
            </p>
            <p className="text-sm text-muted-foreground">Industries</p>
          </div>
          <div className="glass-card rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold gradient-text">
              {upcomingEvents.length}
            </p>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
          </div>
        </div>

        {!user && (
          <div className="glass-card rounded-xl p-6 border-yellow-500/30 border-2 bg-yellow-500/10">
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">
              ⚠️ Please log in to view alumni
            </p>
            <p className="text-sm text-muted-foreground">
              The alumni directory requires authentication. Please sign in to view alumni profiles.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alumni Directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search alumni..."
                  className="pl-10 bg-secondary/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-6 h-32 bg-secondary/30 animate-pulse" />
                ))}
              </div>
            ) : alumniError ? (
              <div className="glass-card rounded-xl p-12 text-center border-destructive border-2">
                <p className="text-destructive font-semibold mb-2">Error loading alumni</p>
                <p className="text-sm text-muted-foreground">{alumniError.message}</p>
                <p className="text-xs text-muted-foreground mt-2">Check browser console for details</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">No Alumni Found</h3>
                <p className="text-muted-foreground mb-2">
                  {search ? "Try a different search term" : "No alumni profiles yet"}
                </p>
                {!search && alumni.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Database shows 34 records. Check console for query details.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlumni.map((alum, index) => (
                  <div
                    key={alum.id}
                    className="glass-card rounded-xl p-6 hover:scale-[1.01] transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={alum.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-display">
                        {alum.full_name?.split(" ").map((n: string) => n[0]).join("") || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground">{alum.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {alum.graduation_year && (
                              <Badge variant="outline" className="text-xs bg-secondary/50">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Class of {alum.graduation_year}
                              </Badge>
                            )}
                            {alum.linkedin_url && (
                              <Badge variant="outline" className="text-xs bg-accent/20 text-accent border-accent/30">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alum.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.location.href = `mailto:${alum.email}`}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          {alum.linkedin_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(alum.linkedin_url!, "_blank")}
                            >
                              <Linkedin className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {alum.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-foreground font-medium">{alum.email}</span>
                          </p>
                        )}
                        {alum.current_company && alum.current_position && (
                          <p className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            <span className="text-foreground font-medium">
                              {alum.current_position} at {alum.current_company}
                            </span>
                          </p>
                        )}
                        {alum.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-foreground font-medium">{alum.location}</span>
                          </p>
                        )}
                        {alum.industry && (
                          <p className="flex items-center gap-2">
                            <span className="text-foreground font-medium">{alum.industry}</span>
                          </p>
                        )}
                        {alum.degree && (
                          <p className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-foreground font-medium">{alum.degree}</span>
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
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 rounded-lg bg-secondary/30">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(event.start_time), "MMM d, yyyy")}
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Alumni;

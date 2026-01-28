import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { SendAnnouncementDialog } from "@/components/dialogs/SendAnnouncementDialog";
import { CreateEventDialog } from "@/components/dialogs/CreateEventDialog";
import { Users, Calendar, Megaphone, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showErrorToast } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import {
  DashboardPreferences,
  DashboardSectionKey,
  getDashboardOrder,
  getDashboardPreferences,
} from "@/lib/dashboard-preferences";
import { FeaturedAlumni } from "@/components/dashboard/FeaturedAlumni";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TaskList } from "@/components/dashboard/TaskList";
import { AttendanceCheckInCard } from "@/components/dashboard/AttendanceCheckInCard";
import { EBoardCard } from "@/components/dashboard/EBoardCard";
import { LeadershipCard } from "@/components/dashboard/LeadershipCard";
import { fetchAlumniList } from "@/lib/alumni-data";

const Index = () => {
  const { profile, hasRole, user } = useAuth();
  const navigate = useNavigate();

  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>(
    () => getDashboardPreferences(user?.id),
  );
  const [dashboardOrder, setDashboardOrder] = useState<DashboardSectionKey[]>(
    () => getDashboardOrder(user?.id),
  );

  useEffect(() => {
    setDashboardPreferences(getDashboardPreferences(user?.id));
    setDashboardOrder(getDashboardOrder(user?.id));
  }, [user?.id]);

  const firstName = useMemo(
    () => profile?.full_name?.split(" ")[0] || "Member",
    [profile?.full_name]
  );

  const canViewSensitiveStats =
    hasRole("admin") || hasRole("e_board") || hasRole("committee_chairman");

  // Alumni list shared with Alumni page so counts always match
  const {
    data: alumniList = [],
    error: alumniError,
    isLoading: alumniLoading,
  } = useQuery({
    queryKey: ["alumni"],
    queryFn: () => fetchAlumniList(user),
    enabled: !!user,
  });

  if (alumniError) {
    showErrorToast(alumniError, "Failed to load alumni count");
  }

  const alumniCount = alumniList.length;

  // Active members stat should match Members page "Active" count
  const { data: activeMemberCount = 0, error: memberStatsError } = useQuery({
    queryKey: ["member-active-count"],
    queryFn: async () => {
      // Fetch all profiles (same as Members page)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (profilesError) {
        throw profilesError;
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        throw rolesError;
      }

      const adminUserIds = new Set(
        rolesData?.filter((r) => r.role === "admin").map((r) => r.user_id) ||
          [],
      );

      // Apply same admin exclusion + dedupe by user_id as Members page
      const seen = new Set<string>();
      const filteredProfiles =
        profilesData?.filter((profile: any) => {
          if (adminUserIds.has(profile.user_id)) {
            return false;
          }
          if (seen.has(profile.user_id)) {
            return false;
          }
          seen.add(profile.user_id);
          return true;
        }) ?? [];

      const getRoleForUser = (userId: string) => {
        const role = rolesData?.find((r) => r.user_id === userId);
        return role?.role || "member";
      };

      const activeMembers = filteredProfiles.filter(
        (m: any) => getRoleForUser(m.user_id) !== "alumni",
      ).length;

      return activeMembers;
    },
    enabled: canViewSensitiveStats,
  });

  if (memberStatsError) {
    showErrorToast(memberStatsError, "Failed to load member stats");
  }

  return (
    <AppLayout>
      <div className="space-y-8 sm:space-y-10">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Welcome back, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening in your chapter today.
          </p>
        </div>

        {/* Ordered dashboard sections */}
        {dashboardOrder
          .filter((key) => dashboardPreferences[key])
          .map((key) => {
            switch (key) {
              case "stats":
                return (
                  <section key={key}>
                    <div
                      className={`grid grid-cols-2 ${
                        canViewSensitiveStats ? "lg:grid-cols-2" : "lg:grid-cols-1"
                      } gap-4 md:gap-6`}
                    >
                      {canViewSensitiveStats && (
                        <StatCard
                          title="Active Members"
                          value={activeMemberCount}
                          change="Matches Members page active count"
                          changeType="neutral"
                          icon={Users}
                          iconColor="primary"
                        />
                      )}
                      <StatCard
                        title="Alumni Network"
                        value={alumniCount}
                        change="Total alumni profiles"
                        changeType="neutral"
                        icon={Calendar}
                        iconColor="accent"
                      />
                    </div>
                  </section>
                );
              case "quickActions":
                return (
                  <section key={key}>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
                      Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                      <CreateEventDialog>
                        <button
                          className="group glass-card rounded-xl p-4 sm:p-5 flex items-center gap-4 card-hover card-press text-left"
                          aria-label="Add event"
                        >
                          <div className="icon-container icon-container-primary group-hover:scale-105 transition-transform duration-150">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Add Event</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Schedule a new chapter event
                            </p>
                          </div>
                        </button>
                      </CreateEventDialog>
                      <CreateEventDialog>
                        <button
                          className="group glass-card rounded-xl p-4 sm:p-5 flex items-center gap-4 card-hover card-press text-left border border-border hover:border-primary/20 transition-colors duration-150"
                          aria-label="Schedule meeting"
                        >
                          <div className="icon-container icon-container-accent group-hover:scale-105 transition-transform duration-150">
                            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Schedule Meeting</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Create a chapter or committee meeting
                            </p>
                          </div>
                        </button>
                      </CreateEventDialog>
                      <SendAnnouncementDialog>
                        <Button
                          variant="ghost"
                          className="group h-auto w-full justify-start glass-card rounded-xl p-4 sm:p-5 flex items-center gap-4 card-hover card-press border border-border hover:border-primary/20 transition-colors duration-150"
                        >
                          <div className="icon-container icon-container-accent group-hover:scale-105 transition-transform duration-150">
                            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Send Announcement</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Notify all members
                            </p>
                          </div>
                        </Button>
                      </SendAnnouncementDialog>
                    </div>
                  </section>
                );
              case "advisors":
                return (
                  <section key={key}>
                    <LeadershipCard />
                  </section>
                );
              case "upcomingEvents":
                return (
                  <section key={key}>
                    <UpcomingEvents />
                  </section>
                );
              case "attendanceCheckIn":
                return (
                  <section key={key}>
                    <AttendanceCheckInCard />
                  </section>
                );
              case "featuredAlumni":
                return (
                  <section key={key}>
                    <FeaturedAlumni />
                  </section>
                );
              case "taskList":
                return (
                  <section key={key}>
                    <TaskList />
                  </section>
                );
              case "recentActivity":
                return (
                  <section key={key}>
                    <RecentActivity />
                  </section>
                );
              case "eBoard":
                return null;
              default:
                return null;
            }
          })}
      </div>
    </AppLayout>
  );
};

export default Index;

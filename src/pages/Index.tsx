import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { TaskList } from "@/components/dashboard/TaskList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, Calendar, CheckSquare, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showErrorToast } from "@/lib/error-handler";

const Index = () => {
  const { profile, hasRole, user } = useAuth();
  const navigate = useNavigate();
  
  // Memoize firstName computation
  const firstName = useMemo(() => {
    return profile?.full_name?.split(" ")[0] || "Member";
  }, [profile?.full_name]);
  
  // Check if user has elevated privileges (admin, E-Board, or committee chair)
  const canViewSensitiveStats = hasRole("admin") || hasRole("e_board") || hasRole("committee_chairman");

  // Fetch upcoming events count
  const { data: upcomingEventsCount = 0, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ["upcoming-events-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("start_time", new Date().toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Handle errors
  if (eventsError) {
    showErrorToast(eventsError, "Failed to load events");
  }

  // Fetch next event title
  const { data: nextEvent, error: nextEventError } = useQuery({
    queryKey: ["next-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  if (nextEventError) {
    showErrorToast(nextEventError, "Failed to load next event");
  }

  // Fetch open tasks count (tasks not completed, assigned to current user or created by them)
  const { data: openTasksData, error: tasksError } = useQuery({
    queryKey: ["open-tasks-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, dueTodayCount: 0 };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Use safer query builder method instead of template string
      const { data, error } = await supabase
        .from("tasks")
        .select("id, due_date, status")
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .neq("status", "completed");
      
      if (error) throw error;
      
      const openTasks = data || [];
      const dueTodayCount = openTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < tomorrow;
      }).length;

      return { count: openTasks.length, dueTodayCount };
    },
    enabled: !!user?.id,
  });

  if (tasksError) {
    showErrorToast(tasksError, "Failed to load tasks");
  }

  // Fetch member count (admin/officer only)
  const { data: memberCount = 0, error: memberCountError } = useQuery({
    queryKey: ["member-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled: canViewSensitiveStats,
  });

  if (memberCountError) {
    showErrorToast(memberCountError, "Failed to load member count");
  }


  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
            Welcome back, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here's what's happening in your chapter today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 ${canViewSensitiveStats ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3 sm:gap-4 md:gap-6`}>
          {canViewSensitiveStats && (
            <StatCard
              title="Active Members"
              value={memberCount}
              change="Total registered"
              changeType="neutral"
              icon={Users}
              iconColor="primary"
            />
          )}
          <StatCard
            title="Upcoming Events"
            value={upcomingEventsCount}
            change={nextEvent?.title ? `Next: ${nextEvent.title}` : "No upcoming events"}
            changeType="neutral"
            icon={Calendar}
            iconColor="accent"
          />
          <StatCard
            title="Open Tasks"
            value={openTasksData?.count || 0}
            change={openTasksData?.dueTodayCount ? `${openTasksData.dueTodayCount} due today` : "No tasks due today"}
            changeType={openTasksData?.dueTodayCount ? "negative" : "neutral"}
            icon={CheckSquare}
            iconColor="primary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Events */}
          <div className="lg:col-span-2">
            <UpcomingEvents />
          </div>

          {/* Right Column - Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TaskList />
          
          {/* Quick Actions */}
          <div className="glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
            <h2 className="text-lg sm:text-xl font-display font-bold text-foreground mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button 
                onClick={() => navigate("/events")}
                className="p-3 sm:p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all group"
                aria-label="Create new event"
              >
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Create Event</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Schedule a new event</p>
              </button>
              <button 
                onClick={() => navigate("/tasks")}
                className="p-3 sm:p-4 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all group"
                aria-label="Add new task"
              >
                <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Add Task</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Assign a new task</p>
              </button>
              <button 
                onClick={() => navigate("/attendance")}
                className="p-3 sm:p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all group"
                aria-label="Check in for attendance"
              >
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Check In</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">QR attendance</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
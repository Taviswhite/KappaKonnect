import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { TaskList } from "@/components/dashboard/TaskList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Users, Calendar, CheckSquare, DollarSign, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { profile, hasRole } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Member";
  
  // Check if user has elevated privileges (admin, officer, or committee chair)
  const canViewSensitiveStats = hasRole("admin") || hasRole("officer") || hasRole("committee_chair");

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
        <div className={`grid grid-cols-2 ${canViewSensitiveStats ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-3 sm:gap-4 md:gap-6`}>
          {canViewSensitiveStats && (
            <StatCard
              title="Active Members"
              value={48}
              change="+3 this semester"
              changeType="positive"
              icon={Users}
              iconColor="primary"
            />
          )}
          <StatCard
            title="Upcoming Events"
            value={12}
            change="Next: Chapter Meeting"
            changeType="neutral"
            icon={Calendar}
            iconColor="accent"
          />
          <StatCard
            title="Open Tasks"
            value={8}
            change="2 due today"
            changeType="negative"
            icon={CheckSquare}
            iconColor="primary"
          />
          {canViewSensitiveStats && (
            <StatCard
              title="Dues Collected"
              value="$12,450"
              change="85% collected"
              changeType="positive"
              icon={DollarSign}
              iconColor="accent"
            />
          )}
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
              <button className="p-3 sm:p-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all group">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Create Event</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Schedule a new event</p>
              </button>
              <button className="p-3 sm:p-4 rounded-lg bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all group">
                <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Add Task</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Assign a new task</p>
              </button>
              <button className="p-3 sm:p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all group">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">Check In</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">QR attendance</p>
              </button>
              <button className="p-3 sm:p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all group">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-foreground text-sm sm:text-base">View Reports</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Analytics dashboard</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

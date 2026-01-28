import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Bell,
  Palette,
  Lock,
  Save,
  AlertTriangle,
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  GraduationCap,
  Activity,
  ListTodo,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardPreferences,
  DashboardSectionKey,
  getDashboardOrder,
  getDashboardPreferences,
  resetDashboardPreferences,
  updateDashboardOrder,
  updateDashboardPreferences,
} from "@/lib/dashboard-preferences";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const [preferences, setPreferences] = useState({
    theme: theme || "system",
    language: "en",
    timezone: "America/New_York",
  });

  // Sync preferences with theme
  useEffect(() => {
    if (mounted && theme) {
      setPreferences((p) => ({ ...p, theme: theme }));
    }
  }, [theme, mounted]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    events: true,
    payments: true,
    tasks: true,
  });

  const [privacy, setPrivacy] = useState({
    showEmail: true,
    showPhone: false,
    showProfile: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionAlerts: true,
  });

  const [dashboardPreferences, setDashboardPreferences] =
    useState<DashboardPreferences>(() => getDashboardPreferences(user?.id));
  const [dashboardOrder, setDashboardOrder] = useState<DashboardSectionKey[]>(
    () => getDashboardOrder(user?.id),
  );

  useEffect(() => {
    setDashboardPreferences(getDashboardPreferences(user?.id));
    setDashboardOrder(getDashboardOrder(user?.id));
  }, [user?.id]);

  const handleSavePreferences = () => {
    // Update theme immediately when changed
    if (preferences.theme && setTheme) {
      setTheme(preferences.theme);
    }
    toast({
      title: "Preferences Updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been saved.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been saved.",
    });
  };

  const handleDashboardToggle = (key: keyof DashboardPreferences, value: boolean) => {
    if (!user?.id) {
      setDashboardPreferences((prev) => ({ ...prev, [key]: value }));
      return;
    }
    const next = updateDashboardPreferences(user.id, (prev) => ({
      ...prev,
      [key]: value,
    }));
    setDashboardPreferences(next);
  };

  const handleResetDashboard = () => {
    if (!user?.id) return;
    resetDashboardPreferences(user.id);
    setDashboardPreferences(getDashboardPreferences(user.id));
    toast({
      title: "Dashboard reset",
      description: "Your dashboard layout has been reset to the default view.",
    });
  };

  const moveDashboardSection = (key: DashboardSectionKey, direction: "up" | "down") => {
    if (!user?.id) {
      setDashboardOrder((prev) => {
        const index = prev.indexOf(key);
        if (index === -1) return prev;
        const next = [...prev];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= next.length) return prev;
        const [item] = next.splice(index, 1);
        next.splice(newIndex, 0, item);
        return next;
      });
      return;
    }

    const next = updateDashboardOrder(user.id, (prev) => {
      const index = prev.indexOf(key);
      if (index === -1) return prev;
      const arr = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      const [item] = arr.splice(index, 1);
      arr.splice(newIndex, 0, item);
      return arr;
    });
    setDashboardOrder(next);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and security
          </p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={mounted ? (preferences.theme || "system") : "system"}
                      onValueChange={(value) => {
                        setPreferences((p) => ({ ...p, theme: value }));
                        if (setTheme) {
                          setTheme(value);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        setPreferences((p) => ({ ...p, language: value }))
                      }
                    >
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) =>
                        setPreferences((p) => ({ ...p, timezone: value }))
                      }
                    >
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Dashboard Layout
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose which sections appear on your home dashboard.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dashboardOrder.map((key) => {
                      const isFirst = dashboardOrder[0] === key;
                      const isLast = dashboardOrder[dashboardOrder.length - 1] === key;

                      const commonProps = {
                        className:
                          "flex items-center justify-between p-3 rounded-xl bg-secondary/20",
                      };

                      const contentForKey = () => {
                        switch (key) {
                          case "stats":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Stats</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Member, event, and task counts
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() => moveDashboardSection("stats", "up")}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() => moveDashboardSection("stats", "down")}
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.stats}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("stats", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "quickActions":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Quick Actions</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Shortcuts to common tasks
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() =>
                                      moveDashboardSection("quickActions", "up")
                                    }
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("quickActions", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.quickActions}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("quickActions", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "advisors":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Chapter Advisors</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Your advisory team at a glance
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() => moveDashboardSection("advisors", "up")}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("advisors", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.advisors}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("advisors", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "upcomingEvents":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Upcoming Events</Label>
                                    <p className="text-xs text-muted-foreground">
                                      List of upcoming events
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() =>
                                      moveDashboardSection("upcomingEvents", "up")
                                    }
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("upcomingEvents", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.upcomingEvents}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("upcomingEvents", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "attendanceCheckIn":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Attendance Check-In</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Card to open attendance check-in for the next event
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() =>
                                      moveDashboardSection("attendanceCheckIn", "up")
                                    }
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("attendanceCheckIn", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.attendanceCheckIn}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle(
                                        "attendanceCheckIn",
                                        checked,
                                      )
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "featuredAlumni":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Featured Alumni</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Highlighted alumni from your chapter
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() =>
                                      moveDashboardSection("featuredAlumni", "up")
                                    }
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("featuredAlumni", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.featuredAlumni}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("featuredAlumni", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "eBoard":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Executive Board</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Highlight chapter E-board members
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() => moveDashboardSection("eBoard", "up")}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("eBoard", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.eBoard}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("eBoard", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "taskList":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <ListTodo className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">My Tasks</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Your personal task list
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() => moveDashboardSection("taskList", "up")}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("taskList", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.taskList}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("taskList", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          case "recentActivity":
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-primary" />
                                  <div>
                                    <Label className="text-sm">Recent Activity</Label>
                                    <p className="text-xs text-muted-foreground">
                                      Latest updates from your chapter
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isFirst}
                                    onClick={() =>
                                      moveDashboardSection("recentActivity", "up")
                                    }
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={isLast}
                                    onClick={() =>
                                      moveDashboardSection("recentActivity", "down")
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Switch
                                    checked={dashboardPreferences.recentActivity}
                                    onCheckedChange={(checked) =>
                                      handleDashboardToggle("recentActivity", checked)
                                    }
                                  />
                                </div>
                              </>
                            );
                          default:
                            return null;
                        }
                      };

                      return (
                        <div key={key} {...commonProps}>
                          {contentForKey()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetDashboard}
                      disabled={!user}
                    >
                      Reset dashboard to default
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, push: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about upcoming events
                      </p>
                    </div>
                    <Switch
                      checked={notifications.events}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, events: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment due dates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.payments}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, payments: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Task Assignments</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when assigned new tasks
                      </p>
                    </div>
                    <Switch
                      checked={notifications.tasks}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, tasks: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control what information others can see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other members to see your email
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacy((p) => ({ ...p, showEmail: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other members to see your phone
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacy((p) => ({ ...p, showPhone: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to all members
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showProfile}
                      onCheckedChange={(checked) =>
                        setPrivacy((p) => ({ ...p, showProfile: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) =>
                        setSecurity((p) => ({ ...p, twoFactor: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified of new sign-ins to your account
                      </p>
                    </div>
                    <Switch
                      checked={security.sessionAlerts}
                      onCheckedChange={(checked) =>
                        setSecurity((p) => ({ ...p, sessionAlerts: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-secondary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-secondary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-secondary/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSecurity}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-destructive/10">
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
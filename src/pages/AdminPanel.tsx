import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Shield,
  Users,
  Mail,
  Phone,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Megaphone,
  CheckCircle2,
  Activity,
  UserPlus,
  Settings,
  FileBarChart,
  Database,
  ListTodo,
  TrendingUp,
  ChevronRight,
  Bell,
  BarChart3,
  FileText,
  Scale,
  ClipboardList,
} from "lucide-react";
import { ChapterHealthChart } from "@/components/ui/chapter-health-chart";
import { SendAnnouncementDialog } from "@/components/dialogs/SendAnnouncementDialog";
import { cn, formatCrossingDisplay } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditUserRoleDialog } from "@/components/dialogs/EditUserRoleDialog";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  e_board: "bg-primary/20 text-primary border-primary/30",
  committee_chairman: "bg-accent/20 text-accent border-accent/30",
  member: "bg-secondary text-secondary-foreground border-secondary",
  alumni: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

type AppRole = "admin" | "e_board" | "committee_chairman" | "member" | "alumni";

type SystemIssue = { id: string; title: string; detail: string; severity: "low" | "medium" | "high" };

type AdminActivity = { id: string; message: string; timeAgo: string; icon: "user" | "settings" | "report" | "import"; createdAt: number };

type AdminTab = "overview" | "members" | "tasks" | "notifications" | "settings" | "analytics" | "audit" | "violations";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [memberTypeFilter, setMemberTypeFilter] = useState<"all" | "undergraduate" | "alumni">("all");
  const [settingsForm, setSettingsForm] = useState({ chapter_name: "", charter_year: "", semester: "", attendance_threshold_pct: "", dues_amount_cents: "" });
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [newViolation, setNewViolation] = useState({ user_id: "", violation_type: "", description: "", severity: "medium" as string });
  const [scanRunning, setScanRunning] = useState(false);
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Admin and e_board can access; admin account is never shown in member list
  const canAccessAdminPanel = hasRole("admin") || hasRole("e_board");

  // Fetch profiles from database
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch roles
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch attendance records with user and event details
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-records"],
    queryFn: async () => {
      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .order("checked_in_at", { ascending: false })
        .limit(100);
      
      if (attendanceError) throw attendanceError;
      if (!attendanceData || attendanceData.length === 0) return [];

      // Get unique user IDs and event IDs
      const userIds = [...new Set(attendanceData.map(a => a.user_id))];
      const eventIds = [...new Set(attendanceData.map(a => a.event_id))];

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email")
        .in("user_id", userIds);
      
      if (profilesError) throw profilesError;

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, start_time, location")
        .in("id", eventIds);
      
      if (eventsError) throw eventsError;

      // Join the data
      return attendanceData.map(record => ({
        ...record,
        profiles: profilesData?.find(p => p.user_id === record.user_id) || null,
        events: eventsData?.find(e => e.id === record.event_id) || null,
      }));
    },
    enabled: canAccessAdminPanel,
  });

  // Recent events for activity feed
  const { data: recentEvents = [] } = useQuery({
    queryKey: ["admin-recent-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled: canAccessAdminPanel,
  });

  // Recent tasks for activity feed
  const { data: recentTasks = [] } = useQuery({
    queryKey: ["admin-recent-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, created_at, status")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled: canAccessAdminPanel,
  });

  // Upcoming events (for at-a-glance: this week / this month)
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["admin-upcoming-events"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_time, location")
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: canAccessAdminPanel,
  });

  // Overdue tasks count
  const { data: overdueTasksCount = 0 } = useQuery({
    queryKey: ["admin-overdue-tasks"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { count, error } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .lt("due_date", now)
        .neq("status", "completed");
      if (error) throw error;
      return count ?? 0;
    },
    enabled: canAccessAdminPanel,
  });

  // Overdue tasks list (for Tasks & Committees tab)
  const { data: overdueTasksList = [] } = useQuery({
    queryKey: ["admin-overdue-tasks-list"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, status, priority, assigned_to, committee")
        .lt("due_date", now)
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel,
  });

  // All tasks (for Tasks & Committees tab)
  const { data: allTasksList = [] } = useQuery({
    queryKey: ["admin-all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due_date, status, priority, assigned_to, committee, created_at")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel,
  });

  const taskAssigneeName = (userId: string | null) => {
    if (!userId) return "—";
    const p = profiles.find((m: { user_id: string }) => m.user_id === userId);
    return p?.full_name ?? "Unknown";
  };

  // Audit log
  const { data: auditLogEntries = [] } = useQuery({
    queryKey: ["admin-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id, user_id, action_type, target_type, target_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel,
  });

  // Profiles for audit log actors
  const auditActorIds = useMemo(() => [...new Set(auditLogEntries.map((e: { user_id: string }) => e.user_id))], [auditLogEntries]);
  const { data: auditActors = [] } = useQuery({
    queryKey: ["profiles-by-ids", auditActorIds],
    queryFn: async () => {
      if (auditActorIds.length === 0) return [];
      const { data, error } = await supabase.from("profiles").select("user_id, full_name").in("user_id", auditActorIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel && auditActorIds.length > 0,
  });
  const auditActorName = (userId: string) => auditActors.find((p: { user_id: string }) => p.user_id === userId)?.full_name ?? "Unknown";

  // Violations
  const { data: violationsList = [], refetch: refetchViolations } = useQuery({
    queryKey: ["admin-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("violations")
        .select("id, user_id, violation_type, description, severity, created_by, created_at, resolved_at, resolved_by")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel,
  });
  const violationUserIds = useMemo(() => [...new Set(violationsList.map((v: { user_id: string }) => v.user_id))], [violationsList]);
  const { data: violationProfiles = [] } = useQuery({
    queryKey: ["profiles-violations", violationUserIds],
    queryFn: async () => {
      if (violationUserIds.length === 0) return [];
      const { data, error } = await supabase.from("profiles").select("user_id, full_name").in("user_id", violationUserIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canAccessAdminPanel && violationUserIds.length > 0,
  });
  const violationMemberName = (userId: string) => violationProfiles.find((p: { user_id: string }) => p.user_id === userId)?.full_name ?? "Unknown";

  // Latest vulnerability scan (from scanner HTTP server → Edge Function → Supabase)
  const { data: latestVulnScan, refetch: refetchVulnScan } = useQuery({
    queryKey: ["admin-vulnerability-scan-latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vulnerability_scan_results")
        .select("id, created_at, target, issues, summary")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: canAccessAdminPanel,
  });

  const latestScanIssues = useMemo((): SystemIssue[] => {
    const raw = latestVulnScan?.issues;
    if (!Array.isArray(raw)) return [];
    const order = { high: 0, medium: 1, low: 2 };
    return raw
      .map((r: unknown) => {
        const o = r as Record<string, unknown>;
        if (!r || typeof o !== "object" || o.id == null || o.title == null || o.detail == null || o.severity == null)
          return null;
        const s = String(o.severity);
        const severity = (s === "high" || s === "medium" || s === "low" ? s : "low") as "low" | "medium" | "high";
        return { id: String(o.id), title: String(o.title), detail: String(o.detail), severity };
      })
      .filter((x): x is SystemIssue => x !== null)
      .sort((a, b) => order[a.severity] - order[b.severity]);
  }, [latestVulnScan]);

  // System health: API connectivity check (for "System & upcoming issues" card)
  const { isError: apiHealthError, isSuccess: apiHealthOk } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { error } = await supabase.from("profiles").select("user_id").limit(1).maybeSingle();
      if (error) throw error;
      return true;
    },
    enabled: canAccessAdminPanel,
    retry: 1,
    staleTime: 60_000,
  });

  // Chapter settings (single row)
  const { data: chapterSettings, refetch: refetchChapterSettings } = useQuery({
    queryKey: ["admin-chapter-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapter_settings").select("*").limit(1).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: canAccessAdminPanel,
  });

  const getRoleForUser = (userId: string): AppRole => {
    const role = userRoles.find(r => r.user_id === userId);
    return (role?.role as AppRole) || "member";
  };

  const isLoading = profilesLoading || rolesLoading;

  // Filter members
  // Exclude admin account from list so it stays a background account
  const adminUserIds = new Set(
    (userRoles || []).filter((r) => r.role === "admin").map((r) => r.user_id),
  );
  const filteredMembers = profiles.filter((m) => !adminUserIds.has(m.user_id)).filter((m) => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone?.toLowerCase() || "").includes(search.toLowerCase());
    
    const role = getRoleForUser(m.user_id);
    const matchesRole = roleFilter === "all" || role === roleFilter;
    const isAlumni = role === "alumni";
    const matchesMemberType =
      memberTypeFilter === "all" ||
      (memberTypeFilter === "alumni" && isAlumni) ||
      (memberTypeFilter === "undergraduate" && !isAlumni);
    
    return matchesSearch && matchesRole && matchesMemberType;
  });

  // Calculate stats
  const stats = {
    total: profiles.length,
    admins: userRoles.filter(r => r.role === "admin").length,
    e_board: userRoles.filter(r => r.role === "e_board").length,
    members: userRoles.filter(r => r.role === "member").length,
    alumni: userRoles.filter(r => r.role === "alumni").length,
    committee_chairmen: userRoles.filter(r => r.role === "committee_chairman").length,
  };

  // At-a-glance: active = non-alumni, non-admin; alumni; upcoming events; attendance %; overdue; pending
  const atAGlance = useMemo(() => {
    const activeMembers = stats.members + stats.e_board + stats.committee_chairmen;
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(now);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const upcomingThisWeek = upcomingEvents.filter(
      (e) => e.start_time && new Date(e.start_time) <= weekEnd
    ).length;
    const upcomingThisMonth = upcomingEvents.filter(
      (e) => e.start_time && new Date(e.start_time) <= monthEnd
    ).length;
    // Last event attendance: most recent event that has check-ins
    const byEvent = new Map<string, number>();
    attendanceRecords.forEach((r: { event_id: string }) => {
      byEvent.set(r.event_id, (byEvent.get(r.event_id) || 0) + 1);
    });
    let lastEventPct: number | null = null;
    if (byEvent.size > 0 && activeMembers > 0) {
      const maxCheckedIn = Math.max(...byEvent.values());
      lastEventPct = Math.round((maxCheckedIn / activeMembers) * 100);
    }
    return {
      activeMembers,
      alumniCount: stats.alumni,
      upcomingThisWeek,
      upcomingThisMonth,
      lastEventAttendancePct: lastEventPct,
      overdueTasks: overdueTasksCount,
      pendingApprovals: 0,
    };
  }, [stats.members, stats.e_board, stats.committee_chairmen, stats.alumni, upcomingEvents, attendanceRecords, overdueTasksCount]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
    queryClient.invalidateQueries({ queryKey: ["admin-audit-log"] });
    queryClient.invalidateQueries({ queryKey: ["admin-violations"] });
    queryClient.invalidateQueries({ queryKey: ["admin-chapter-settings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overdue-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overdue-tasks-list"] });
    queryClient.invalidateQueries({ queryKey: ["admin-all-tasks"] });
    toast.success("Data refreshed");
  };

  const activities = useMemo((): AdminActivity[] => {
    const raw: { id: string; message: string; createdAt: string; icon: AdminActivity["icon"] }[] = [];
    const recentProfiles = [...profiles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
    recentProfiles.forEach((p) => {
      raw.push({
        id: `profile-${p.id}`,
        message: `New user ${p.full_name || "Unknown"} registered.`,
        createdAt: p.created_at,
        icon: "user",
      });
    });
    recentEvents.forEach((e) => {
      raw.push({
        id: `event-${e.id}`,
        message: `Event '${e.title || "Untitled"}' created.`,
        createdAt: e.created_at,
        icon: "settings",
      });
    });
    attendanceRecords.forEach((r: { id: string; checked_in_at: string; profiles?: { full_name?: string } | null; events?: { title?: string } | null }) => {
      raw.push({
        id: `att-${r.id}`,
        message: `${r.profiles?.full_name || "Someone"} checked in to ${r.events?.title || "event"}.`,
        createdAt: r.checked_in_at,
        icon: "report",
      });
    });
    recentTasks.forEach((t) => {
      raw.push({
        id: `task-${t.id}`,
        message: `Task '${t.title || "Untitled"}' created.`,
        createdAt: t.created_at,
        icon: "import",
      });
    });
    return raw
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 25)
      .map((item) => ({
        ...item,
        timeAgo: formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }),
        createdAt: new Date(item.createdAt).getTime(),
      }));
  }, [profiles, recentEvents, attendanceRecords, recentTasks]);

  const memberAttendanceRate = useMemo(() => {
    const byUser = new Map<string, Set<string>>();
    let totalEventsWithAttendance = 0;
    const eventIds = new Set<string>();
    attendanceRecords.forEach((r: { user_id: string; event_id: string }) => {
      eventIds.add(r.event_id);
      if (!byUser.has(r.user_id)) byUser.set(r.user_id, new Set());
      byUser.get(r.user_id)!.add(r.event_id);
    });
    totalEventsWithAttendance = eventIds.size;
    const rateByUser = new Map<string, number>();
    byUser.forEach((eventIdsForUser, userId) => {
      const rate = totalEventsWithAttendance > 0 ? eventIdsForUser.size / totalEventsWithAttendance : 1;
      rateByUser.set(userId, rate);
    });
    return { rateByUser, totalEventsWithAttendance };
  }, [attendanceRecords]);

  const ATTENDANCE_WARNING_THRESHOLD = 0.7;

  const committeeOptions = useMemo(() => {
    const set = new Set(profiles.map((p: { committee?: string | null }) => p.committee).filter(Boolean) as string[]);
    return ["", ...Array.from(set)].sort((a, b) => (a || "").localeCompare(b || ""));
  }, [profiles]);

  // Sync settings form when chapter settings load
  useEffect(() => {
    if (chapterSettings) {
      setSettingsForm({
        chapter_name: chapterSettings.chapter_name ?? "",
        charter_year: chapterSettings.charter_year != null ? String(chapterSettings.charter_year) : "",
        semester: chapterSettings.semester ?? "",
        attendance_threshold_pct: chapterSettings.attendance_threshold_pct != null ? String(chapterSettings.attendance_threshold_pct) : "70",
        dues_amount_cents: chapterSettings.dues_amount_cents != null ? String(chapterSettings.dues_amount_cents) : "",
      });
    }
  }, [chapterSettings]);

  const logAudit = async (action_type: string, target_type?: string, target_id?: string, details?: Record<string, unknown>) => {
    if (!user?.id) return;
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action_type,
      target_type: target_type ?? null,
      target_id: target_id ?? null,
      details: details ?? null,
    });
    queryClient.invalidateQueries({ queryKey: ["admin-audit-log"] });
  };

  const updateMemberCommittee = async (profileId: string, committee: string | null) => {
    const { error } = await supabase.from("profiles").update({ committee: committee || null }).eq("id", profileId);
    if (error) {
      toast.error("Failed to update committee");
      return;
    }
    await logAudit("update_committee", "profile", profileId, { committee: committee ?? "" });
    queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    toast.success("Committee updated");
  };

  const saveChapterSettings = async () => {
    const payload = {
      chapter_name: settingsForm.chapter_name || null,
      charter_year: settingsForm.charter_year ? parseInt(settingsForm.charter_year, 10) : null,
      semester: settingsForm.semester || null,
      attendance_threshold_pct: settingsForm.attendance_threshold_pct ? parseInt(settingsForm.attendance_threshold_pct, 10) : 70,
      dues_amount_cents: settingsForm.dues_amount_cents ? parseInt(settingsForm.dues_amount_cents, 10) : null,
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await supabase.from("chapter_settings").select("id").limit(1).single();
    const { error } = existing
      ? await supabase.from("chapter_settings").update(payload).eq("id", existing.id)
      : await supabase.from("chapter_settings").insert(payload);
    if (error) {
      toast.error("Failed to save settings");
      return;
    }
    await logAudit("update_chapter_settings", "chapter_settings", existing?.id ?? undefined, payload);
    refetchChapterSettings();
    queryClient.invalidateQueries({ queryKey: ["admin-chapter-settings"] });
    toast.success("Settings saved");
  };

  const addViolation = async () => {
    if (!newViolation.user_id || !newViolation.violation_type.trim()) {
      toast.error("Select a member and enter violation type");
      return;
    }
    const { error } = await supabase.from("violations").insert({
      user_id: newViolation.user_id,
      violation_type: newViolation.violation_type.trim(),
      description: newViolation.description.trim() || null,
      severity: (newViolation.severity || "medium") as string,
      created_by: user?.id ?? null,
    });
    if (error) {
      toast.error("Failed to add violation");
      return;
    }
    await logAudit("add_violation", "violation", undefined, { user_id: newViolation.user_id, violation_type: newViolation.violation_type });
    refetchViolations();
    setViolationDialogOpen(false);
    setNewViolation({ user_id: "", violation_type: "", description: "", severity: "medium" });
    toast.success("Violation added");
  };

  const runVulnerabilityScan = async () => {
    if (!canAccessAdminPanel) return;
    setScanRunning(true);
    try {
      // Edge Function is deployed with --no-verify-jwt; we use anon key so the call always works.
      // Only admin/e_board see this button (canAccessAdminPanel).
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!anonKey) {
        toast.error("App config error: missing Supabase key.");
        return;
      }
      const target = "https://kappakonnectdemo.vercel.app/auth";
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-vulnerability-scan`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, quick: true }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (payload as { error?: string })?.error ?? (payload as { detail?: string })?.detail ?? (payload as { message?: string })?.message ?? `Request failed (${res.status})`;
        if (res.status === 401) {
          toast.error("Session expired or not logged in. Please log in again.");
          return;
        }
        toast.error(typeof msg === "string" ? msg : "Scan failed");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-vulnerability-scan-latest"] });
      await refetchVulnScan();
      const issuesCount = (payload as { issues_count?: number })?.issues_count;
      toast.success(issuesCount != null ? `Scan complete: ${issuesCount} issue(s) found — see System & upcoming issues` : "Scan complete — see System & upcoming issues");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanRunning(false);
    }
  };

  const resolveViolation = async (violationId: string) => {
    const { error } = await supabase
      .from("violations")
      .update({ resolved_at: new Date().toISOString(), resolved_by: user?.id ?? null })
      .eq("id", violationId);
    if (error) {
      toast.error("Failed to resolve violation");
      return;
    }
    await logAudit("resolve_violation", "violation", violationId, {});
    refetchViolations();
    toast.success("Violation resolved");
  };

  const systemIssues = useMemo((): SystemIssue[] => {
    const issues: SystemIssue[] = [
      {
        id: "api-status",
        title: "API & database",
        detail: apiHealthError
          ? "Cannot reach backend. Check network and Supabase project status."
          : apiHealthOk
            ? "Operational"
            : "Checking…",
        severity: apiHealthError ? "high" : "low",
      },
      {
        id: "storage",
        title: "Storage",
        detail: "Monitor database and file storage in Supabase Dashboard → Settings.",
        severity: "low",
      },
      {
        id: "security-vulnerabilities",
        title: "Security & vulnerabilities",
        detail: "Run periodic vulnerability assessments. Ensure HTTPS and secure auth.",
        severity: "low",
      },
      {
        id: "data-protection",
        title: "Data protection",
        detail: "RLS and auth in use. Review Audit Log for suspicious activity.",
        severity: "low",
      },
    ];
    // Show latest vulnerability scan summary so results are visible in this card
    if (latestVulnScan) {
      const count = Array.isArray(latestVulnScan.issues) ? (latestVulnScan.issues as unknown[]).length : 0;
      const targetLabel = latestVulnScan.target ? String(latestVulnScan.target) : "scan";
      const scanSummary: SystemIssue = {
        id: "vuln-scan-latest",
        title: "Vulnerability scan (latest)",
        detail: count === 0 ? `No issues found (target: ${targetLabel}).` : `${count} issue(s) from scan — see rows below.`,
        severity: count > 0 ? "medium" : "low",
      };
      issues.push(scanSummary);
    }
    const merged = [...issues, ...latestScanIssues];
    const order = { high: 0, medium: 1, low: 2 };
    return merged.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [apiHealthError, apiHealthOk, latestScanIssues, latestVulnScan]);

  const handleExport = async (type: "users" | "attendance") => {
    try {
      let csvContent = "";
      let filename = "";

      if (type === "users") {
        // Export users data
        const headers = ["Name", "Email", "Phone", "Role", "Committee", "Created At"];
        csvContent = headers.join(",") + "\n";

        filteredMembers.forEach((member) => {
          const role = getRoleForUser(member.user_id);
          const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const row = [
            `"${member.full_name || ""}"`,
            `"${member.email || ""}"`,
            `"${member.phone || ""}"`,
            `"${roleLabel}"`,
            `"${member.committee || ""}"`,
            `"${member.created_at ? format(new Date(member.created_at), "yyyy-MM-dd HH:mm:ss") : ""}"`,
          ];
          csvContent += row.join(",") + "\n";
        });

        filename = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      } else {
        // Export attendance data
        const headers = ["Member Name", "Member Email", "Event Title", "Event Date", "Location", "Checked In At"];
        csvContent = headers.join(",") + "\n";

        attendanceRecords.forEach((record: any) => {
          const profile = record.profiles;
          const event = record.events;
          const row = [
            `"${profile?.full_name || "Unknown"}"`,
            `"${profile?.email || ""}"`,
            `"${event?.title || "Unknown Event"}"`,
            `"${event?.start_time ? format(parseISO(event.start_time), "yyyy-MM-dd HH:mm:ss") : ""}"`,
            `"${event?.location || ""}"`,
            `"${format(parseISO(record.checked_in_at), "yyyy-MM-dd HH:mm:ss")}"`,
          ];
          csvContent += row.join(",") + "\n";
        });

        filename = `attendance_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${type === "users" ? "users" : "attendance"} data successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${type === "users" ? "users" : "attendance"} data`);
      console.error("Export error:", error);
    }
  };

  if (!canAccessAdminPanel) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You need admin or e-board privileges to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and system settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("users")}>
                  Export Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("attendance")}>
                  Export Attendance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="w-4 h-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5">
              <ClipboardList className="w-4 h-4" /> Tasks & Committees
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="w-4 h-4" /> System Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <TrendingUp className="w-4 h-4" /> Analytics & Reports
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5">
              <FileText className="w-4 h-4" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="violations" className="gap-1.5">
              <Scale className="w-4 h-4" /> Violations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-6">
        {/* Overview (first thing admins see) */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Overview</CardTitle>
            <CardDescription>Key metrics at a glance. Full control below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{atAGlance.activeMembers}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">{atAGlance.alumniCount} alumni</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="rounded-full bg-accent/10 p-3">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{atAGlance.upcomingThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Events this week</p>
                  <p className="text-xs text-muted-foreground">{atAGlance.upcomingThisMonth} this month</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="rounded-full bg-green-500/10 p-3">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {atAGlance.lastEventAttendancePct != null ? `${atAGlance.lastEventAttendancePct}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Attendance (last event)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <ListTodo className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{atAGlance.overdueTasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks overdue</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="rounded-full bg-muted p-3">
                  <UserPlus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{atAGlance.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">Pending approvals</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & System & Upcoming Issues - side by side, compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <Card className="glass-card border-0 flex flex-col h-full min-h-[220px]">
            <CardHeader className="py-3 pb-1.5">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-3.5 h-3.5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-[11px]">
                User signups, events, check-ins, tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0 p-3">
              <ScrollArea className="h-[160px] rounded-md border border-border/50">
                <div className="space-y-1.5 pr-3">
                  {activities.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No recent activity yet.</p>
                  ) : (
                    activities.slice(0, 12).map((activity) => {
                      const Icon =
                        activity.icon === "user"
                          ? UserPlus
                          : activity.icon === "settings"
                            ? Settings
                            : activity.icon === "report"
                              ? FileBarChart
                              : ListTodo;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                        >
                          <div className="rounded-full bg-primary/10 p-1.5 shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{activity.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{activity.timeAgo}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="glass-card border-0 flex flex-col h-full min-h-[220px]">
            <CardHeader className="py-3 pb-1.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    System & upcoming issues
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    System health, storage, and vulnerability scan results
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={scanRunning}
                  onClick={runVulnerabilityScan}
                  className="shrink-0"
                >
                  {scanRunning ? "Scanning…" : "Run scan"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 min-h-0 p-3">
              <ScrollArea className="h-[160px] rounded-md border border-border/50">
                <div className="overflow-x-auto pr-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Issue</TableHead>
                        <TableHead>Detail</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemIssues.map((issue) => (
                        <TableRow key={issue.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">{issue.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{issue.detail}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                issue.severity === "high" && "border-destructive/50 text-destructive",
                                issue.severity === "medium" && "border-amber-500/50 text-amber-600 dark:text-amber-400",
                                issue.severity === "low" && "text-muted-foreground"
                              )}
                            >
                              {issue.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

          </TabsContent>

          <TabsContent value="members" className="space-y-6 mt-6">
        {/* Search and Filters */}
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
              <div className="relative flex-1 w-full min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[160px] bg-secondary/50">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="e_board">E-Board</SelectItem>
                    <SelectItem value="committee_chairman">Committee Chairman</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={memberTypeFilter} onValueChange={(v) => setMemberTypeFilter(v as "all" | "undergraduate" | "alumni")}>
                  <SelectTrigger className="w-[160px] bg-secondary/50">
                    <SelectValue placeholder="Member type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user roles and permissions. Click the shield icon to change a user's role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {search || roleFilter !== "all" ? "No users found" : "No users yet"}
                </h3>
                <p className="text-muted-foreground">
                  {search || roleFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Users will appear here when they sign up"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50px]">User</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => {
                      const role = getRoleForUser(member.user_id);
                      const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <TableRow key={member.id} className="hover:bg-secondary/30">
                          <TableCell>
                            <Avatar className="w-10 h-10 border border-primary">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {member.full_name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{member.full_name}</TableCell>
                          <TableCell>
                            <a 
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {member.phone ? (
                              <a 
                                href={`tel:${member.phone}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", roleColors[role] || "bg-muted")}
                            >
                              {roleLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.committee || "__none__"}
                              onValueChange={(v) => updateMemberCommittee(member.id, v === "__none__" ? null : v)}
                            >
                              <SelectTrigger className="h-8 w-[140px] bg-secondary/30 text-xs">
                                <SelectValue placeholder="Committee" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">—</SelectItem>
                                {committeeOptions.filter(Boolean).map((c) => (
                                  <SelectItem key={c} value={c!}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {memberAttendanceRate.totalEventsWithAttendance > 0 &&
                            (memberAttendanceRate.rateByUser.get(member.user_id) ?? 1) < ATTENDANCE_WARNING_THRESHOLD ? (
                              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                                Low attendance
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">OK</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <EditUserRoleDialog
                              userId={member.user_id}
                              userName={member.full_name}
                              currentRole={role}
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Shield className="w-4 h-4" />
                              </Button>
                            </EditUserRoleDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Tracking */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Event Attendance Tracking
            </CardTitle>
            <CardDescription>
              View who checked in for events and when they checked in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  No Attendance Records
                </h3>
                <p className="text-muted-foreground">
                  Attendance records will appear here when members check in to events.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Member</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Checked In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record: any) => {
                      const profile = record.profiles;
                      const event = record.events;
                      return (
                        <TableRow key={record.id} className="hover:bg-secondary/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 border border-primary">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground text-sm">
                                  {profile?.full_name || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {profile?.email || ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {event?.title || "Unknown Event"}
                              </p>
                              {event?.start_time && (
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(event.start_time), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {event?.location || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(record.checked_in_at), "MMM d, h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Tasks & Committees
                </CardTitle>
                <CardDescription>
                  All tasks with status. Committee members and tasks assigned to them below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-semibold text-sm">All tasks</h4>
                  <Button variant="outline" size="sm" onClick={() => navigate("/tasks")} className="gap-1">
                    Open Tasks page <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Committee</TableHead>
                        <TableHead>Assigned to</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTasksList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                            No tasks yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        allTasksList.map((t: { id: string; title: string; status: string | null; due_date: string | null; priority: string | null; committee: string | null; assigned_to: string | null }) => {
                          const isOverdue = t.due_date && t.status !== "completed" && new Date(t.due_date) < new Date();
                          return (
                            <TableRow key={t.id} className={isOverdue ? "bg-amber-500/5" : undefined}>
                              <TableCell className="font-medium">{t.title}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={t.status === "completed" ? "secondary" : t.status === "in_progress" ? "default" : "outline"}
                                  className="text-xs capitalize"
                                >
                                  {t.status?.replace("_", " ") ?? "todo"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                {t.due_date ? format(new Date(t.due_date), "MMM d, yyyy") : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={t.priority === "high" ? "destructive" : t.priority === "low" ? "secondary" : "default"} className="text-xs">
                                  {t.priority ?? "medium"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{t.committee || "—"}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{taskAssigneeName(t.assigned_to)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
                  <h4 className="font-semibold text-sm">Committee members & assigned tasks</h4>
                  <p className="text-xs text-muted-foreground">Members in each committee and tasks assigned to them.</p>
                  {committeeOptions.filter(Boolean).length === 0 ? (
                    <span className="text-xs text-muted-foreground block">No committees set. Assign committees in the Members tab.</span>
                  ) : (
                    <div className="space-y-6">
                      {committeeOptions.filter(Boolean).map((committee) => {
                        const committeeMembers = profiles.filter((p: { committee?: string | null }) => p.committee === committee);
                        return (
                          <div key={committee} className="rounded-lg border border-border bg-background/50 overflow-hidden">
                            <div className="px-3 py-2 border-b border-border bg-muted/30 font-medium text-sm">
                              {committee}
                            </div>
                            <div className="divide-y divide-border">
                              {committeeMembers.length === 0 ? (
                                <div className="px-3 py-4 text-xs text-muted-foreground">No members in this committee.</div>
                              ) : (
                                committeeMembers.map((member: { user_id: string; full_name: string }) => {
                                  const assignedTasks = (allTasksList as { assigned_to: string | null; title: string; status: string | null; id: string }[]).filter(
                                    (task) => task.assigned_to === member.user_id
                                  );
                                  return (
                                    <div key={member.user_id} className="px-3 py-3">
                                      <p className="font-medium text-sm mb-1">{member.full_name}</p>
                                      {assignedTasks.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No tasks assigned</p>
                                      ) : (
                                        <ul className="text-xs space-y-1">
                                          {assignedTasks.map((task) => (
                                            <li key={task.id} className="flex items-center gap-2">
                                              <Badge variant={task.status === "completed" ? "secondary" : "outline"} className="text-xs capitalize shrink-0">
                                                {task.status?.replace("_", " ") ?? "todo"}
                                              </Badge>
                                              <span className="text-muted-foreground">{task.title}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications & Announcements
                </CardTitle>
                <CardDescription>
                  Send chapter-wide or targeted announcements. Target by line, committee, or role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SendAnnouncementDialog>
                  <Button className="gap-2">
                    <Megaphone className="w-4 h-4" />
                    Send chapter-wide announcement
                  </Button>
                </SendAnnouncementDialog>
                <p className="text-xs text-muted-foreground">
                  Targeted messages (by line, committee, role) and scheduled announcements coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Chapter info, semester, attendance rules, dues amount. Theme in app Settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label>Chapter name</Label>
                    <Input
                      placeholder="e.g. Kappa Alpha Psi"
                      className="bg-secondary/50"
                      value={settingsForm.chapter_name}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, chapter_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Charter year</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 1911"
                      className="bg-secondary/50"
                      value={settingsForm.charter_year}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, charter_year: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current semester</Label>
                    <Input
                      placeholder="e.g. Spring 2025"
                      className="bg-secondary/50"
                      value={settingsForm.semester}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, semester: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance threshold % (warning below)</Label>
                    <Input
                      type="number"
                      placeholder="70"
                      className="bg-secondary/50"
                      value={settingsForm.attendance_threshold_pct}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, attendance_threshold_pct: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dues amount (cents)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-secondary/50"
                      value={settingsForm.dues_amount_cents}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, dues_amount_cents: e.target.value }))}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={saveChapterSettings}>
                    Save settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analytics & Chapter Health
                </CardTitle>
                <CardDescription>
                  Chapter health: attendance, members, events, and tasks. Export reports below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ChapterHealthChart
                  title="Chapter Health"
                  subtitle="Toggle metrics below to show or hide in the chart"
                  attendance={atAGlance.lastEventAttendancePct}
                  members={atAGlance.activeMembers}
                  tasks={atAGlance.overdueTasks}
                  alumni={atAGlance.alumniCount}
                />
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport("users")} className="gap-1">
                    <Download className="w-4 h-4" /> Export users CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("attendance")} className="gap-1">
                    <Download className="w-4 h-4" /> Export attendance CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Audit Log
                </CardTitle>
                <CardDescription>
                  Who did what. Committee updates, settings changes, and violations are logged here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogEntries.length === 0 ? (
                  <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
                    No audit entries yet. Actions (e.g. committee updates, settings saves, violations) will appear here.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Actor</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead className="max-w-[200px]">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogEntries.map((entry: { id: string; created_at: string; user_id: string; action_type: string; target_type: string | null; target_id: string | null; details: Record<string, unknown> | null }) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{auditActorName(entry.user_id)}</TableCell>
                            <TableCell className="font-medium">{entry.action_type.replace(/_/g, " ")}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {entry.target_type}{entry.target_id ? ` · ${entry.target_id.slice(0, 8)}` : ""}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {entry.details ? JSON.stringify(entry.details) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-6 mt-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Violation Tracking (Admin-Only)
                </CardTitle>
                <CardDescription>
                  Track member violations. Add new violations and mark as resolved when addressed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add violation
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add violation</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Member</Label>
                          <Select
                            value={newViolation.user_id}
                            onValueChange={(v) => setNewViolation((s) => ({ ...s, user_id: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredMembers.map((m) => (
                                <SelectItem key={m.user_id} value={m.user_id}>
                                  {m.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Violation type</Label>
                          <Input
                            placeholder="e.g. Attendance, Conduct"
                            value={newViolation.violation_type}
                            onChange={(e) => setNewViolation((s) => ({ ...s, violation_type: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            placeholder="Details"
                            value={newViolation.description}
                            onChange={(e) => setNewViolation((s) => ({ ...s, description: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select
                            value={newViolation.severity}
                            onValueChange={(v) => setNewViolation((s) => ({ ...s, severity: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setViolationDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addViolation}>Add</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {violationsList.length === 0 ? (
                  <div className="rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
                    No violations recorded. Use &quot;Add violation&quot; to log one.
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {violationsList.map((v: { id: string; user_id: string; violation_type: string; description: string | null; severity: string | null; created_at: string; resolved_at: string | null }) => (
                          <TableRow key={v.id}>
                            <TableCell>{violationMemberName(v.user_id)}</TableCell>
                            <TableCell>{v.violation_type}</TableCell>
                            <TableCell>
                              <Badge variant={v.severity === "high" ? "destructive" : v.severity === "low" ? "secondary" : "default"}>
                                {v.severity ?? "medium"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate text-muted-foreground text-sm">
                              {v.description || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                              {format(new Date(v.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{v.resolved_at ? <Badge variant="secondary">Resolved</Badge> : <Badge variant="outline">Open</Badge>}</TableCell>
                            <TableCell>
                              {!v.resolved_at && (
                                <Button variant="ghost" size="sm" onClick={() => resolveViolation(v.id)}>
                                  Resolve
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Info */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              Admin Controls
            </CardTitle>
            <CardDescription>
              As an admin, you have full control over the application. Use this panel to manage user roles and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Role Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  Click the shield icon next to any user to change their role. You can assign Admin, E-Board, Committee Chairman, Member, or Alumni roles.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Important Notes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Be careful when assigning Admin roles. Admins have full access to all features and can manage other users' roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminPanel;

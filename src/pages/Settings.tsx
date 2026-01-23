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
  Users,
  Settings as SettingsIcon
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole("admin");

  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    timezone: "America/New_York",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    events: true,
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

  const handleSavePreferences = () => {
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
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
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
                      value={preferences.theme}
                      onValueChange={(value) =>
                        setPreferences((p) => ({ ...p, theme: value }))
                      }
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

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Admin Controls
                  </CardTitle>
                  <CardDescription>
                    Administrative functions and user management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/20 border border-primary/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        User Management
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage user roles, permissions, and access controls.
                      </p>
                      <Button 
                        variant="hero" 
                        onClick={() => navigate("/admin")}
                        className="w-full sm:w-auto"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Open Admin Panel
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-primary" />
                        System Settings
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure application-wide settings and preferences.
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => toast.info("System settings coming soon!")}
                        >
                          Configure System
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Admin Responsibilities
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Manage user roles and permissions</p>
                      <p>• Assign admin privileges to trusted members</p>
                      <p>• Monitor system activity and user access</p>
                      <p>• Configure application settings</p>
                      <p>• Ensure data security and privacy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
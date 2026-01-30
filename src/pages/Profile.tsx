import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Camera,
  Save,
  Linkedin,
  GraduationCap,
  Users,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resolveAvatarUrl } from "@/lib/utils";

export default function Profile() {
  const { profile, roles, user } = useAuth();
  const { toast } = useToast();
  const primaryRole = roles[0]?.role || "member";
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    committee: "",
    graduation_year: "",
    linkedin_url: "",
    bio: "",
    crossing_year: "",
    line_name: "",
    chapter: "",
    current_company: "",
    current_position: "",
    industry: "",
    location: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        committee: profile.committee || "",
        graduation_year: profile.graduation_year?.toString() || "",
        linkedin_url: (profile as any).linkedin_url || "",
        bio: (profile as any).bio || "",
        crossing_year: (profile as any).crossing_year?.toString() || "",
        line_name: (profile as any).line_name || "",
        chapter: (profile as any).chapter || "",
        current_company: (profile as any).current_company || "",
        current_position: (profile as any).current_position || "",
        industry: (profile as any).industry || "",
        location: (profile as any).location || "",
      });
    }
  }, [profile]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          committee: profileData.committee,
          graduation_year: profileData.graduation_year ? parseInt(profileData.graduation_year) : null,
          linkedin_url: profileData.linkedin_url,
          bio: profileData.bio,
          crossing_year: profileData.crossing_year ? parseInt(profileData.crossing_year) : null,
          line_name: profileData.line_name,
          chapter: profileData.chapter,
          current_company: profileData.current_company || null,
          current_position: profileData.current_position || null,
          industry: profileData.industry || null,
          location: profileData.location || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your journey and connect with brothers
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass-card overflow-hidden">
          {/* Cover Section */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/20" />
          
          <CardContent className="relative pt-0">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-16 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={resolveAvatarUrl(profile?.avatar_url) || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                    {profileData.full_name ? getInitials(profileData.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center sm:text-left pb-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold">
                  {profileData.full_name || "Member"}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {primaryRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                  {profileData.chapter && (
                    <Badge variant="outline" className="border-accent/50 text-accent">
                      {profileData.chapter}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Bio Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  About Me
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Share your story, interests, and what being a member means to you..."
                  className="min-h-[120px] resize-none bg-secondary/30"
                />
              </div>

              <Separator />

              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, full_name: e.target.value }))
                      }
                      placeholder="Your full name"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-secondary/50 opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="(555) 123-4567"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedin_url"
                      value={profileData.linkedin_url}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, linkedin_url: e.target.value }))
                      }
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fraternity Info */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Fraternity Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Chapter
                    </Label>
                    <Input
                      id="chapter"
                      value={profileData.chapter}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, chapter: e.target.value }))
                      }
                      placeholder="e.g., Alpha Phi"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line_name" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      Line Name
                    </Label>
                    <Input
                      id="line_name"
                      value={profileData.line_name}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, line_name: e.target.value }))
                      }
                      placeholder="Your line name"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crossing_year" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Crossing Year
                    </Label>
                    <Input
                      id="crossing_year"
                      value={profileData.crossing_year}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, crossing_year: e.target.value }))
                      }
                      placeholder="2024"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="committee">Committee</Label>
                    <Select
                      value={profileData.committee}
                      onValueChange={(value) =>
                        setProfileData((p) => ({ ...p, committee: value }))
                      }
                    >
                      <SelectTrigger className="bg-secondary/30">
                        <SelectValue placeholder="Select a committee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive Board</SelectItem>
                        <SelectItem value="social">Social Committee</SelectItem>
                        <SelectItem value="philanthropy">Philanthropy</SelectItem>
                        <SelectItem value="recruitment">Recruitment</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="academic">Academic Excellence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Academic Info */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      value={profileData.graduation_year}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, graduation_year: e.target.value }))
                      }
                      placeholder="2025"
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Career Info */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Career Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_position">Current Position</Label>
                    <Input
                      id="current_position"
                      value={profileData.current_position}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, current_position: e.target.value }))
                      }
                      placeholder="e.g., Analyst"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_company">Current Company</Label>
                    <Input
                      id="current_company"
                      value={profileData.current_company}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, current_company: e.target.value }))
                      }
                      placeholder="e.g., Goldman Sachs"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={profileData.industry}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, industry: e.target.value }))
                      }
                      placeholder="e.g., Finance, Technology"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData((p) => ({ ...p, location: e.target.value }))
                      }
                      placeholder="City, State"
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="min-w-[140px]">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
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
  BookOpen
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { profile, roles, user } = useAuth();
  const { toast: toastHook } = useToast();
  const queryClient = useQueryClient();
  const primaryRole = roles[0]?.role || "member";
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        committee: profile.committee || "",
        graduation_year: profile.graduation_year?.toString() || "",
        linkedin_url: (profile as Database["public"]["Tables"]["profiles"]["Row"])?.linkedin_url || "",
        bio: (profile as Database["public"]["Tables"]["profiles"]["Row"])?.bio || "",
        crossing_year: (profile as Database["public"]["Tables"]["profiles"]["Row"])?.crossing_year?.toString() || "",
        line_name: (profile as Database["public"]["Tables"]["profiles"]["Row"])?.line_name || "",
        chapter: (profile as Database["public"]["Tables"]["profiles"]["Row"])?.chapter || "",
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        // Try creating the bucket if it doesn't exist
        if (uploadError.message.includes('Bucket not found')) {
          toast.error("Avatar storage not configured. Please set up the 'avatars' bucket in Supabase Storage.");
        } else {
          toast.error(`Upload failed: ${uploadError.message}`);
        }
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      
      const avatarUrl = publicUrlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) {
        toast.error(`Failed to update profile: ${updateError.message}`);
        return;
      }

      toast.success("Avatar updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("An error occurred while uploading avatar");
      console.error("Avatar upload error:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
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
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toastHook({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: unknown) {
      toastHook({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
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
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                    {profileData.full_name ? getInitials(profileData.full_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-lg"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
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
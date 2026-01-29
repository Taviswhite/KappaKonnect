import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, MapPin, GraduationCap, Linkedin, ArrowLeft, Briefcase, Search, Phone, User, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { avatarUrlForAlumni, formatCrossingDisplay } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AlumniRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  graduation_year: number;
  degree: string | null;
  current_company: string | null;
  current_position: string | null;
  location: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  industry: string | null;
  line_label?: string | null;
  phone?: string | null;
  phone_public?: boolean | null;
  bio?: string | null;
  crossing_year?: number | null;
  chapter?: string | null;
  line_order?: number | null;
  is_featured?: boolean | null;
};

export default function AlumniProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [alum, setAlum] = useState<AlumniRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    industry: "",
    location: "",
    degree: "",
    linkedin_url: "",
    current_company: "",
    current_position: "",
    phone: "",
    phone_public: false,
    bio: "",
  });

  const isOwner = !!user && !!alum && alum.user_id === user.id;
  const canEdit =
    !!user &&
    !!alum &&
    (isOwner || hasRole("admin") || hasRole("alumni"));

  // Only the profile owner and chapter leadership can see full personal details
  const canViewPersonal =
    !!user &&
    !!alum &&
    (isOwner || hasRole("admin") || hasRole("e_board"));

  const canManageFeatured = hasRole("admin") || hasRole("e_board");

  const featuredMutation = useMutation({
    mutationFn: async ({ alumId, is_featured }: { alumId: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("alumni")
        .update({ is_featured })
        .eq("id", alumId);
      if (error) throw error;
    },
    onSuccess: (_, { is_featured }) => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-featured"] });
      setAlum((prev) => (prev ? { ...prev, is_featured } : prev));
      toast.success(is_featured ? "Added to Featured / Chapter Advisors" : "Removed from Featured / Chapter Advisors");
    },
    onError: () => {
      toast.error("Failed to update featured status");
    },
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("alumni")
        .select("*")
        .eq("id", id)
        .maybeSingle<AlumniRow>();

      if (cancelled) return;

      if (error || !data) {
        console.error("Failed to load alumni profile", error);
        toast.error("Could not load alumni profile");
        setLoading(false);
        return;
      }

      setAlum(data);
      setForm({
        industry: data.industry ?? "",
        location: data.location ?? "",
        degree: data.degree ?? "",
        linkedin_url: data.linkedin_url ?? "",
        current_company: data.current_company ?? "",
        current_position: data.current_position ?? "",
        phone: data.phone ?? "",
        phone_public: data.phone_public ?? false,
        bio: data.bio ?? "",
      });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!alum || !canEdit) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("alumni")
        .update({
          industry: form.industry || null,
          location: form.location || null,
          degree: form.degree || null,
          linkedin_url: form.linkedin_url || null,
          current_company: form.current_company || null,
          current_position: form.current_position || null,
          phone: form.phone || null,
          phone_public: form.phone_public,
          bio: form.bio || null,
        })
        .eq("id", alum.id);

      if (error) {
        console.error("Failed to update alumni profile", error);
        toast.error("Failed to save changes");
      } else {
        toast.success("Alumni profile updated");
        setAlum((prev) =>
          prev
            ? {
                ...prev,
                industry: form.industry || null,
                location: form.location || null,
                degree: form.degree || null,
                linkedin_url: form.linkedin_url || null,
                current_company: form.current_company || null,
                current_position: form.current_position || null,
                phone: form.phone || null,
                phone_public: form.phone_public,
                bio: form.bio || null,
              }
            : prev,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const crossingDisplay = alum ? formatCrossingDisplay({
    crossing_year: alum.crossing_year,
    chapter: alum.chapter,
    line_order: alum.line_order,
  }) : null;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => navigate("/alumni")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Alumni Profile
              </h1>
              <p className="text-muted-foreground text-sm">
                Personal details and career information
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              variant="hero"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        {loading || !alum ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              {loading ? "Loading profile..." : "Alumni not found."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={avatarUrlForAlumni(alum) || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl sm:text-4xl font-display">
                      {alum.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold">
                        {alum.full_name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {crossingDisplay && (
                        <Badge variant="outline" className="text-sm font-medium">
                          {crossingDisplay}
                        </Badge>
                      )}
                      {(alum.graduation_year && alum.graduation_year >= 1900) ? (
                        <Badge variant="outline" className="text-sm bg-secondary/50">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Class of {alum.graduation_year}
                        </Badge>
                      ) : (alum.crossing_year && alum.crossing_year >= 1900 && alum.crossing_year <= 2016) ? (
                        <Badge variant="outline" className="text-sm bg-secondary/50">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Class of {alum.crossing_year + 1}
                        </Badge>
                      ) : null}
                      {alum.is_featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-sm">
                          <Star className="w-3 h-3 mr-1" fill="currentColor" />
                          Featured Alumni
                        </Badge>
                      )}
                    </div>
                    {(alum.current_position || alum.current_company || alum.industry) && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {alum.current_position && alum.current_company && (
                          <Badge variant="outline" className="text-sm bg-primary/20 text-primary border-primary/30">
                            {alum.current_position} at {alum.current_company}
                          </Badge>
                        )}
                        {alum.industry && (
                          <Badge variant="outline" className="text-sm bg-primary/20 text-primary border-primary/30">
                            {alum.industry}
                          </Badge>
                        )}
                      </div>
                    )}
                    {/* Quick actions */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                      {alum.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.location.href = `mailto:${alum.email}`}
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                      )}
                      {alum.phone && (alum.phone_public || canViewPersonal) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.location.href = `tel:${alum.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                      )}
                      {alum.linkedin_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(alum.linkedin_url!, "_blank")}
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(alum.full_name)}`,
                              "_blank"
                            )
                          }
                        >
                          <Search className="w-4 h-4" />
                          Find on LinkedIn
                        </Button>
                      )}
                      {canManageFeatured && (
                        <Button
                          variant={alum.is_featured ? "secondary" : "outline"}
                          size="sm"
                          className="gap-2"
                          disabled={featuredMutation.isPending}
                          onClick={() =>
                            featuredMutation.mutate({
                              alumId: alum.id,
                              is_featured: !alum.is_featured,
                            })
                          }
                        >
                          <Star
                            className="w-4 h-4"
                            fill={alum.is_featured ? "currentColor" : "none"}
                          />
                          {alum.is_featured ? "Remove from Featured" : "Add to Featured"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="glass-card">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                {canViewPersonal ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {alum.email || <span className="text-muted-foreground italic">Not provided</span>}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                          disabled={!canEdit}
                          className="bg-secondary/30"
                        />
                        {canEdit && (
                          <div className="flex items-center gap-2 mt-2">
                            <Switch
                              id="phone_public"
                              checked={form.phone_public}
                              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, phone_public: checked }))}
                            />
                            <Label htmlFor="phone_public" className="text-xs text-muted-foreground cursor-pointer">
                              Show phone number publicly (Call button)
                            </Label>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={form.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          placeholder="City, State"
                          disabled={!canEdit}
                          className="bg-secondary/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          value={form.linkedin_url}
                          onChange={(e) => handleChange("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          disabled={!canEdit}
                          className="bg-secondary/30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">About / Bio</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        placeholder="Tell us about yourself, your interests, and background..."
                        disabled={!canEdit}
                        className="bg-secondary/30 min-h-[100px]"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Personal contact details are visible only to this member and chapter leadership.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Career & Education Card */}
            <Card className="glass-card">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Career & Education
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Career Field / Industry</Label>
                    <Input
                      id="industry"
                      value={form.industry}
                      onChange={(e) => handleChange("industry", e.target.value)}
                      placeholder="e.g., Private Equity, Law, Technology"
                      disabled={!canEdit}
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={form.degree}
                      onChange={(e) => handleChange("degree", e.target.value)}
                      placeholder="e.g., B.S. Computer Science"
                      disabled={!canEdit}
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_position">Current Position</Label>
                    <Input
                      id="current_position"
                      value={form.current_position}
                      onChange={(e) => handleChange("current_position", e.target.value)}
                      placeholder="e.g., Senior Analyst"
                      disabled={!canEdit}
                      className="bg-secondary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_company">Current Company</Label>
                    <Input
                      id="current_company"
                      value={form.current_company}
                      onChange={(e) => handleChange("current_company", e.target.value)}
                      placeholder="Company name"
                      disabled={!canEdit}
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


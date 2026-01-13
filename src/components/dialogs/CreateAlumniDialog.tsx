import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateAlumniDialogProps {
  trigger: React.ReactNode;
}

export function CreateAlumniDialog({ trigger }: CreateAlumniDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    graduation_year: "",
    degree: "",
    current_company: "",
    current_position: "",
    location: "",
    linkedin_url: "",
    industry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!formData.full_name || !formData.graduation_year) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("alumni").insert({
        full_name: formData.full_name,
        email: formData.email || null,
        graduation_year: parseInt(formData.graduation_year),
        degree: formData.degree || null,
        current_company: formData.current_company || null,
        current_position: formData.current_position || null,
        location: formData.location || null,
        linkedin_url: formData.linkedin_url || null,
        industry: formData.industry || null,
      });

      if (error) throw error;

      toast.success("Alumni added successfully!");
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      setOpen(false);
      setFormData({
        full_name: "",
        email: "",
        graduation_year: "",
        degree: "",
        current_company: "",
        current_position: "",
        location: "",
        linkedin_url: "",
        industry: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to add alumni");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">Add Alumni</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year *</Label>
              <Input
                id="graduation_year"
                type="number"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                placeholder="2020"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="B.S. Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_company">Company</Label>
              <Input
                id="current_company"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                placeholder="Google"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_position">Position</Label>
              <Input
                id="current_position"
                value={formData.current_position}
                onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Technology"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/johnsmith"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Adding..." : "Add Alumni"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const alumniSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  graduation_year: z.number().min(1900).max(2100),
  company: z.string().optional(),
  position: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  degree: z.string().optional(),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  willing_to_mentor: z.boolean().default(false),
});

type AlumniFormData = z.infer<typeof alumniSchema>;

interface CreateAlumniDialogProps {
  children: React.ReactNode;
}

export function CreateAlumniDialog({ children }: CreateAlumniDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  // Check permissions
  const canAddAlumni = hasRole("admin") || hasRole("alumni");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AlumniFormData>({
    resolver: zodResolver(alumniSchema),
    defaultValues: {
      willing_to_mentor: false,
    },
  });

  const onSubmit = async (data: AlumniFormData) => {
    if (!canAddAlumni) {
      toast.error("You don't have permission to add alumni. Only admins and alumni can add alumni.");
      return;
    }

    try {
      // Check if profile with this email already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, user_id")
        .eq("email", data.email)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: data.full_name,
            graduation_year: data.graduation_year,
            linkedin_url: data.linkedin_url || null,
          })
          .eq("id", existingProfile.id);

        if (updateError) throw updateError;
        toast.success("Alumni profile updated!");
      } else {
        // Create alumni record in alumni table
        const { error: alumniError } = await supabase
          .from("alumni")
          .insert({
            full_name: data.full_name,
            email: data.email,
            graduation_year: data.graduation_year,
            current_company: data.company || null,
            current_position: data.position || null,
            location: data.location || null,
            linkedin_url: data.linkedin_url || null,
          });

        if (alumniError) throw alumniError;
        toast.success("Alumni record created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      reset();
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error adding alumni:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add alumni";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Add Alumni
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="alumni@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year *</Label>
            <Input
              id="graduation_year"
              type="number"
              {...register("graduation_year", { valueAsNumber: true })}
              placeholder="2020"
              className={errors.graduation_year ? "border-destructive" : ""}
            />
            {errors.graduation_year && <p className="text-sm text-destructive">{errors.graduation_year.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Career Field / Industry</Label>
            <Input
              id="industry"
              {...register("industry")}
              placeholder="e.g., Investment Banking, Tech, Law, Medicine"
            />
            <p className="text-xs text-muted-foreground">Primary career field or industry</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position / Title</Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="e.g., Senior Analyst, Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register("company")}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                {...register("degree")}
                placeholder="e.g., B.S. Computer Science"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/username"
              className={errors.linkedin_url ? "border-destructive" : ""}
            />
            {errors.linkedin_url && <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="willing_to_mentor"
              {...register("willing_to_mentor")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="willing_to_mentor" className="font-normal cursor-pointer">
              Open to mentoring
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Alumni"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


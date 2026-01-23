import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield } from "lucide-react";

type AppRole = "admin" | "e_board" | "committee_chairman" | "member" | "alumni";

interface EditUserRoleDialogProps {
  userId: string;
  userName: string;
  currentRole: AppRole;
  children: React.ReactNode;
}

export function EditUserRoleDialog({ userId, userName, currentRole, children }: EditUserRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  // Only admins can change roles
  const canEditRoles = hasRole("admin");

  if (!canEditRoles) {
    return null;
  }

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // First, check if user already has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: selectedRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: selectedRole });

        if (error) throw error;
      }

      toast.success(`Role updated to ${selectedRole.replace("_", " ")}`);
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["member-count"] });
      setOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Edit User Role
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Changing role for: <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="committee_chairman">Committee Chairman</SelectItem>
                <SelectItem value="e_board">E-Board</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Admin:</strong> Full access to all features<br />
              <strong>E-Board:</strong> Access to sensitive statistics and management<br />
              <strong>Committee Chairman:</strong> Access to committee-specific features<br />
              <strong>Alumni:</strong> Alumni-level access<br />
              <strong>Member:</strong> Standard member access
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="hero"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedRole === currentRole}
            >
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

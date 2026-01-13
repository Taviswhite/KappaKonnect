import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  ArrowUpRight,
  Wallet,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig = {
  paid: { label: "Paid", icon: CheckCircle, className: "bg-green-500/10 text-green-400 border-green-500/20" },
  completed: { label: "Paid", icon: CheckCircle, className: "bg-green-500/10 text-green-400 border-green-500/20" },
  partial: { label: "Partial", icon: Clock, className: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "Pending", icon: Clock, className: "bg-muted/50 text-muted-foreground border-muted" },
  overdue: { label: "Overdue", icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Payments = () => {
  const { profile, hasRole, user } = useAuth();
  
  const canViewAllPayments = hasRole("admin") || hasRole("officer") || hasRole("committee_chair");

  // Fetch all payments (for admins) or user's payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", user?.id, canViewAllPayments],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase.from("payments").select("*");
      
      if (!canViewAllPayments) {
        query = query.eq("user_id", user.id);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const totalDues = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const collected = payments
    .filter(p => p.status === "paid" || p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pending = totalDues - collected;
  const collectedPercent = totalDues > 0 ? Math.round((collected / totalDues) * 100) : 0;

  // User's payment status
  const userPayments = payments.filter(p => p.user_id === user?.id);
  const userTotalDue = userPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const userPaid = userPayments
    .filter(p => p.status === "paid" || p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const userStatus = userPaid === 0 ? "pending" : userPaid < userTotalDue ? "partial" : "paid";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Payments
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {canViewAllPayments ? "Track dues and manage payments" : "View your payment status"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canViewAllPayments && (
              <Button variant="outline" size="sm" onClick={() => toast.info("Export feature coming soon!")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Button variant="hero" size="sm" onClick={() => toast.info("Payment feature coming soon!")}>
              <CreditCard className="w-4 h-4 mr-2" />
              {canViewAllPayments ? "Record Payment" : "Pay Now"}
            </Button>
          </div>
        </div>

        {/* Admin/Officer Stats */}
        {canViewAllPayments && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Dues</p>
                    <p className="text-2xl sm:text-3xl font-display font-bold mt-1">${totalDues.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20 text-primary">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <p className="text-2xl sm:text-3xl font-display font-bold mt-1">${collected.toLocaleString()}</p>
                    {collectedPercent > 0 && (
                      <p className="text-xs text-green-400 flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {collectedPercent}% collected
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20 text-green-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl sm:text-3xl font-display font-bold mt-1">${pending.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/20 text-accent">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collection Progress for Admin/Officers */}
        {canViewAllPayments && totalDues > 0 && (
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Collection Progress</CardTitle>
                <span className="text-2xl font-display font-bold gradient-text">{collectedPercent}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={collectedPercent} className="h-3" />
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  ${collected.toLocaleString()} collected
                </span>
                <span>${totalDues.toLocaleString()} total</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Payment Card for Regular Members */}
        {!canViewAllPayments && (
          <Card className="glass-card border-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Your Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userPayments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No payments due at this time</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Semester Dues</span>
                    <Badge variant="outline" className={cn("text-xs", statusConfig[userStatus as keyof typeof statusConfig]?.className)}>
                      {statusConfig[userStatus as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  <Progress value={(userPaid / userTotalDue) * 100} className="h-3" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="text-foreground font-semibold">${userPaid}</span> paid
                    </div>
                    <div className="text-sm">
                      <span className="text-accent font-semibold">${userTotalDue - userPaid}</span> remaining
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments List */}
        {isLoading ? (
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-secondary/30 rounded-xl animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-foreground mb-2">No payments yet</h3>
              <p className="text-muted-foreground">Payment records will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                {canViewAllPayments ? "Recent Payments" : "Your Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.slice(0, 10).map((payment) => {
                  const status = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;
                  return (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{payment.payment_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_date ? format(new Date(payment.payment_date), "MMM d, yyyy") : "Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={cn("text-xs", status.className)}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <p className="font-semibold text-foreground">${Number(payment.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Payments;
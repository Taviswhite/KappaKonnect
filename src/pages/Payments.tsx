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

const paymentStats = [
  { label: "Total Dues", value: "$14,400", icon: DollarSign, trend: null },
  { label: "Collected", value: "$12,450", icon: TrendingUp, trend: "+8.2%" },
  { label: "Pending", value: "$1,950", icon: Clock, trend: null },
];

const allMembers = [
  { id: 1, name: "James Davis", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", amount: 300, paid: 300, status: "paid" },
  { id: 2, name: "Marcus Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", amount: 300, paid: 300, status: "paid" },
  { id: 3, name: "David Williams", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", amount: 300, paid: 150, status: "partial" },
  { id: 4, name: "Alex Thompson", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100", amount: 300, paid: 0, status: "pending" },
  { id: 5, name: "Michael Brown", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100", amount: 300, paid: 300, status: "paid" },
  { id: 6, name: "Chris Martinez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", amount: 300, paid: 0, status: "overdue" },
];

const allTransactions = [
  { id: 1, member: "James Davis", type: "Semester Dues", amount: 300, date: "Jan 5, 2026", method: "Card" },
  { id: 2, member: "Marcus Johnson", type: "Semester Dues", amount: 300, date: "Jan 4, 2026", method: "Bank Transfer" },
  { id: 3, member: "David Williams", type: "Partial Payment", amount: 150, date: "Jan 3, 2026", method: "Card" },
  { id: 4, member: "Michael Brown", type: "Semester Dues", amount: 300, date: "Jan 2, 2026", method: "Card" },
];

const statusConfig = {
  paid: { label: "Paid", icon: CheckCircle, className: "bg-green-500/10 text-green-400 border-green-500/20" },
  partial: { label: "Partial", icon: Clock, className: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "Pending", icon: Clock, className: "bg-muted/50 text-muted-foreground border-muted" },
  overdue: { label: "Overdue", icon: AlertCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Payments = () => {
  const { profile, hasRole } = useAuth();
  const collectedPercent = Math.round((12450 / 14400) * 100);
  
  const canViewAllPayments = hasRole("admin") || hasRole("officer") || hasRole("committee_chair");
  
  const currentUserPayment = {
    id: 0,
    name: profile?.full_name || "You",
    avatar: profile?.avatar_url || "",
    amount: 300,
    paid: 150,
    status: "partial"
  };
  
  const currentUserTransactions = [
    { id: 1, member: profile?.full_name || "You", type: "Partial Payment", amount: 150, date: "Jan 3, 2026", method: "Card" },
  ];

  const members = canViewAllPayments ? allMembers : [currentUserPayment];
  const transactions = canViewAllPayments ? allTransactions : currentUserTransactions;

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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            <Button variant="hero" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              {canViewAllPayments ? "Record Payment" : "Pay Now"}
            </Button>
          </div>
        </div>

        {/* Admin/Officer Stats */}
        {canViewAllPayments && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentStats.map((stat, index) => (
              <Card key={stat.label} className="glass-card border-0 overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-display font-bold mt-1">{stat.value}</p>
                      {stat.trend && (
                        <p className="text-xs text-green-400 flex items-center mt-1">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          {stat.trend} from last month
                        </p>
                      )}
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      index === 0 && "bg-primary/20 text-primary",
                      index === 1 && "bg-green-500/20 text-green-400",
                      index === 2 && "bg-accent/20 text-accent"
                    )}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Collection Progress for Admin/Officers */}
        {canViewAllPayments && (
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
                  $12,450 collected
                </span>
                <span>$14,400 total</span>
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
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Semester Dues</span>
                <Badge variant="outline" className={cn("text-xs", statusConfig[currentUserPayment.status as keyof typeof statusConfig].className)}>
                  {statusConfig[currentUserPayment.status as keyof typeof statusConfig].label}
                </Badge>
              </div>
              <Progress value={(currentUserPayment.paid / currentUserPayment.amount) * 100} className="h-3" />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">${currentUserPayment.paid}</span> paid
                </div>
                <div className="text-sm">
                  <span className="text-accent font-semibold">${currentUserPayment.amount - currentUserPayment.paid}</span> remaining
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Member Status - Wider */}
          <Card className={cn("glass-card border-0", canViewAllPayments ? "lg:col-span-3" : "lg:col-span-5")}>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                {canViewAllPayments ? "Member Status" : "Payment Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => {
                  const status = statusConfig[member.status as keyof typeof statusConfig];
                  const progress = (member.paid / member.amount) * 100;
                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
                    >
                      <Avatar className="w-10 h-10 border-2 border-border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground truncate">{member.name}</p>
                          <Badge variant="outline" className={cn("text-xs shrink-0 ml-2", status.className)}>
                            <status.icon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            ${member.paid}/${member.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions - Narrower for admin, full width for members */}
          {canViewAllPayments && (
            <Card className="glass-card border-0 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{tx.member}</p>
                          <p className="text-xs text-muted-foreground">{tx.type}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-green-400">+${tx.amount}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transactions for Regular Members */}
        {!canViewAllPayments && transactions.length > 0 && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Your Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">+${tx.amount}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Payments;
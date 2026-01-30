import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

const Payments = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage chapter payments and dues
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="icon-container icon-container-primary mb-4">
              <CreditCard className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Payments Coming Soon
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Payment management features will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Payments;

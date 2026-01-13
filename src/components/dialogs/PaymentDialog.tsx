import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Wallet } from "lucide-react";

const paymentSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
  payment_method: z.enum(["credit_card", "debit_card", "bank_transfer", "cash", "check", "venmo", "paypal", "zelle"]),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  children: React.ReactNode;
  userId?: string;
  paymentType?: string;
}

export function PaymentDialog({ children, userId, paymentType = "Semester Dues" }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: "credit_card",
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!user) {
      toast.error("You must be logged in to record a payment");
      return;
    }

    try {
      const { error } = await supabase.from("payments").insert({
        user_id: userId || user.id,
        amount: Number(data.amount),
        payment_type: paymentType,
        payment_method: data.payment_method,
        payment_date: data.payment_date,
        status: "paid",
        notes: data.notes || null,
      });

      if (error) throw error;

      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment. Please try again.");
    }
  };

  const paymentMethodLabels = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    check: "Check",
    venmo: "Venmo",
    paypal: "PayPal",
    zelle: "Zelle",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder="0.00"
                className={errors.amount ? "border-destructive pl-8" : "pl-8"}
              />
            </div>
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={(value) => setValue("payment_method", value as PaymentFormData["payment_method"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              {...register("payment_date")}
              className={errors.payment_date ? "border-destructive" : ""}
            />
            {errors.payment_date && <p className="text-sm text-destructive">{errors.payment_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              {...register("notes")}
              placeholder="Payment reference or notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { type UseFormReturn } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentCapabilities } from "@/app/settings/payments/hooks";
import type { PropertyFormSchema } from "../../property-form.schema";

type PaymentMethod = "card" | "bank_transfer" | "cash";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash (on arrival)",
};

const ALL_METHODS: PaymentMethod[] = ["card", "bank_transfer", "cash"];

interface Blocker {
  message: string;
  linkTo: string;
  linkLabel: string;
}

function methodBlocker(
  method: PaymentMethod,
  caps: { can_accept_card: boolean; can_accept_bank_transfer: boolean } | undefined,
): Blocker | null {
  if (!caps) return null;
  if (method === "card" && !caps.can_accept_card)
    return {
      message: "Stripe Connect is not active.",
      linkTo: "/settings/payments",
      linkLabel: "Set up Stripe →",
    };
  if (method === "bank_transfer" && !caps.can_accept_bank_transfer)
    return {
      message: "No bank account configured.",
      linkTo: "/settings/payments",
      linkLabel: "Add bank account →",
    };
  return null;
}

interface PaymentConfigSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function PaymentConfigSection({ form }: PaymentConfigSectionProps) {
  const { data: caps } = usePaymentCapabilities();

  return (
    <section id="section-payment-config" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Payment Configuration</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Accepted payment methods and deposit requirements for this property.
        </p>
      </div>

      <FormField
        control={form.control}
        name="payment_config.accepted_methods"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Accepted payment methods</FormLabel>
            <div className="space-y-2 mt-1">
              {ALL_METHODS.map((method) => {
                const blocker = methodBlocker(method, caps);
                const checked = field.value?.includes(method) ?? false;
                return (
                  <div key={method} className="flex flex-col gap-0.5">
                    <label
                      className={`flex items-center gap-2 text-sm ${blocker ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!!blocker}
                        onChange={(e) => {
                          if (blocker) return;
                          const next = e.target.checked
                            ? [...(field.value ?? []), method]
                            : (field.value ?? []).filter((m: string) => m !== method);
                          field.onChange(next);
                        }}
                        className="rounded"
                      />
                      {PAYMENT_METHOD_LABELS[method]}
                    </label>
                    {blocker && (
                      <p className="ml-6 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3 shrink-0" />
                        {blocker.message}{" "}
                        <Link
                          to={blocker.linkTo}
                          className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          {blocker.linkLabel}
                        </Link>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="payment_config.deposit_pct"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deposit required (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={20}
                max={100}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="max-w-40"
              />
            </FormControl>
            <FormDescription>
              20–100. Use 100 for full payment upfront at time of booking.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="payment_config.remaining_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remaining balance method</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              value={field.value ?? "none"}
            >
              <FormControl>
                <SelectTrigger className="max-w-64">
                  <SelectValue placeholder="N/A (full payment upfront)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">N/A (full payment upfront)</SelectItem>
                <SelectItem value="cash">Cash (on arrival)</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Only applies when deposit is less than 100%.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

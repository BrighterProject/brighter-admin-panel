import { type UseFormReturn } from "react-hook-form";
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
import type { PropertyFormSchema } from "../../property-form.schema";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash (on arrival)",
};

const ALL_METHODS = ["card", "bank_transfer", "cash"] as const;

interface PaymentConfigSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function PaymentConfigSection({ form }: PaymentConfigSectionProps) {
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
            <div className="flex flex-wrap gap-4 mt-1">
              {ALL_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value?.includes(method) ?? false}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...(field.value ?? []), method]
                        : (field.value ?? []).filter((m: string) => m !== method);
                      field.onChange(next);
                    }}
                    className="rounded"
                  />
                  {PAYMENT_METHOD_LABELS[method]}
                </label>
              ))}
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

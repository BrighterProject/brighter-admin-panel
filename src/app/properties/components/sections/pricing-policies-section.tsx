import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PropertyFormSchema } from "../../property-form.schema";

const CANCELLATION_OPTIONS = [
  {
    value: "free",
    label: "Безплатен отказ",
    description: "Пълно връщане до 24 часа преди настаняване.",
  },
  {
    value: "moderate",
    label: "Умерена",
    description: "Пълно връщане до 5 дни преди настаняване; 50% след това.",
  },
  {
    value: "strict",
    label: "Строга",
    description: "50% връщане до 7 дни преди настаняване; без връщане след това.",
  },
] as const;

interface PricingPoliciesSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function PricingPoliciesSection({ form }: PricingPoliciesSectionProps) {
  return (
    <section id="section-pricing-policies" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Цени и условия</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ограничения за престой и условия за отказ. Цената на нощувка се задава
          в ценовия календар по-долу.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Валута</FormLabel>
          <Input value="EUR" disabled />
        </FormItem>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="check_in_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Час за настаняване *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="check_out_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Час за напускане *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="min_nights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Мин. нощувки *</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_nights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Макс. нощувки *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cancellation_policy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Политика за отказ *</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-2 mt-1"
              >
                {CANCELLATION_OPTIONS.map((opt) => (
                  <FormItem
                    key={opt.value}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer"
                  >
                    <FormControl>
                      <RadioGroupItem value={opt.value} className="mt-0.5" />
                    </FormControl>
                    <div>
                      <FormLabel className="font-medium cursor-pointer">
                        {opt.label}
                      </FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

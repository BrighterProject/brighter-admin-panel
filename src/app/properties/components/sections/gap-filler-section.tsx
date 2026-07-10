import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { PropertyFormSchema } from "../../property-form.schema";

interface GapFillerSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function GapFillerSection({ form }: GapFillerSectionProps) {
  const enabled = form.watch("enable_gap_filler");

  return (
    <section id="section-gap-filler" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Gap Filler</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Автоматична надценка за кратки пролуки между резервации.
        </p>
      </div>

      <FormField
        control={form.control}
        name="enable_gap_filler"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-lg border p-4">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer font-medium">
              Активирай Gap Filler
            </FormLabel>
          </FormItem>
        )}
      />

      <div className={enabled ? undefined : "pointer-events-none opacity-40"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gap_tax_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Такса за малки пролуки (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={-100}
                    max={100}
                    disabled={!enabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gap_last_minute_window"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Прозорец за last-minute (дни)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    disabled={!enabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

      </div>
    </section>
  );
}

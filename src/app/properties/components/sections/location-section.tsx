import { type UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { PropertyFormSchema } from '../../property-form.schema';

interface LocationSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function LocationSection({ form }: LocationSectionProps) {
  return (
    <section id="section-location" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Location</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Address, city and optional map coordinates.
        </p>
      </div>

      <FormField
        control={form.control}
        name="translations.bg.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address (Bulgarian) *</FormLabel>
            <FormControl>
              <Input placeholder="ул. Витоша 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City *</FormLabel>
            <FormControl>
              <Input placeholder="София" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude (optional)</FormLabel>
              <FormControl>
                <Input placeholder="42.6977" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lng"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude (optional)</FormLabel>
              <FormControl>
                <Input placeholder="23.3219" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Used to show your property on the map.
      </p>

      <FormField
        control={form.control}
        name="has_parking"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="m-0 cursor-pointer">Parking available</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}

import { type UseFormReturn, useController } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RoomsBuilder } from '../rooms-builder';
import type { PropertyFormSchema } from '../../property-form.schema';

interface RoomsCapacitySectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function RoomsCapacitySection({ form }: RoomsCapacitySectionProps) {
  const { field: roomsField } = useController({ control: form.control, name: 'rooms' });

  return (
    <section id="section-rooms-capacity" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Rooms & Capacity</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          How many guests can stay and what rooms does the property have.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { name: 'max_guests', label: 'Max guests *' },
          { name: 'bedrooms',   label: 'Bedrooms *' },
          { name: 'bathrooms',  label: 'Bathrooms *' },
          { name: 'beds',       label: 'Total beds *' },
        ] as const).map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <div className="space-y-2">
        <FormLabel>Room configuration (optional)</FormLabel>
        <p className="text-xs text-muted-foreground">
          Add individual rooms with their bed types for a detailed listing.
        </p>
        <RoomsBuilder value={roomsField.value} onChange={roomsField.onChange} />
      </div>
    </section>
  );
}

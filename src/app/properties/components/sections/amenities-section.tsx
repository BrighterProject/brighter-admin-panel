import { type UseFormReturn, useController } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AmenitySearchInput } from '../amenity-search-input';
import type { PropertyFormSchema } from '../../property-form.schema';
import type { AmenityType } from '../../types';

interface AmenitiesSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function AmenitiesSection({ form }: AmenitiesSectionProps) {
  const { field } = useController({ control: form.control, name: 'amenities' });

  return (
    <section id="section-amenities" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Amenities</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search and select amenities available at your property.
        </p>
      </div>

      <FormItem>
        <FormLabel>Amenities (optional)</FormLabel>
        <AmenitySearchInput
          value={field.value as AmenityType[]}
          onChange={field.onChange}
        />
        <FormMessage />
      </FormItem>
    </section>
  );
}

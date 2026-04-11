import { type UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PropertyFormSchema } from '../../property-form.schema';

const PROPERTY_TYPE_LABELS = {
  apartment: 'Апартамент',
  house: 'Къща',
  villa: 'Вила',
  hotel: 'Хотел',
  hostel: 'Хостел',
  guesthouse: 'Гостилница',
  room: 'Стая',
  other: 'Друго',
} as const;

interface BasicInfoSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <section id="section-basic-info" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Basic Info</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Property type, name and description in Bulgarian.
        </p>
      </div>

      <FormField
        control={form.control}
        name="property_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="translations.bg.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name (Bulgarian) *</FormLabel>
            <FormControl>
              <Input placeholder="Уютен апартамент в центъра" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="translations.bg.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Bulgarian) *</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="Опишете имота…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

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
  isEdit?: boolean;
}

export function BasicInfoSection({ form, isEdit = false }: BasicInfoSectionProps) {
  return (
    <section id="section-basic-info" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Основна информация</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Вид имот, наименование и описание на български.
        </p>
      </div>

      <FormField
        control={form.control}
        name="property_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Вид имот</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете вид…" />
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
        name="registration_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Регистрационен номер на обекта{isEdit ? '' : ' *'}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="напр. АПТ-2024-00123"
                disabled={isEdit}
                readOnly={isEdit}
                {...field}
              />
            </FormControl>
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Регистрационният номер не може да се променя след създаване.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="translations.bg.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Наименование (Български) *</FormLabel>
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
            <FormLabel>Описание (Български) *</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="Опишете имота…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="translations.bg.house_rules"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Правила на имота (Български)</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Правила на имота (по избор)…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

import { type UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { PropertyFormSchema } from '../../property-form.schema';

interface TranslationsSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

type OptionalLocale = 'en' | 'ru';

const LOCALE_LABELS: Record<OptionalLocale, string> = {
  en: 'Английски',
  ru: 'Руски',
};

function LocaleFields({
  form,
  locale,
}: {
  form: UseFormReturn<PropertyFormSchema>;
  locale: OptionalLocale;
}) {
  const label = LOCALE_LABELS[locale];
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{label} (optional)</h4>
      <FormField
        control={form.control}
        name={`translations.${locale}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Наименование</FormLabel>
            <FormControl>
              <Input placeholder={`Наименование на имота на ${label}…`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`translations.${locale}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder={`Описание на ${label}…`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`translations.${locale}.address`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Адрес</FormLabel>
            <FormControl>
              <Input placeholder={`Адрес на ${label}…`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`translations.${locale}.house_rules`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Правила на имота</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder={`Правила на имота на ${label}…`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function TranslationsSection({ form }: TranslationsSectionProps) {
  const bgName = form.watch('translations.bg.name');
  const bgDescription = form.watch('translations.bg.description');
  const bgAddress = form.watch('translations.bg.address');
  const bgHouseRules = form.watch('translations.bg.house_rules');

  return (
    <section id="section-translations" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Преводи</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Добавете преводи на английски и руски. Автоматичен превод — очаквайте.
        </p>
      </div>

      {/* Bulgarian read-only summary */}
      <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-2">
          Български (попълва се в Основна информация и Местоположение)
        </p>
        <p><span className="text-muted-foreground">Наименование:</span> {bgName || <em className="text-muted-foreground">не е попълнено</em>}</p>
        <p><span className="text-muted-foreground">Описание:</span> {bgDescription ? `${bgDescription.slice(0, 80)}…` : <em className="text-muted-foreground">не е попълнено</em>}</p>
        <p><span className="text-muted-foreground">Адрес:</span> {bgAddress || <em className="text-muted-foreground">не е попълнено</em>}</p>
        <p><span className="text-muted-foreground">Правила на имота:</span> {bgHouseRules ? `${bgHouseRules.slice(0, 80)}…` : <em className="text-muted-foreground">не е попълнено</em>}</p>
      </div>

      <Separator />
      <LocaleFields form={form} locale="en" />
      <Separator />
      <LocaleFields form={form} locale="ru" />
    </section>
  );
}

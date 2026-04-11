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
  en: 'English',
  ru: 'Russian',
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
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder={`Property name in ${label}…`} {...field} />
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder={`Description in ${label}…`} {...field} />
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
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder={`Address in ${label}…`} {...field} />
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

  return (
    <section id="section-translations" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Translations</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add English and Russian translations. Auto-translate coming soon.
        </p>
      </div>

      {/* Bulgarian read-only summary */}
      <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-2">
          Bulgarian (filled in Basic Info & Location)
        </p>
        <p><span className="text-muted-foreground">Name:</span> {bgName || <em className="text-muted-foreground">not filled</em>}</p>
        <p><span className="text-muted-foreground">Description:</span> {bgDescription ? `${bgDescription.slice(0, 80)}…` : <em className="text-muted-foreground">not filled</em>}</p>
        <p><span className="text-muted-foreground">Address:</span> {bgAddress || <em className="text-muted-foreground">not filled</em>}</p>
      </div>

      <Separator />
      <LocaleFields form={form} locale="en" />
      <Separator />
      <LocaleFields form={form} locale="ru" />
    </section>
  );
}

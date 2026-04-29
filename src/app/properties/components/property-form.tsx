import { useState, useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { propertyFormSchema, PROPERTY_FORM_DEFAULTS, type PropertyFormSchema } from '../property-form.schema';
import { useSectionCompletion } from '../use-section-completion';
import { PropertyFormNav, FORM_SECTIONS } from './property-form-nav';
import { BasicInfoSection } from './sections/basic-info-section';
import { TranslationsSection } from './sections/translations-section';
import { LocationSection } from './sections/location-section';
import { RoomsCapacitySection } from './sections/rooms-capacity-section';
import { PricingPoliciesSection } from './sections/pricing-policies-section';
import { AmenitiesSection } from './sections/amenities-section';
import { PhotosSection } from './sections/photos-section';
import { DynamicPricingSection } from './sections/dynamic-pricing-section';
import { GapFillerSection } from './sections/gap-filler-section';
import type { Property, WeekdayPrice, DatePriceOverride } from '../types';

interface PropertyFormProps {
  /** Provide to pre-populate for edit mode */
  initialValues?: Partial<PropertyFormSchema>;
  onSubmit: (data: PropertyFormSchema) => void;
  isPending: boolean;
  /** Existing property id — enables dynamic pricing controls in edit mode */
  propertyId?: string;
  weekdayPrices?: WeekdayPrice[];
  dateOverrides?: DatePriceOverride[];
}

function propertyToFormValues(property: Property): PropertyFormSchema {
  const bgTranslation = property.translations.find((t) => t.locale === 'bg');
  const enTranslation = property.translations.find((t) => t.locale === 'en');
  const ruTranslation = property.translations.find((t) => t.locale === 'ru');

  return {
    property_type: property.property_type,
    city: property.city,
    lat: property.lat?.toString() ?? '',
    lng: property.lng?.toString() ?? '',
    has_parking: property.has_parking,
    price_per_night: property.price_per_night,
    currency: property.currency,
    min_nights: property.min_nights,
    max_nights: property.max_nights,
    check_in_time: property.check_in_time,
    check_out_time: property.check_out_time,
    cancellation_policy: property.cancellation_policy,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    beds: property.beds,
    max_guests: property.max_guests,
    rooms: property.rooms,
    amenities: property.amenities,
    images: property.images.map(({ url, is_thumbnail, order }) => ({
      url,
      is_thumbnail,
      order,
    })),
    translations: {
      bg: {
        name: bgTranslation?.name ?? '',
        description: bgTranslation?.description ?? '',
        address: bgTranslation?.address ?? '',
      },
      en: {
        name: enTranslation?.name ?? '',
        description: enTranslation?.description ?? '',
        address: enTranslation?.address ?? '',
      },
      ru: {
        name: ruTranslation?.name ?? '',
        description: ruTranslation?.description ?? '',
        address: ruTranslation?.address ?? '',
      },
    },
  };
}

export { propertyToFormValues };

export function PropertyForm({ initialValues, onSubmit, isPending, propertyId, weekdayPrices, dateOverrides }: PropertyFormProps) {
  const form = useForm<PropertyFormSchema>({
    resolver: zodResolver(propertyFormSchema) as Resolver<PropertyFormSchema>,
    defaultValues: { ...PROPERTY_FORM_DEFAULTS, ...initialValues },
  });

  const sectionStates = useSectionCompletion(form);
  const completedCount = Object.values(sectionStates).filter((s) => s === 'complete').length;
  const allRequiredComplete = [
    sectionStates.basicInfo,
    sectionStates.location,
    sectionStates.roomsCapacity,
    sectionStates.pricingPolicies,
    sectionStates.photos,
  ].every((s) => s === 'complete');

  const [activeSection, setActiveSection] = useState<string>(FORM_SECTIONS[0].id);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    FORM_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="flex gap-8 max-w-5xl mx-auto px-4 pb-24">
      {/* Section nav */}
      <div className="w-52 shrink-0">
        <PropertyFormNav sectionStates={sectionStates} activeSection={activeSection} />
      </div>

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-10 min-w-0"
        >
          <BasicInfoSection form={form} />
          <Separator />
          <TranslationsSection form={form} />
          <Separator />
          <LocationSection form={form} />
          <Separator />
          <RoomsCapacitySection form={form} />
          <Separator />
          <PricingPoliciesSection form={form} />
          <Separator />
          <AmenitiesSection form={form} />
          <Separator />
          <PhotosSection form={form} propertyId={propertyId} />
          <Separator />
          <DynamicPricingSection
            propertyId={propertyId}
            basePricePerNight={form.watch('price_per_night')}
            currency={form.watch('currency') || 'EUR'}
            weekdayPrices={weekdayPrices}
            dateOverrides={dateOverrides}
          />
          <Separator />
          <GapFillerSection form={form} />
        </form>
      </Form>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t px-4 py-3 flex items-center justify-between gap-4">
        <Badge variant="outline" className="text-xs">
          {completedCount}/{FORM_SECTIONS.length} sections complete
        </Badge>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={!allRequiredComplete || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
}

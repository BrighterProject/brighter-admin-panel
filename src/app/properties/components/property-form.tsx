import { useState, useEffect, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  propertyFormSchema,
  PROPERTY_FORM_DEFAULTS,
  type PropertyFormSchema,
} from "../property-form.schema";
import { useSectionCompletion } from "../use-section-completion";
import {
  usePropertyDraft,
  readPropertyDraft,
  clearPropertyDraft,
} from "../use-property-draft";
import { PropertyFormNav, FORM_SECTIONS } from "./property-form-nav";
import { BasicInfoSection } from "./sections/basic-info-section";
import { TranslationsSection } from "./sections/translations-section";
import { LocationSection } from "./sections/location-section";
import { RoomsCapacitySection } from "./sections/rooms-capacity-section";
import { PricingPoliciesSection } from "./sections/pricing-policies-section";
import { AmenitiesSection } from "./sections/amenities-section";
import { PhotosSection } from "./sections/photos-section";
import { DynamicPricingSection } from "./sections/dynamic-pricing-section";
import { PaymentConfigSection } from "./sections/payment-config-section";
import { ChannelSyncSection } from "./sections/channel-sync-section";
import type { Property, DatePrice } from "../types";
import type { PendingPriceRange } from "./sections/dynamic-pricing-section";

interface PropertyFormProps {
  /** Provide to pre-populate for edit mode */
  initialValues?: Partial<PropertyFormSchema>;
  onSubmit: (data: PropertyFormSchema) => void;
  isPending: boolean;
  /** Existing property id — enables dynamic pricing controls in edit mode */
  propertyId?: string;
  /** Current status of the property being edited — controls submit button label */
  propertyStatus?: Property["status"];
  datePrices?: DatePrice[];
  onPendingFilesChange?: (files: File[]) => void;
  onPendingPricesChange?: (ranges: PendingPriceRange[]) => void;
}

function propertyToFormValues(property: Property): PropertyFormSchema {
  const bgTranslation = property.translations.find((t) => t.locale === "bg");
  const enTranslation = property.translations.find((t) => t.locale === "en");
  const ruTranslation = property.translations.find((t) => t.locale === "ru");

  return {
    property_type: property.property_type,
    registration_number: property.registration_number ?? "",
    region_code: property.region_code ?? "",
    settlement_ekatte: property.settlement_ekatte ?? "",
    lat: property.lat?.toString() ?? "",
    lng: property.lng?.toString() ?? "",
    has_parking: property.has_parking,
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
    enable_gap_filler: property.enable_gap_filler ?? false,
    gap_tax_pct: property.gap_tax_pct ?? 10,
    gap_last_minute_window: property.gap_last_minute_window ?? 7,
    payment_config: property.payment_config ?? {
      accepted_methods: ["cash"],
      deposit_pct: 100,
      remaining_method: null,
    },
    translations: {
      bg: {
        name: bgTranslation?.name ?? "",
        description: bgTranslation?.description ?? "",
        address: bgTranslation?.address ?? "",
      },
      en: {
        name: enTranslation?.name ?? "",
        description: enTranslation?.description ?? "",
        address: enTranslation?.address ?? "",
      },
      ru: {
        name: ruTranslation?.name ?? "",
        description: ruTranslation?.description ?? "",
        address: ruTranslation?.address ?? "",
      },
    },
  };
}

export { propertyToFormValues };

export function PropertyForm({
  initialValues,
  onSubmit,
  isPending,
  propertyId,
  propertyStatus,
  datePrices,
  onPendingFilesChange,
  onPendingPricesChange,
}: PropertyFormProps) {
  const draftKey = propertyId ?? "new";
  const isEdit = !!initialValues;

  const form = useForm<PropertyFormSchema>({
    resolver: zodResolver(propertyFormSchema) as Resolver<PropertyFormSchema>,
    defaultValues: {
      ...PROPERTY_FORM_DEFAULTS,
      ...initialValues,
      ...readPropertyDraft(draftKey),
    },
    mode: "onTouched",
  });

  const { saveDraftNow } = usePropertyDraft(draftKey, form);

  const handleSaveDraft = useCallback(() => {
    saveDraftNow();
    toast.success("Черновата е запазена локално в браузъра.");
  }, [saveDraftNow]);

  const handleClearFields = useCallback(() => {
    if (
      !window.confirm(
        "Сигурни ли сте, че искате да изчистите всички попълнени полета? Това действие не може да бъде отменено.",
      )
    ) {
      return;
    }
    clearPropertyDraft(draftKey);
    form.reset({ ...PROPERTY_FORM_DEFAULTS, ...initialValues });
    toast.success("Полетата са изчистени.");
  }, [draftKey, form, initialValues]);

  const [pendingFilesCount, setPendingFilesCount] = useState(0);
  const [pendingPricesCount, setPendingPricesCount] = useState(0);

  const sectionStates = useSectionCompletion(form, {
    pendingFilesCount,
    pendingPricesCount,
  });
  const completedCount = Object.values(sectionStates).filter(
    (s) => s === "complete",
  ).length;
  const allRequiredComplete = [
    sectionStates.basicInfo,
    sectionStates.location,
    sectionStates.roomsCapacity,
    sectionStates.pricingPolicies,
    sectionStates.photos,
  ].every((s) => s === "complete");

  const [activeSection, setActiveSection] = useState<string>(
    FORM_SECTIONS[0].id,
  );

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    FORM_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8 max-w-5xl mx-auto px-4 pb-28">
      {/* Section nav — sticky sidebar on desktop, horizontal pills on mobile */}
      <div className="w-full lg:w-52 lg:shrink-0 min-w-0">
        <PropertyFormNav
          sectionStates={sectionStates}
          activeSection={activeSection}
        />
      </div>

      {/* Form content */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-10 min-w-0"
        >
          <BasicInfoSection form={form} isEdit={isEdit} />
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
          <PhotosSection
            form={form}
            propertyId={propertyId}
            onPendingFilesChange={useCallback(
              (files: File[]) => {
                setPendingFilesCount(files.length);
                onPendingFilesChange?.(files);
              },
              [onPendingFilesChange],
            )}
          />
          <Separator />
          <DynamicPricingSection
            propertyId={propertyId}
            currency={form.watch("currency") || "EUR"}
            datePrices={datePrices}
            onPendingPricesChange={useCallback(
              (ranges) => {
                setPendingPricesCount(ranges.length);
                onPendingPricesChange?.(ranges);
              },
              [onPendingPricesChange],
            )}
          />
          <Separator />
          <PaymentConfigSection form={form} />
          <Separator />
          <ChannelSyncSection propertyId={propertyId} />
        </form>
      </Form>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t px-4 py-3 flex items-center justify-end sm:justify-between gap-3">
        <div className="hidden items-center gap-3 sm:flex">
          <Badge variant="outline" className="text-xs">
            {completedCount}/{FORM_SECTIONS.length} завършени секции
          </Badge>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            disabled={isPending}
            onClick={handleClearFields}
          >
            <RotateCcw className="mr-2 size-4" />
            Изчисти полетата
          </Button>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground sm:hidden"
            disabled={isPending}
            onClick={handleClearFields}
            aria-label="Изчисти полетата"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={isPending}
            onClick={handleSaveDraft}
          >
            Запази чернова
          </Button>
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            disabled={!allRequiredComplete || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit && propertyStatus === "active"
              ? "Запази промените"
              : "Изпрати за одобрение"}
          </Button>
        </div>
      </div>
    </div>
  );
}

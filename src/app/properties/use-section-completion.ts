import { type UseFormReturn } from 'react-hook-form';
import type { PropertyFormSchema } from './property-form.schema';

export type SectionState = 'untouched' | 'incomplete' | 'complete';

export interface SectionStates {
  basicInfo: SectionState;
  translations: SectionState;
  location: SectionState;
  roomsCapacity: SectionState;
  pricingPolicies: SectionState;
  amenities: SectionState;
  photos: SectionState;
}

// Pure function exported for testing without React/form dependencies
export function computeSectionStates(
  values: PropertyFormSchema,
  errors: Record<string, { message?: string }>,
): SectionStates {
  const hasError = (...paths: string[]) => paths.some((p) => !!errors[p]);
  const filled = (v: unknown) => v !== undefined && v !== '' && v !== null && v !== false && v !== 0;

  return {
    // touchedValues: free-text fields the user must type in
    // requiredValues: all fields that must be filled for completeness
    basicInfo: deriveSectionState(
      /* touchedValues */ [values.translations.bg.name, values.translations.bg.description],
      /* requiredValues */ [values.property_type, values.translations.bg.name, values.translations.bg.description],
      hasError('property_type', 'translations.bg.name', 'translations.bg.description'),
    ),
    translations: deriveOptionalSectionState([
      values.translations.en.name,
      values.translations.en.description,
      values.translations.en.address,
      values.translations.ru.name,
      values.translations.ru.description,
      values.translations.ru.address,
    ]),
    location: deriveSectionState(
      /* touchedValues */ [values.translations.bg.address, values.city],
      /* requiredValues */ [values.translations.bg.address, values.city],
      hasError('translations.bg.address', 'city'),
    ),
    roomsCapacity: deriveSectionState(
      /* touchedValues */ [values.max_guests, values.bedrooms, values.bathrooms, values.beds],
      /* requiredValues */ [values.max_guests, values.bedrooms, values.bathrooms, values.beds],
      hasError('max_guests', 'bedrooms', 'bathrooms', 'beds'),
    ),
    pricingPolicies: deriveSectionState(
      /* touchedValues */ [values.price_per_night],
      /* requiredValues */ [values.price_per_night, values.check_in_time, values.check_out_time, values.cancellation_policy],
      hasError('price_per_night', 'check_in_time', 'check_out_time', 'cancellation_policy'),
    ),
    amenities: deriveOptionalSectionState([values.amenities?.length]),
    photos: deriveSectionState(
      /* touchedValues */ [values.images?.length],
      /* requiredValues */ [values.images?.some((img) => img.is_thumbnail)],
      hasError('images'),
    ),
  };

  function deriveSectionState(
    touchedValues: unknown[],
    requiredValues: unknown[],
    hasFieldError: boolean,
  ): SectionState {
    const anyTouched = touchedValues.some(filled);
    if (!anyTouched && !hasFieldError) return 'untouched';
    if (hasFieldError || !requiredValues.every(filled)) return 'incomplete';
    return 'complete';
  }

  function deriveOptionalSectionState(values: unknown[]): SectionState {
    return values.some(filled) ? 'complete' : 'untouched';
  }
}

export function useSectionCompletion(form: UseFormReturn<PropertyFormSchema>): SectionStates {
  const values = form.watch();
  const errors = form.formState.errors as Record<string, { message?: string }>;
  return computeSectionStates(values, errors);
}

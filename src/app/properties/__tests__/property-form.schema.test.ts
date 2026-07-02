import { describe, it, expect } from 'vitest';
import { propertyFormSchema } from '../property-form.schema';

describe('propertyFormSchema', () => {
  it('rejects form values with missing required fields', () => {
    const result = propertyFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  const validPayload = () => ({
    property_type: 'apartment' as const,
    registration_number: 'АПТ-2024-00123',
    region_code: 'SFO',
    settlement_ekatte: '68134',
    lat: '',
    lng: '',
    has_parking: false,
    currency: 'EUR',
    min_nights: 1,
    max_nights: 30,
    check_in_time: '14:00',
    check_out_time: '12:00',
    cancellation_policy: 'free' as const,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    max_guests: 2,
    rooms: [],
    amenities: ['wifi'],
    images: [{ url: 'https://example.com/img.jpg', is_thumbnail: true, order: 0 }],
    translations: {
      bg: { name: 'Апартамент', description: 'Красив апартамент в центъра', address: 'ул. Витоша 1' },
      en: { name: '', description: '', address: '' },
      ru: { name: '', description: '', address: '' },
    },
  });

  it('accepts a valid minimal form payload', () => {
    const result = propertyFormSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it('rejects a partially filled optional locale', () => {
    // Address given for `en` but name/description empty — the backend would
    // reject this with no field error, so the schema must catch it client-side.
    const payload = validPayload();
    payload.translations.en = { name: '', description: '', address: 'Vitosha St 1' };
    const result = propertyFormSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('translations.en.name');
      expect(paths).toContain('translations.en.description');
    }
  });

  it('accepts a fully filled optional locale', () => {
    const payload = validPayload();
    payload.translations.en = {
      name: 'Apartment',
      description: 'Beautiful apartment in the centre',
      address: 'Vitosha St 1',
    };
    const result = propertyFormSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid amenity values', () => {
    const result = propertyFormSchema.safeParse({
      property_type: 'apartment',
      amenities: ['hot_tub'],
    });
    expect(result.success).toBe(false);
  });
});

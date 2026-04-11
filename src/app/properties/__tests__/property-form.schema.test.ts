import { describe, it, expect } from 'vitest';
import { propertyFormSchema } from '../property-form.schema';

describe('propertyFormSchema', () => {
  it('rejects form values with missing required fields', () => {
    const result = propertyFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts a valid minimal form payload', () => {
    const result = propertyFormSchema.safeParse({
      property_type: 'apartment',
      city: 'Sofia',
      lat: '',
      lng: '',
      has_parking: false,
      price_per_night: '80.00',
      currency: 'EUR',
      min_nights: 1,
      max_nights: null,
      check_in_time: '14:00',
      check_out_time: '12:00',
      cancellation_policy: 'free',
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

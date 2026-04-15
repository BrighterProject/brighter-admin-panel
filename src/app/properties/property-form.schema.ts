import { z } from 'zod';

const translationLocaleSchema = z.object({
  name: z.string(),
  description: z.string(),
  address: z.string(),
  house_rules: z.string().optional(),
});

const bedEntrySchema = z.object({
  bed_type: z.enum(['single', 'double', 'queen', 'king', 'sofa_bed', 'bunk', 'crib']),
  count: z.coerce.number().min(1, 'At least 1 bed'),
});

const roomEntrySchema = z.object({
  room_type: z.enum(['bedroom', 'living_room', 'kitchen', 'bathroom', 'studio']),
  count: z.coerce.number().min(1, 'At least 1'),
  beds: z.array(bedEntrySchema),
});

const imageCreateSchema = z.object({
  url: z.string().url('Invalid image URL'),
  is_thumbnail: z.boolean().default(false),
  order: z.number().default(0),
});

export const propertyFormSchema = z.object({
  property_type: z.enum([
    'apartment', 'house', 'villa', 'hotel', 'hostel', 'guesthouse', 'room', 'other',
  ], { required_error: 'Property type is required' }),
  city: z.string().min(1, 'City is required'),
  lat: z.string().regex(/^[-+]?\d*\.?\d*$/, 'Invalid latitude').optional().or(z.literal('')),
  lng: z.string().regex(/^[-+]?\d*\.?\d*$/, 'Invalid longitude').optional().or(z.literal('')),
  has_parking: z.boolean().default(false),
  price_per_night: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price — use format like 80 or 80.50'),
  currency: z.string().length(3, 'Must be 3 characters').default('EUR'),
  min_nights: z.coerce.number().min(1, 'Minimum 1 night').default(1),
  max_nights: z.coerce.number().min(1).nullable().optional(),
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  cancellation_policy: z.enum(['free', 'moderate', 'strict'], {
    required_error: 'Cancellation policy is required',
  }),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative'),
  beds: z.coerce.number().min(1, 'At least 1 bed'),
  max_guests: z.coerce.number().min(1, 'At least 1 guest'),
  rooms: z.array(roomEntrySchema),
  amenities: z.array(
    z.enum([
      'wifi', 'air_conditioning', 'kitchen', 'washing_machine', 'fireplace', 'bbq',
      'mountain_view', 'ski_storage', 'breakfast_included', 'reception_24h',
      'sea_view', 'balcony', 'pool', 'garden', 'pet_friendly', 'coffee_machine',
    ]),
  ),
  images: z.array(imageCreateSchema),
  translations: z.object({
    bg: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      description: z.string().min(10, 'Description must be at least 10 characters'),
      address: z.string().min(1, 'Address is required'),
      house_rules: z.string().optional(),
    }),
    en: translationLocaleSchema,
    ru: translationLocaleSchema,
  }),
});

export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;

export const PROPERTY_FORM_DEFAULTS: PropertyFormSchema = {
  property_type: 'apartment',
  city: '',
  lat: '',
  lng: '',
  has_parking: false,
  price_per_night: '',
  currency: 'EUR',
  min_nights: 1,
  max_nights: null,
  check_in_time: '14:00',
  check_out_time: '11:00',
  cancellation_policy: 'free',
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  max_guests: 2,
  rooms: [],
  amenities: [],
  images: [],
  translations: {
    bg: { name: '', description: '', address: '', house_rules: '' },
    en: { name: '', description: '', address: '', house_rules: '' },
    ru: { name: '', description: '', address: '', house_rules: '' },
  },
};

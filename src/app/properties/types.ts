export type PropertyType =
  | 'apartment' | 'house' | 'villa' | 'hotel'
  | 'hostel' | 'guesthouse' | 'room' | 'other';

export type PropertyStatus =
  | 'active' | 'inactive' | 'maintenance' | 'pending_approval';

export type AmenityType =
  | 'wifi' | 'air_conditioning' | 'kitchen' | 'washing_machine'
  | 'fireplace' | 'bbq' | 'mountain_view' | 'ski_storage'
  | 'breakfast_included' | 'reception_24h' | 'sea_view' | 'balcony'
  | 'pool' | 'garden' | 'pet_friendly' | 'coffee_machine';

export const AMENITY_LABELS: Record<AmenityType, string> = {
  wifi: 'Wi-Fi',
  air_conditioning: 'Климатик',
  kitchen: 'Кухня',
  washing_machine: 'Пералня',
  fireplace: 'Камина',
  bbq: 'Барбекю',
  mountain_view: 'Планинска гледка',
  ski_storage: 'Ски гардероб',
  breakfast_included: 'Закуска включена',
  reception_24h: 'Рецепция 24ч',
  sea_view: 'Морска гледка',
  balcony: 'Балкон',
  pool: 'Басейн',
  garden: 'Градина',
  pet_friendly: 'Домашни любимци',
  coffee_machine: 'Кафемашина',
};

export const ALL_AMENITIES: AmenityType[] = Object.keys(AMENITY_LABELS) as AmenityType[];

export type CancellationPolicy = 'free' | 'moderate' | 'strict';

export type RoomType = 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'studio';

export type BedType = 'single' | 'double' | 'queen' | 'king' | 'sofa_bed' | 'bunk' | 'crib';

export interface BedEntry {
  bed_type: BedType;
  count: number;
}

export interface RoomEntry {
  room_type: RoomType;
  count: number;
  beds: BedEntry[];
}

export interface PropertyTranslation {
  id: string;
  property_id: string;
  locale: 'bg' | 'en' | 'ru';
  name: string;
  description: string;
  address: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_thumbnail: boolean;
  order: number;
}

export interface PropertyImageCreate {
  url: string;
  is_thumbnail?: boolean;
  order?: number;
}

export interface PropertyImageUpdate {
  url?: string | null;
  is_thumbnail?: boolean | null;
  order?: number | null;
}

export interface PropertyUnavailability {
  id: string;
  property_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
}

export interface PropertyUnavailabilityCreate {
  start_datetime: string;
  end_datetime: string;
  reason?: string | null;
}

export interface PropertyUnavailabilityUpdate {
  start_datetime?: string | null;
  end_datetime?: string | null;
  reason?: string | null;
}

export interface Property {
  id: string;
  owner_id: string;
  property_type: PropertyType;
  status: PropertyStatus;
  city: string;
  lat: number | null;
  lng: number | null;
  price_per_night: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  max_guests: number;
  amenities: AmenityType[];
  has_parking: boolean;
  check_in_time: string;
  check_out_time: string;
  min_nights: number;
  max_nights: number | null;
  cancellation_policy: CancellationPolicy;
  rating: string;
  total_reviews: number;
  rooms: RoomEntry[];
  images: PropertyImage[];
  unavailabilities: PropertyUnavailability[];
  translations: PropertyTranslation[];
}

export interface PropertyListItem {
  id: string;
  owner_id: string;
  property_type: PropertyType;
  status: PropertyStatus;
  city: string;
  price_per_night: string;
  currency: string;
  max_guests: number;
  bedrooms: number;
  rating: string;
  total_reviews: number;
  thumbnail: string | null;
  translations: Pick<PropertyTranslation, 'locale' | 'name'>[];
}

export interface PropertyFormValues {
  property_type: PropertyType;
  city: string;
  lat: string;
  lng: string;
  has_parking: boolean;
  price_per_night: string;
  currency: string;
  min_nights: number;
  max_nights: number | null;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: CancellationPolicy;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  max_guests: number;
  rooms: RoomEntry[];
  amenities: AmenityType[];
  images: PropertyImageCreate[];
  translations: {
    bg: { name: string; description: string; address: string };
    en: { name: string; description: string; address: string };
    ru: { name: string; description: string; address: string };
  };
}

export type PropertyUpdate = Partial<PropertyFormValues>;

export interface PropertyStatusUpdate {
  status: PropertyStatus;
}

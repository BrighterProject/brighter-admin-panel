export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "hotel"
  | "hostel"
  | "guesthouse"
  | "room"
  | "other";

export type PropertyStatus =
  | "active"
  | "inactive"
  | "maintenance"
  | "pending_approval";

export type AmenityType =
  | "wifi"
  | "air_conditioning"
  | "kitchen"
  | "washing_machine"
  | "fireplace"
  | "bbq"
  | "mountain_view"
  | "ski_storage"
  | "breakfast_included"
  | "reception_24h"
  | "sea_view"
  | "balcony"
  | "pool"
  | "garden"
  | "pet_friendly"
  | "coffee_machine";

export const AMENITY_LABELS: Record<AmenityType, string> = {
  wifi: "Wi-Fi",
  air_conditioning: "Климатик",
  kitchen: "Кухня",
  washing_machine: "Пералня",
  fireplace: "Камина",
  bbq: "Барбекю",
  mountain_view: "Планинска гледка",
  ski_storage: "Ски гардероб",
  breakfast_included: "Закуска включена",
  reception_24h: "Рецепция 24ч",
  sea_view: "Морска гледка",
  balcony: "Балкон",
  pool: "Басейн",
  garden: "Градина",
  pet_friendly: "Домашни любимци",
  coffee_machine: "Кафемашина",
};

export const ALL_AMENITIES: AmenityType[] = Object.keys(
  AMENITY_LABELS,
) as AmenityType[];

export type CancellationPolicy = "free" | "moderate" | "strict";

export type RoomType =
  | "bedroom"
  | "living_room"
  | "kitchen"
  | "bathroom"
  | "studio";

export type BedType =
  | "single"
  | "double"
  | "queen"
  | "king"
  | "sofa_bed"
  | "bunk"
  | "crib";

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
  locale: "bg" | "en" | "ru";
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
  start_date: string;
  end_date: string;
  reason: string | null;
}

export interface PropertyUnavailabilityCreate {
  start_date: string;
  end_date: string;
  reason?: string | null;
}

export interface PropertyUnavailabilityUpdate {
  start_date?: string | null;
  end_date?: string | null;
  reason?: string | null;
}

export interface Region {
  code: string;
  name: string;
}

export interface Settlement {
  ekatte: string;
  tvm: string;
  name: string;
}

export interface SettlementCenter {
  ekatte: string;
  name: string;
  lat: number | null;
  lon: number | null;
}

export interface Property {
  id: string;
  owner_id: string;
  property_type: PropertyType;
  status: PropertyStatus;
  region_code: string | null;
  settlement_ekatte: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  registration_number: string | null;
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
  max_nights: number;
  cancellation_policy: CancellationPolicy;
  enable_gap_filler: boolean;
  gap_tax_pct: number;
  gap_last_minute_window: number;
  payment_config: {
    accepted_methods: string[];
    deposit_pct: number;
    remaining_method: string | null;
  } | null;
  rating: string;
  total_reviews: number;
  rooms: RoomEntry[];
  images: PropertyImage[];
  unavailabilities: PropertyUnavailability[];
  translations: PropertyTranslation[];
  weekday_prices: WeekdayPrice[];
  date_price_overrides: DatePriceOverride[];
}

export interface PropertyListItem {
  id: string;
  owner_id: string;
  property_type: PropertyType;
  status: PropertyStatus;
  region_code: string | null;
  settlement_ekatte: string | null;
  city: string | null;
  name: string;
  description: string;
  price_per_night: string;
  currency: string;
  max_guests: number;
  bedrooms: number;
  rooms: RoomEntry[];
  rating: string;
  total_reviews: number;
  thumbnail: string | null;
}

export interface PropertyFormValues {
  property_type: PropertyType;
  region_code: string;
  settlement_ekatte: string;
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

export interface WeekdayPrice {
  id: string;
  property_id: string;
  weekday: number;
  price: string;
}

export interface DatePriceOverride {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  price: string;
  label: string | null;
}

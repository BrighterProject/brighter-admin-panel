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

// Flat amenity taxonomy mirroring the backend `AmenityType` enum (BTR-53).
// Category grouping for the owner form lives in AMENITY_CATEGORIES below.
export type AmenityType =
  // Views & location
  | "sea_view"
  | "mountain_view"
  | "lake_view"
  | "beachfront"
  | "ski_to_door"
  | "city_center"
  // Kitchen & dining
  | "kitchen"
  | "kitchenette"
  | "coffee_machine"
  | "dishwasher"
  | "microwave"
  | "oven"
  | "restaurant"
  // Comfort
  | "wifi"
  | "air_conditioning"
  | "heating"
  | "fireplace"
  | "washing_machine"
  | "dryer"
  | "iron"
  | "tv"
  | "workspace"
  // Outdoors
  | "pool"
  | "indoor_pool"
  | "garden"
  | "bbq"
  | "balcony"
  | "terrace"
  | "hot_tub"
  // Family
  | "pet_friendly"
  | "crib"
  | "high_chair"
  | "playground"
  | "board_games"
  // Wellness
  | "sauna"
  | "spa"
  | "gym"
  | "massage"
  // Services
  | "reception_24h"
  | "breakfast_included"
  | "airport_shuttle"
  | "ev_charger"
  | "luggage_storage"
  | "daily_housekeeping"
  | "ski_storage"
  // Safety & accessibility
  | "smoke_alarm"
  | "fire_extinguisher"
  | "first_aid_kit"
  | "elevator"
  | "ground_floor"
  | "step_free_access";

export const AMENITY_LABELS: Record<AmenityType, string> = {
  // Views & location
  sea_view: "Морска гледка",
  mountain_view: "Планинска гледка",
  lake_view: "Гледка към езеро",
  beachfront: "На първа линия",
  ski_to_door: "Ски до вратата",
  city_center: "Център на града",
  // Kitchen & dining
  kitchen: "Кухня",
  kitchenette: "Кухненски бокс",
  coffee_machine: "Кафемашина",
  dishwasher: "Съдомиялна",
  microwave: "Микровълнова",
  oven: "Фурна",
  restaurant: "Ресторант",
  // Comfort
  wifi: "Wi-Fi",
  air_conditioning: "Климатик",
  heating: "Отопление",
  fireplace: "Камина",
  washing_machine: "Пералня",
  dryer: "Сушилня",
  iron: "Ютия",
  tv: "Телевизор",
  workspace: "Работно място",
  // Outdoors
  pool: "Басейн",
  indoor_pool: "Закрит басейн",
  garden: "Градина",
  bbq: "Барбекю",
  balcony: "Балкон",
  terrace: "Тераса",
  hot_tub: "Джакузи",
  // Family
  pet_friendly: "Домашни любимци",
  crib: "Бебешко креватче",
  high_chair: "Столче за хранене",
  playground: "Детска площадка",
  board_games: "Настолни игри",
  // Wellness
  sauna: "Сауна",
  spa: "Спа",
  gym: "Фитнес",
  massage: "Масаж",
  // Services
  reception_24h: "Рецепция 24ч",
  breakfast_included: "Закуска включена",
  airport_shuttle: "Трансфер до летище",
  ev_charger: "Зарядно за електромобил",
  luggage_storage: "Съхранение на багаж",
  daily_housekeeping: "Ежедневно почистване",
  ski_storage: "Ски гардероб",
  // Safety & accessibility
  smoke_alarm: "Датчик за дим",
  fire_extinguisher: "Пожарогасител",
  first_aid_kit: "Аптечка",
  elevator: "Асансьор",
  ground_floor: "Партер",
  step_free_access: "Достъп без стъпала",
};

// Category → amenity grouping for the owner form (BTR-53). Mirrors the public
// frontend's AMENITY_CATEGORIES; keep both and the backend enum in sync.
export interface AmenityCategory {
  key: string;
  label: string;
  amenities: readonly AmenityType[];
}

export const AMENITY_CATEGORIES: readonly AmenityCategory[] = [
  {
    key: "views",
    label: "Изгледи и локация",
    amenities: [
      "sea_view",
      "mountain_view",
      "lake_view",
      "beachfront",
      "ski_to_door",
      "city_center",
    ],
  },
  {
    key: "kitchen",
    label: "Кухня и хранене",
    amenities: [
      "kitchen",
      "kitchenette",
      "coffee_machine",
      "dishwasher",
      "microwave",
      "oven",
      "restaurant",
    ],
  },
  {
    key: "comfort",
    label: "Комфорт",
    amenities: [
      "wifi",
      "air_conditioning",
      "heating",
      "fireplace",
      "washing_machine",
      "dryer",
      "iron",
      "tv",
      "workspace",
    ],
  },
  {
    key: "outdoors",
    label: "На открито",
    amenities: [
      "pool",
      "indoor_pool",
      "garden",
      "bbq",
      "balcony",
      "terrace",
      "hot_tub",
    ],
  },
  {
    key: "family",
    label: "Семейство",
    amenities: ["pet_friendly", "crib", "high_chair", "playground", "board_games"],
  },
  {
    key: "wellness",
    label: "Уелнес",
    amenities: ["sauna", "spa", "gym", "massage"],
  },
  {
    key: "services",
    label: "Услуги",
    amenities: [
      "reception_24h",
      "breakfast_included",
      "airport_shuttle",
      "ev_charger",
      "luggage_storage",
      "daily_housekeeping",
      "ski_storage",
    ],
  },
  {
    key: "safety",
    label: "Безопасност и достъпност",
    amenities: [
      "smoke_alarm",
      "fire_extinguisher",
      "first_aid_kit",
      "elevator",
      "ground_floor",
      "step_free_access",
    ],
  },
];

export const ALL_AMENITIES: AmenityType[] = AMENITY_CATEGORIES.flatMap(
  (cat) => [...cat.amenities],
);

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
  // Derived cheapest nightly rate (system-owned); null when no pricing is set.
  price_from: string | null;
  has_valid_pricing: boolean;
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
  date_prices: DatePrice[];
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
  price_from: string | null;
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

export interface DatePrice {
  id: string;
  property_id: string;
  date: string;
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

// ─── Channel calendar sync (BTR-41) ────────────────────────────────────────────

export type FeedSyncStatus = "ok" | "fetch_error" | "parse_error";

/** Channels that expose an importable iCal feed (matches backend BookingChannel). */
export type FeedChannel = "booking_com" | "airbnb" | "dev";

export interface CalendarFeed {
  id: string;
  property_id: string;
  channel: FeedChannel;
  url: string;
  is_active: boolean;
  last_synced_at: string | null;
  last_status: FeedSyncStatus | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarFeedCreate {
  property_id: string;
  channel: FeedChannel;
  url: string;
}

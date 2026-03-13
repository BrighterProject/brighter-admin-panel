export type PropertyStatus =
  | "active"
  | "inactive"
  | "maintenance"
  | "pending_approval";

export type SportType =
  | "football"
  | "basketball"
  | "tennis"
  | "volleyball"
  | "swimming"
  | "gym"
  | "padel"
  | "other";

export type PropertyImage = {
  id: string;
  property_id: string;
  url: string;
  is_thumbnail: boolean;
  order: number;
};

export type PropertyImageCreate = {
  url: string;
  is_thumbnail?: boolean;
  order?: number;
};

export type PropertyImageUpdate = {
  url?: string | null;
  is_thumbnail?: boolean | null;
  order?: number | null;
};

export type PropertyUnavailability = {
  id: string;
  property_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
};

export type PropertyUnavailabilityCreate = {
  start_datetime: string;
  end_datetime: string;
  reason?: string | null;
};

export type PropertyUnavailabilityUpdate = {
  start_datetime?: string | null;
  end_datetime?: string | null;
  reason?: string | null;
};

export type DayHours = {
  open: string;
  close: string;
};

export type WorkingHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export type Property = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  sport_types: SportType[];
  address: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  price_per_hour: string;
  currency: string;
  capacity: number;
  is_indoor: boolean;
  has_parking: boolean;
  has_changing_rooms: boolean;
  has_showers: boolean;
  has_equipment_rental: boolean;
  amenities: string[];
  working_hours: WorkingHours | null;
  status: PropertyStatus;
  rating: string;
  total_reviews: number;
  total_bookings: number;
  updated_at: string;
  images: PropertyImage[];
  unavailabilities: PropertyUnavailability[];
};

export type PropertyListItem = {
  id: string;
  name: string;
  city: string;
  sport_types: SportType[];
  status: PropertyStatus;
  price_per_hour: string;
  currency: string;
  capacity: number;
  is_indoor: boolean;
  rating: string;
  total_reviews: number;
  thumbnail: string | null;
};

export type PropertyFormValues = {
  name: string;
  description: string;
  sport_types: SportType[];
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  price_per_hour: string;
  currency: string;
  capacity: number;
  is_indoor: boolean;
  has_parking: boolean;
  has_changing_rooms: boolean;
  has_showers: boolean;
  has_equipment_rental: boolean;
  amenities: string[];
  working_hours: WorkingHours;
};

export type PropertyUpdate = Partial<PropertyFormValues>;

export type PropertyStatusUpdate = {
  status: PropertyStatus;
};

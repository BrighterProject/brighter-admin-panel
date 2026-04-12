export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Booking = {
  id: string;
  property_id: string;
  property_owner_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  price_per_night: string;
  total_price: string;
  currency: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  special_requests: string | null;
  updated_at: string;
  // Enriched by bookings-ms at query time
  property_name: string | null;
  customer_username: string | null;
  customer_full_name: string | null;
  owner_username: string | null;
  owner_full_name: string | null;
};

export type BookingStatusUpdate = {
  status: BookingStatus;
};

export type BookingFilters = {
  property_id?: string;
  status?: BookingStatus;
  page?: number;
  page_size?: number;
};

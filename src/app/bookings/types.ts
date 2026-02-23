export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Booking = {
  id: string;
  venue_id: string;
  venue_owner_id: string;
  user_id: string;
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  price_per_hour: string;
  total_price: string;
  currency: string;
  notes: string | null;
  updated_at: string;
};

export type BookingStatusUpdate = {
  status: BookingStatus;
};

export type BookingFilters = {
  venue_id?: string;
  status?: BookingStatus;
  page?: number;
  page_size?: number;
};

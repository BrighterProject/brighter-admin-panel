import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { Booking, BookingStatus, BookingFilters } from "./types";
import { api } from "@/lib/api";

const BOOKINGS_KEY = ["bookings"];

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, filters],
    queryFn: () => fetchBookings(filters),
  });
}

const fetchBookings = (filters: BookingFilters) =>
  api.get<Booking[]>("/bookings/", { params: filters }).then((r) => r.data);

export function useBooking(id: string | null) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, id],
    queryFn: () => fetchBooking(id!),
    enabled: !!id,
  });
}

const fetchBooking = (id: string) =>
  api.get<Booking>(`/bookings/${id}`).then((r) => r.data);

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api
        .patch<Booking>(`/bookings/${id}/status`, { status })
        .then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: BOOKINGS_KEY });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BOOKINGS_KEY });
    },
  });
}

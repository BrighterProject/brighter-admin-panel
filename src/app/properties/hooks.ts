import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type {
  Property,
  PropertyListItem,
  PropertyUpdate,
  PropertyStatus,
  PropertyImage,
  PropertyImageCreate,
  PropertyImageUpdate,
  PropertyUnavailability,
  PropertyUnavailabilityCreate,
  PropertyUnavailabilityUpdate,
  DatePrice,
  Region,
  Settlement,
  SettlementCenter,
  CalendarFeed,
  CalendarFeedCreate,
} from './types';
import type { PropertyFormSchema } from './property-form.schema';
import { api } from '@/lib/api';

const PROPERTIES_KEY = ['properties'];
const REGIONS_KEY = ['regions'];

// ─── Region / Settlement Queries ──────────────────────────────────────────────

export function useRegions(lang = 'bg') {
  return useQuery({
    queryKey: [...REGIONS_KEY, lang],
    queryFn: () => api.get<Region[]>('/regions/', { params: { lang } }).then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useSettlements(regionCode: string | null, lang = 'bg') {
  return useQuery({
    queryKey: [...REGIONS_KEY, regionCode, 'settlements', lang],
    queryFn: () =>
      api
        .get<Settlement[]>(`/regions/${regionCode}/settlements`, { params: { lang } })
        .then((r) => r.data),
    enabled: !!regionCode,
    staleTime: Infinity,
  });
}

/** Approximate map center for a settlement, used to pan the location picker. */
export function useSettlementCenter(ekatte: string | null) {
  return useQuery({
    queryKey: [...REGIONS_KEY, 'center', ekatte],
    queryFn: () =>
      api
        .get<SettlementCenter>(`/regions/settlements/${ekatte}`)
        .then((r) => r.data),
    enabled: !!ekatte,
    staleTime: Infinity,
  });
}

// ─── Property Queries ─────────────────────────────────────────────────────────

export interface PropertiesQueryParams {
  owner_id?: string;
  page?: number;
  page_size?: number;
}

export interface PropertiesResult {
  items: PropertyListItem[];
  total: number;
}

/**
 * POSTs to `/properties/search` — an authenticated admin-panel listing.
 * The public `GET /properties/` route (unauthenticated by design, so
 * browsing works for anonymous visitors) hides drafts and unpriced
 * properties; this endpoint runs through the JWT-authenticated router so
 * admins see every property (any status) and owners see all of their own,
 * including pending-approval/unpriced ones.
 */
export function useProperties(params?: PropertiesQueryParams) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, params],
    queryFn: async () => {
      const res = await api.post<PropertyListItem[]>('/properties/search', undefined, { params });
      const total = Number(res.headers['x-total-count'] ?? res.data.length);
      return { items: res.data, total } satisfies PropertiesResult;
    },
    placeholderData: keepPreviousData,
  });
}

export function useProperty(id: string | null) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, id],
    queryFn: () => api.get<Property>(`/properties/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

// ─── Property Mutations ───────────────────────────────────────────────────────

export function useAddProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyFormSchema) => {
      const translations = Object.entries(data.translations)
        .filter(([locale, t]) => {
          if (locale === 'bg') return true;
          return t.name.trim() !== '' || t.description.trim() !== '' || t.address.trim() !== '';
        })
        .map(([locale, t]) => ({
          locale,
          name: t.name,
          description: t.description,
          address: t.address,
          house_rules: t.house_rules?.trim() || null,
        }));

      const payload = {
        ...data,
        translations,
        lat: data.lat === '' || data.lat === undefined ? null : parseFloat(data.lat as string),
        lng: data.lng === '' || data.lng === undefined ? null : parseFloat(data.lng as string),
      };
      return api.post<Property>('/properties/', payload).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyUpdate }) => {
      // Transform dict-keyed translations: filter out empty non-bg locales,
      // keep only locales that have at least one non-empty field.
      const translations = data.translations
        ? Object.fromEntries(
            Object.entries(data.translations).filter(([locale, t]) => {
              if (locale === 'bg') return true;
              const tr = t as Record<string, string | undefined>;
              return (
                (tr.name?.trim() ?? '') !== '' ||
                (tr.description?.trim() ?? '') !== '' ||
                (tr.address?.trim() ?? '') !== ''
              );
            }),
          )
        : undefined;

      const payload = {
        ...data,
        ...(translations !== undefined && { translations }),
        ...(data.lat !== undefined && { lat: (data.lat as string) === '' ? null : parseFloat(data.lat as string) }),
        ...(data.lng !== undefined && { lng: (data.lng as string) === '' ? null : parseFloat(data.lng as string) }),
      };
      return api.patch<Property>(`/properties/${id}`, payload).then((r) => r.data);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, updated.id] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: (_, id) => {
      qc.setQueriesData<PropertyListItem[]>({ queryKey: PROPERTIES_KEY }, (prev) =>
        Array.isArray(prev) ? prev.filter((v) => v.id !== id) : prev,
      );
    },
  });
}

export function useUpdatePropertyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      api.patch(`/properties/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (_, { id, status }) => {
      qc.setQueriesData<PropertyListItem[]>({ queryKey: PROPERTIES_KEY }, (prev) =>
        Array.isArray(prev)
          ? prev.map((v) => (v.id === id ? { ...v, status } : v))
          : prev,
      );
    },
  });
}

// ─── Image Mutations ──────────────────────────────────────────────────────────

export function usePropertyImages(propertyId: string | null) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, propertyId, 'images'],
    queryFn: () =>
      api.get<PropertyImage[]>(`/properties/${propertyId}/images`).then((r) => r.data),
    enabled: !!propertyId,
  });
}

export function useAddPropertyImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: PropertyImageCreate }) =>
      api.post<PropertyImage>(`/properties/${propertyId}/images`, data).then((r) => r.data),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

export function useUploadPropertyImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, file }: { propertyId: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      return api
        .post<PropertyImage>(`/properties/${propertyId}/images/upload`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

export function useUpdatePropertyImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, imageId, data,
    }: { propertyId: string; imageId: string; data: PropertyImageUpdate }) =>
      api.patch<PropertyImage>(`/properties/${propertyId}/images/${imageId}`, data).then((r) => r.data),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

export function useDeletePropertyImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, imageId }: { propertyId: string; imageId: string }) =>
      api.delete(`/properties/${propertyId}/images/${imageId}`),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

export function useReorderPropertyImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, imageIds }: { propertyId: string; imageIds: string[] }) =>
      api
        .put<PropertyImage[]>(`/properties/${propertyId}/images/reorder`, { image_ids: imageIds })
        .then((r) => r.data),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

// ─── Unavailability Mutations ─────────────────────────────────────────────────

export function usePropertyUnavailabilities(propertyId: string | null) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, propertyId, 'unavailabilities'],
    queryFn: () =>
      api
        .get<PropertyUnavailability[]>(`/properties/${propertyId}/unavailabilities`)
        .then((r) => r.data),
    enabled: !!propertyId,
  });
}

export function useCreatePropertyUnavailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, data,
    }: { propertyId: string; data: PropertyUnavailabilityCreate }) =>
      api
        .post<PropertyUnavailability>(`/properties/${propertyId}/unavailabilities`, data)
        .then((r) => r.data),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId, 'unavailabilities'] });
    },
  });
}

export function useUpdatePropertyUnavailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, unavailabilityId, data,
    }: { propertyId: string; unavailabilityId: string; data: PropertyUnavailabilityUpdate }) =>
      api
        .patch<PropertyUnavailability>(
          `/properties/${propertyId}/unavailabilities/${unavailabilityId}`,
          data,
        )
        .then((r) => r.data),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId, 'unavailabilities'] });
    },
  });
}

export function useDeletePropertyUnavailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId, unavailabilityId,
    }: { propertyId: string; unavailabilityId: string }) =>
      api.delete(`/properties/${propertyId}/unavailabilities/${unavailabilityId}`),
    onSuccess: (_, { propertyId }) => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId, 'unavailabilities'] });
    },
  });
}

// ─── Per-date Pricing ─────────────────────────────────────────────────────────

/** Upsert one nightly price across an inclusive date range (one request). */
export function useSetDatePrices(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { start_date: string; end_date: string; price: string }) =>
      api
        .put<DatePrice[]>(`/properties/${propertyId}/pricing/dates`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

/** Clear pricing across an inclusive date range → those nights become unavailable. */
export function useClearDatePrices(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (range: { start_date: string; end_date: string }) =>
      api.delete(`/properties/${propertyId}/pricing/dates`, { params: range }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...PROPERTIES_KEY, propertyId] });
    },
  });
}

// ─── Channel calendar sync (BTR-41) ────────────────────────────────────────────
// Feeds live in bookings-ms under /bookings/calendar-feeds (Traefik strips /api).

const CALENDAR_FEEDS_KEY = ['calendar-feeds'];

export function useCalendarFeeds(propertyId: string | undefined) {
  return useQuery({
    queryKey: [...CALENDAR_FEEDS_KEY, propertyId],
    queryFn: () =>
      api
        .get<CalendarFeed[]>('/bookings/calendar-feeds', {
          params: { property_id: propertyId },
        })
        .then((r) => r.data),
    enabled: !!propertyId,
  });
}

export function useCreateCalendarFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CalendarFeedCreate) =>
      api.post<CalendarFeed>('/bookings/calendar-feeds', data).then((r) => r.data),
    onSuccess: (_, { property_id }) => {
      qc.invalidateQueries({ queryKey: [...CALENDAR_FEEDS_KEY, property_id] });
    },
  });
}

export function useDeleteCalendarFeed(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (feedId: string) => api.delete(`/bookings/calendar-feeds/${feedId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CALENDAR_FEEDS_KEY, propertyId] });
    },
  });
}

export function useSyncCalendarFeed(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (feedId: string) =>
      api
        .post<CalendarFeed>(`/bookings/calendar-feeds/${feedId}/sync-now`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...CALENDAR_FEEDS_KEY, propertyId] });
    },
  });
}

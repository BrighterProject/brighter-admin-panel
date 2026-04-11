import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from './types';
import type { PropertyFormSchema } from './property-form.schema';
import { api } from '@/lib/api';

const PROPERTIES_KEY = ['properties'];

// ─── Property Queries ─────────────────────────────────────────────────────────

export function useProperties(params?: { owner_id?: string }) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, params],
    queryFn: () => api.get<PropertyListItem[]>('/properties/', { params }).then((r) => r.data),
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
      const payload = {
        ...data,
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
      const payload = {
        ...data,
        ...(data.lat !== undefined && { lat: data.lat === '' ? null : parseFloat(data.lat as string) }),
        ...(data.lng !== undefined && { lng: data.lng === '' ? null : parseFloat(data.lng as string) }),
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

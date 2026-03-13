import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { User, UserFormValues, UserUpdate } from "./types";
import { api } from "@/lib/api";

export const OWNER_SCOPES = [
  "users:me",
  "properties:read",
  "properties:me",
  "properties:write",
  "properties:delete",
  "properties:images",
  "properties:schedule",
  "bookings:read",
  "bookings:write",
  "bookings:cancel",
  "bookings:manage",
  "payments:read",
];

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers });
}

export function useScopes() {
  return useQuery({ queryKey: ["scopes"], queryFn: fetchScopes });
}

const fetchUsers = () => api.get<User[]>("/users/").then((r) => r.data);
const fetchScopes = () => api.get<string[]>("/scopes/").then((r) => r.data);

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get<User>(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useAddUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormValues) =>
      api.post<User>("/users/", data).then((r) => r.data),
    onSuccess: (newUser) => {
      qc.setQueryData<User[]>(["users"], (prev = []) => [newUser, ...prev]);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: (_, id) => {
      qc.setQueryData<User[]>(["users"], (prev = []) =>
        prev.filter((u) => u.id !== id),
      );
    },
  });
}

export function useUpdateScopes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scopes }: { id: string; scopes: string[] }) =>
      api
        .put<{ scopes: string[] }>(`/users/${id}/scopes`, { scopes })
        .then((r) => r.data),
    onSuccess: (_, { id, scopes }) => {
      qc.setQueryData<User[]>(["users"], (prev = []) =>
        prev.map((u) => (u.id === id ? { ...u, scopes } : u)),
      );
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      api.patch<User>(`/users/${id}`, data).then((r) => r.data),
    onSuccess: (updatedUser) => {
      qc.setQueryData<User[]>(["users"], (prev = []) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    },
  });
}

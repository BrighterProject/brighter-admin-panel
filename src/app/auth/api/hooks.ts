import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api as apiClient } from "@/lib/api";
import type {
  UserRead,
  UserPublic,
  UserCreate,
  Token,
  UserScopesUpdate,
} from "./types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<Token>("/auth/token", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = async () => {
    await apiClient.post("/auth/logout").catch(() => {});
    queryClient.clear();
  };

  return logout;
};

// --- USERS ---
export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserRead[]>("/users/");
      return data;
    },
    enabled,
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserPublic>("/users/@me/get");
      return data;
    },
    enabled: typeof window !== "undefined",
    retry: false,
    staleTime: Infinity,
  });
};

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<UserRead>(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: UserCreate) => {
      const { data } = await apiClient.post<UserPublic>("/users/", newUser);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// --- SCOPES ---
export const useAllScopes = () => {
  return useQuery({
    queryKey: ["scopes"],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>("/scopes/");
      return data;
    },
  });
};

export const useUserScopes = (userId: number) => {
  return useQuery({
    queryKey: ["users", userId, "scopes"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserScopesUpdate>(
        `/users/${userId}/scopes`,
      );
      return data;
    },
    enabled: !!userId,
  });
};

export const useSetUserScopes = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scopes: UserScopesUpdate) => {
      const { data } = await apiClient.put<UserScopesUpdate>(
        `/users/${userId}/scopes`,
        scopes,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
};

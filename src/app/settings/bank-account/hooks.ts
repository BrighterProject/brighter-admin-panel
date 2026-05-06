import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiBankAccount, ApiBankAccountUpsert, ApiPaymentCapabilities } from "./types";

const BANK_ACCOUNT_KEY = ["payments", "bank-account"];
const CAPABILITIES_KEY = ["payments", "capabilities"];

export function useMyBankAccount() {
  return useQuery<ApiBankAccount | null>({
    queryKey: BANK_ACCOUNT_KEY,
    queryFn: async () => {
      try {
        const r = await api.get<ApiBankAccount>("/payments/bank-account/");
        return r.data;
      } catch (e: unknown) {
        if ((e as { response?: { status: number } })?.response?.status === 404) return null;
        throw e;
      }
    },
    staleTime: 60_000,
  });
}

export function useUpsertBankAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiBankAccountUpsert) =>
      api.put<ApiBankAccount>("/payments/bank-account/", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANK_ACCOUNT_KEY });
      qc.invalidateQueries({ queryKey: CAPABILITIES_KEY });
    },
  });
}

export function usePaymentCapabilities() {
  return useQuery<ApiPaymentCapabilities>({
    queryKey: CAPABILITIES_KEY,
    queryFn: () => api.get<ApiPaymentCapabilities>("/payments/capabilities").then((r) => r.data),
    staleTime: 60_000,
    retry: false,
  });
}

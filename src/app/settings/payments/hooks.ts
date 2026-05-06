import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiBankAccount, ApiBankAccountUpsert, ApiStripeStatus, StripeStatus } from "./types";

const STRIPE_STATUS_KEY = ["stripe", "status"];

export function useStripeStatus(staleTime?: number) {
  return useQuery<ApiStripeStatus, Error, StripeStatus>({
    queryKey: STRIPE_STATUS_KEY,
    queryFn: () => api.get("/payments-connect/status").then((r) => r.data),
    select: (data) => ({
      connected: data.connected,
      verified: data.verified,
      stripeAccountId: data.stripe_account_id,
      charges_enabled: data.transfers_active,
      requirementsOutstanding: data.requirements_outstanding,
      requirementsEventuallyDue: data.requirements_eventually_due,
    }),
    staleTime: staleTime ?? 60_000,
  });
}

export function useStripeConnect() {
  return useMutation({
    mutationFn: () =>
      api
        .post<{ redirect_url: string }>("/payments-connect/onboard")
        .then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.redirect_url;
    },
  });
}

export function useStripeUpdate() {
  return useMutation({
    mutationFn: () =>
      api
        .get<{ redirect_url: string }>("/payments-connect/update")
        .then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.redirect_url;
    },
  });
}

export function useStripeDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/payments-connect/"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STRIPE_STATUS_KEY });
    },
  });
}

const BANK_ACCOUNT_KEY = ["payments", "bank-account"];

export function useMyBankAccount() {
  return useQuery<ApiBankAccount | null>({
    queryKey: BANK_ACCOUNT_KEY,
    queryFn: async () => {
      try {
        return await api.get<ApiBankAccount>("/payments/bank-account/").then((r) => r.data);
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
      qc.invalidateQueries({ queryKey: ["payments", "capabilities"] });
    },
  });
}

export function usePaymentCapabilities() {
  return useQuery<{ can_accept_card: boolean; can_accept_bank_transfer: boolean }>({
    queryKey: ["payments", "capabilities"],
    queryFn: () =>
      api
        .get<{ can_accept_card: boolean; can_accept_bank_transfer: boolean }>(
          "/payments/capabilities",
        )
        .then((r) => r.data),
    staleTime: 60_000,
    retry: false,
  });
}

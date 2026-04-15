import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiStripeStatus, StripeStatus } from "./types";

const STRIPE_STATUS_KEY = ["stripe", "status"];

export function useStripeStatus() {
  return useQuery<ApiStripeStatus, Error, StripeStatus>({
    queryKey: STRIPE_STATUS_KEY,
    queryFn: () => api.get("/payments/connect/status").then((r) => r.data),
    select: (data) => ({
      connected: data.connected,
      verified: data.verified,
      stripeAccountId: data.stripe_account_id,
      chargesEnabled: data.charges_enabled,
      requirementsOutstanding: data.requirements_outstanding,
    }),
    staleTime: 60_000,
  });
}

export function useStripeConnect() {
  return useMutation({
    mutationFn: () =>
      api
        .post<{ redirect_url: string }>("/payments/connect/onboard")
        .then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.redirect_url;
    },
  });
}

export function useStripeDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/payments/connect"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STRIPE_STATUS_KEY });
    },
  });
}

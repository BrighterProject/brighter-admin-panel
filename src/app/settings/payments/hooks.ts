import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface StripeStatus {
  connected: boolean;
  verified: boolean;
  stripeAccountId: string | null;
}

const STRIPE_STATUS_KEY = ["stripe", "status"];

export function useStripeStatus() {
  return useQuery<StripeStatus>({
    queryKey: STRIPE_STATUS_KEY,
    queryFn: () =>
      api
        .get<{ connected: boolean; verified: boolean; stripe_account_id: string | null }>(
          "/payments/connect/status",
        )
        .then((r) => ({
          connected: r.data.connected,
          verified: r.data.verified,
          stripeAccountId: r.data.stripe_account_id,
        })),
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

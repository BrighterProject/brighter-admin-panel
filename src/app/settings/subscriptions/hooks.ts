import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  max_listings: number;
  price_eur_cents: number;
  stripe_price_id: string | null;
}

export interface OwnerSubscription {
  id: string;
  owner_id: string;
  plan: SubscriptionPlan;
  status: "trialing" | "active" | "past_due" | "cancelled" | "incomplete";
  current_period_end: string | null;
  cancelled_at: string | null;
}

export function useAllSubscriptions() {
  return useQuery<OwnerSubscription[]>({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => api.get("/subscriptions/").then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscriptions", "plans"],
    queryFn: () => api.get("/subscriptions/plans").then((r) => r.data),
    staleTime: 60_000,
  });
}

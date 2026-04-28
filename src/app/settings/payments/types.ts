import type { Camelized } from "@/lib/utils";

export type ApiStripeStatus = {
  connected: boolean;
  verified: boolean;
  transfers_active: boolean;
  stripe_account_id?: string;
  requirements_outstanding: boolean;
  requirements_eventually_due: boolean;
};

export type StripeStatus = Camelized<ApiStripeStatus>;

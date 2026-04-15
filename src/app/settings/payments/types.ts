import type { Camelized } from "@/lib/utils";

export type ApiStripeStatus = {
  connected: boolean;
  verified: boolean;
  charges_enabled: boolean;
  stripe_account_id?: string;
  requirements_outstanding: boolean;
};

export type StripeStatus = Camelized<ApiStripeStatus>;

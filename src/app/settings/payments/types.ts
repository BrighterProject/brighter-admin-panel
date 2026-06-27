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

export interface ApiBankAccount {
  id: string;
  owner_id: string;
  iban: string;
  bic: string | null;
  bank_name: string | null;
  account_holder: string;
  updated_at: string;
}

export interface ApiBankAccountUpsert {
  iban: string;
  bic?: string | null;
  bank_name?: string | null;
  account_holder: string;
}

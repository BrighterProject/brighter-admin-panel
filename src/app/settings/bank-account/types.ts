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

export interface ApiPaymentCapabilities {
  can_accept_card: boolean;
  can_accept_bank_transfer: boolean;
}

export type BankTransferStatus = "pending" | "confirmed" | "cancelled";

export interface BankTransfer {
  id: string;
  booking_id: string;
  user_id: string;
  property_owner_id: string;
  status: BankTransferStatus;
  amount: string;
  currency: string;
  bank_iban: string;
  bank_bic: string;
  bank_name: string;
  account_holder: string;
  reference: string;
  updated_at: string;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BankTransfer, BankTransferStatus } from "./types";

const KEY = ["payments", "bank-transfers"];

export function useBankTransfers(status?: BankTransferStatus) {
  return useQuery<BankTransfer[]>({
    queryKey: [...KEY, status ?? "all"],
    queryFn: () =>
      api
        .get<BankTransfer[]>("/payments/bank-transfer", {
          params: status ? { status } : undefined,
        })
        .then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useConfirmBankTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .post<BankTransfer>(`/payments/bank-transfer/${id}/confirm`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCancelBankTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .post<BankTransfer>(`/payments/bank-transfer/${id}/cancel`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

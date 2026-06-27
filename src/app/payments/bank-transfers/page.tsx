"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBankTransfers,
  useCancelBankTransfer,
  useConfirmBankTransfer,
} from "./hooks";
import type { BankTransfer, BankTransferStatus } from "./types";

function StatusBadge({ status }: { status: BankTransferStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
        >
          <Clock className="size-3" />
          Изчакващ
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
        >
          <CheckCircle2 className="size-3" />
          Потвърден
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
        >
          <XCircle className="size-3" />
          Отменен
        </Badge>
      );
  }
}

interface ActionState {
  type: "confirm" | "cancel";
  transfer: BankTransfer;
}

function TransferRow({
  transfer,
  onAction,
}: {
  transfer: BankTransfer;
  onAction: (a: ActionState) => void;
}) {
  const isPending = transfer.status === "pending";
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">
            {transfer.reference}
          </span>
          <StatusBadge status={transfer.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          Резервация{" "}
          <span className="font-mono">{transfer.booking_id.slice(0, 8)}…</span>
          {" · "}
          {Number(transfer.amount).toFixed(2)} {transfer.currency}
          {" · "}
          {transfer.account_holder}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {transfer.bank_iban}
        </p>
        <p className="text-xs text-muted-foreground">
          Обновен {new Date(transfer.updated_at).toLocaleString("bg-BG")}
        </p>
      </div>

      {isPending && (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => onAction({ type: "confirm", transfer })}
          >
            <CheckCircle2 className="size-3.5" />
            Потвърди
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10"
            onClick={() => onAction({ type: "cancel", transfer })}
          >
            <XCircle className="size-3.5" />
            Откажи
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BankTransfersPage() {
  const [statusFilter, setStatusFilter] = useState<BankTransferStatus | "all">(
    "pending",
  );
  const [actionState, setActionState] = useState<ActionState | null>(null);

  const { data: transfers = [], isLoading } = useBankTransfers(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const confirm = useConfirmBankTransfer();
  const cancel = useCancelBankTransfer();

  const isPending = confirm.isPending || cancel.isPending;

  async function handleAction() {
    if (!actionState) return;
    if (actionState.type === "confirm") {
      await confirm.mutateAsync(actionState.transfer.id);
    } else {
      await cancel.mutateAsync(actionState.transfer.id);
    }
    setActionState(null);
  }

  return (
    <BaseLayout
      title="Банкови преводи"
      description="Потвърдете получените банкови преводи за резервации."
    >
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Статус:</span>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as BankTransferStatus | "all")
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Изчакващ</SelectItem>
              <SelectItem value="confirmed">Потвърден</SelectItem>
              <SelectItem value="cancelled">Отменен</SelectItem>
              <SelectItem value="all">Всички</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Плащания с банков превод</CardTitle>
            <CardDescription>
              Потвърдете преводите, след като проверите дали гостът е изпратил парите.
              Потвърждаването на превода потвърждава и резервацията.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : transfers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Няма намерени банкови преводи.
              </p>
            ) : (
              transfers.map((t) => (
                <TransferRow
                  key={t.id}
                  transfer={t}
                  onAction={setActionState}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={actionState !== null}
        onOpenChange={(open) => !open && setActionState(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionState?.type === "confirm" ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Потвърди банков превод
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-amber-500" />
                  Откажи банков превод
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionState?.type === "confirm"
                ? `Потвърждавате ли, че сте получили превода ${actionState.transfer.reference} (${Number(actionState.transfer.amount).toFixed(2)} ${actionState.transfer.currency})? Това ще потвърди и резервацията.`
                : `Отменете превода ${actionState?.transfer.reference}? Това ще отмени и свързаната резервация.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setActionState(null)}
              disabled={isPending}
            >
              Назад
            </Button>
            <Button
              className="cursor-pointer"
              variant={
                actionState?.type === "cancel" ? "destructive" : "default"
              }
              disabled={isPending}
              onClick={handleAction}
            >
              {isPending
                ? "Моля, изчакайте…"
                : actionState?.type === "confirm"
                  ? "Да, потвърди"
                  : "Да, откажи"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BaseLayout>
  );
}

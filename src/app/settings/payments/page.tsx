"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  Pencil,
} from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  useMyBankAccount,
  useStripeConnect,
  useStripeDisconnect,
  useStripeStatus,
  useStripeUpdate,
  useUpsertBankAccount,
} from "./hooks";

function BankAccountCard() {
  const { data: account, isLoading } = useMyBankAccount();
  const upsert = useUpsertBankAccount();
  const [editing, setEditing] = useState(false);
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !account && !editing) setEditing(true);
  }, [isLoading, account, editing]);

  function openEdit() {
    setIban(account?.iban ?? "");
    setBic(account?.bic ?? "");
    setBankName(account?.bank_name ?? "");
    setAccountHolder(account?.account_holder ?? "");
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ibanClean = iban.trim().replace(/\s/g, "");
    if (!ibanClean || !accountHolder.trim()) {
      setError("IBAN and account holder name are required.");
      return;
    }
    try {
      await upsert.mutateAsync({
        iban: ibanClean,
        bic: bic.trim() || null,
        bank_name: bankName.trim() || null,
        account_holder: accountHolder.trim(),
      });
      setSaved(true);
      setEditing(false);
    } catch {
      setError("Failed to save. Please check the details and try again.");
    }
  }

  if (isLoading)
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Landmark className="size-5" />
            Банков превод
          </CardTitle>
          {account && !editing && (
            <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer" onClick={openEdit}>
              <Pencil className="size-4" />
              Редактирай
            </Button>
          )}
        </div>
        <CardDescription>
          {account
            ? "Гостите, избрали банков превод, изпращат парите директно на тази сметка."
            : "Добави банкова сметка, за да можеш да приемаш плащания чрез банков превод."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!editing && account ? (
          <div className="space-y-3 text-sm">
            <div className="grid gap-1">
              <p className="text-muted-foreground">Титуляр</p>
              <p className="font-medium">{account.account_holder}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-muted-foreground">IBAN</p>
              <p className="font-mono">{account.iban}</p>
            </div>
            {account.bic && (
              <div className="grid gap-1">
                <p className="text-muted-foreground">BIC / SWIFT</p>
                <p className="font-mono">{account.bic}</p>
              </div>
            )}
            {account.bank_name && (
              <div className="grid gap-1">
                <p className="text-muted-foreground">Банка</p>
                <p>{account.bank_name}</p>
              </div>
            )}
            {saved && (
              <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle2 className="size-3.5" />
                Записано успешно.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="BG80BNBG96611020345678"
                  maxLength={34}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bic">BIC / SWIFT</Label>
                <Input
                  id="bic"
                  value={bic}
                  onChange={(e) => setBic(e.target.value)}
                  placeholder="BNBGBGSD"
                  maxLength={11}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="account-holder">Титуляр *</Label>
                <Input
                  id="account-holder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Иван Петров"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-name">Банка</Label>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="DSK Bank"
                  maxLength={100}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={upsert.isPending} className="cursor-pointer">
                {upsert.isPending ? "Записване…" : "Запази"}
              </Button>
              {account && (
                <Button type="button" variant="ghost" className="cursor-pointer" onClick={() => setEditing(false)}>
                  Отказ
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Свържи",
      desc: "Свържи Stripe акаунта си — нужни са само 5 минути.",
    },
    {
      n: 2,
      title: "Гостът плаща",
      desc: "Гостите плащат чрез Brighter при потвърждаване на резервацията.",
    },
    {
      n: 3,
      title: "Stripe ти изплаща",
      desc: "Получаваш директни изплащания на банковата си сметка.",
    },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Как работи</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {step.n}
            </span>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PaymentsSettings() {
  const { data: status, isLoading } = useStripeStatus();
  const { mutate: connect, isPending: connecting } = useStripeConnect();
  const { mutate: disconnect, isPending: disconnecting } =
    useStripeDisconnect();
  const { mutate: update, isPending: updating } = useStripeUpdate();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  return (
    <BaseLayout
      title="Плащания"
      description="Управление на Stripe Connect и изплащания"
    >
      <div className="space-y-6 px-4 lg:px-6 max-w-2xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-4 py-6">
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  data-testid="skeleton"
                  className="h-4 w-full"
                />
              ))}
            </CardContent>
          </Card>
        ) : !status?.connected ? (
          /* ── Not connected ──────────────────────────────────── */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Приемай плащания
              </CardTitle>
              <CardDescription>
                Свържи Stripe акаунт, за да получаваш директни изплащания от
                резервации.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => connect()}
                disabled={connecting}
                className="cursor-pointer"
                aria-label="Connect with Stripe"
              >
                <CreditCard className="size-4 mr-2" />
                {connecting ? "Пренасочване…" : "Свържи с Stripe"}
              </Button>
              <Separator />
              <HowItWorks />
            </CardContent>
          </Card>
        ) : status.requirementsOutstanding ? (
          /* ── Action required — payouts blocked ──────────────── */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  Необходими са действия
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                >
                  Спрено
                </Badge>
              </div>
              <CardDescription>
                Изплащанията са спрени. Попълни липсващата информация в Stripe,
                за да ги възстановиш.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-300">
                <AlertTriangle className="inline size-4 mr-1.5 shrink-0" />
                Stripe е открил изискванияс краен срок. Изплащанията ще останат
                спрени до тяхното изпълнение.
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Stripe ID на акаунта</p>
                <p className="font-mono">{status.stripeAccountId}</p>
              </div>
              <Button
                onClick={() => connect()}
                disabled={connecting}
                className="cursor-pointer"
              >
                <ExternalLink className="size-4 mr-2" />
                {updating ? "Пренасочване…" : "Попълни в Stripe"}
              </Button>
            </CardContent>
          </Card>
        ) : !status.verified ? (
          /* ── Connected, pending verification ───────────────── */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-amber-500" />
                  Верификацията е в процес
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                >
                  Изчакване
                </Badge>
              </div>
              <CardDescription>
                Stripe акаунтът ти е свързан, но изплащанията са на изчакване до
                завършване на верификацията.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="inline size-4 mr-1.5 shrink-0" />
                Изплащанията са спрени до верификация на акаунта.
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Stripe ID на акаунта</p>
                <p className="font-mono">{status.stripeAccountId}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => connect()}
                disabled={updating}
              >
                Завърши верификацията в Stripe
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ── Connected and active ───────────────────────────── */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Stripe е свързан
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800"
                >
                  Активен
                </Badge>
              </div>
              <CardDescription>
                Приемаш плащания. Изплащанията се извършват автоматично от
                Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Stripe ID на акаунта</p>
                <p className="font-mono">{status.stripeAccountId}</p>
              </div>

              {/* Eventually-due soft nudge */}
              {status.requirementsEventuallyDue && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    Stripe може да изисква допълнителна информация в бъдеще.{" "}
                    <button
                      onClick={() => update()}
                      disabled={updating}
                      className="underline font-medium disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? "Пренасочване…" : "Попълни предварително"}
                    </button>
                    .
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild className="cursor-pointer">
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Manage on Stripe"
                  >
                    <ExternalLink className="size-4 mr-2" />
                    Управление в Stripe
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => connect()}
                  disabled={connecting}
                  aria-label="Update account info"
                >
                  <ExternalLink className="size-4 mr-2" />
                  {updating ? "Пренасочване…" : "Актуализирай данните"}
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                  onClick={() => setConfirmingDisconnect(true)}
                  aria-label="Disconnect"
                >
                  Прекъсни връзката
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <BankAccountCard />
        {/* Disconnect confirmation */}
        <Dialog
          open={confirmingDisconnect}
          onOpenChange={setConfirmingDisconnect}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                Прекъсване на Stripe
              </DialogTitle>
              <DialogDescription>
                Прекъсването на Stripe спира всички бъдещи изплащания. Тази
                операция е обратима — можеш да свържеш отново по-късно.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setConfirmingDisconnect(false)}
              >
                Отказ
              </Button>
              <Button
                variant="destructive"
                className="cursor-pointer"
                disabled={disconnecting}
                onClick={() =>
                  disconnect(undefined, {
                    onSuccess: () => setConfirmingDisconnect(false),
                  })
                }
                aria-label="Да, прекъсни"
              >
                Да, прекъсни
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BaseLayout>
  );
}

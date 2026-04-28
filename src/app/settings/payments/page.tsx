"use client";

import { useState } from "react";
import {
  ExternalLink,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
  useStripeStatus,
  useStripeConnect,
  useStripeDisconnect,
  useStripeUpdate,
} from "./hooks";

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

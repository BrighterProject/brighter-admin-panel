import { useEffect } from "react";
import { type UseFormReturn } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaymentCapabilities } from "@/app/settings/payments/hooks";
import type { PropertyFormSchema } from "../../property-form.schema";

type PaymentMethod = "card" | "bank_transfer" | "cash";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Карта (дебитна/кредитна)",
  bank_transfer: "Банков превод",
  cash: "В брой (при пристигане)",
};

const ALL_METHODS: PaymentMethod[] = ["card", "bank_transfer", "cash"];

interface Blocker {
  message: string;
  linkTo: string;
  linkLabel: string;
}

function methodBlocker(
  method: PaymentMethod,
  caps: { can_accept_card: boolean; can_accept_bank_transfer: boolean } | undefined,
): Blocker | null {
  if (!caps) return null;
  if (method === "card" && !caps.can_accept_card)
    return {
      message: "Stripe Connect не е активен.",
      linkTo: "/settings/payments",
      linkLabel: "Настрой Stripe →",
    };
  if (method === "bank_transfer" && !caps.can_accept_bank_transfer)
    return {
      message: "Няма конфигурирана банкова сметка.",
      linkTo: "/settings/payments",
      linkLabel: "Добави банкова сметка →",
    };
  return null;
}

interface PaymentConfigSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function PaymentConfigSection({ form }: PaymentConfigSectionProps) {
  const { data: caps } = usePaymentCapabilities();

  // A deposit can only be collected if the owner can take an online prepayment —
  // i.e. Stripe (card) or a configured bank account. With only cash (or nothing)
  // configured, there is no way for a guest to prepay or leave a digital deposit,
  // so deposit configuration is meaningless and is locked to 100% (pay on arrival).
  const canCollectDeposit = !!(
    caps?.can_accept_card || caps?.can_accept_bank_transfer
  );

  useEffect(() => {
    if (caps && !canCollectDeposit) {
      if (form.getValues("payment_config.deposit_pct") !== 100)
        form.setValue("payment_config.deposit_pct", 100, {
          shouldValidate: true,
        });
      if (form.getValues("payment_config.remaining_method") != null)
        form.setValue("payment_config.remaining_method", null, {
          shouldValidate: true,
        });
    }
  }, [caps, canCollectDeposit, form]);

  return (
    <section id="section-payment-config" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Платежна конфигурация</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Приети методи на плащане и изисквания за депозит за този имот.
        </p>
      </div>

      <FormField
        control={form.control}
        name="payment_config.accepted_methods"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Приети методи на плащане</FormLabel>
            <div className="space-y-2 mt-1">
              {ALL_METHODS.map((method) => {
                const blocker = methodBlocker(method, caps);
                const checked = field.value?.includes(method) ?? false;
                return (
                  <div key={method} className="flex flex-col gap-0.5">
                    <label
                      className={`flex items-center gap-2 text-sm ${blocker ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!!blocker}
                        onChange={(e) => {
                          if (blocker) return;
                          const next = e.target.checked
                            ? [...(field.value ?? []), method]
                            : (field.value ?? []).filter((m: string) => m !== method);
                          field.onChange(next);
                        }}
                        className="rounded"
                      />
                      {PAYMENT_METHOD_LABELS[method]}
                    </label>
                    {blocker && (
                      <p className="ml-6 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3 shrink-0" />
                        {blocker.message}{" "}
                        <Link
                          to={blocker.linkTo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          {blocker.linkLabel}
                        </Link>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {!canCollectDeposit && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              Конфигурирането на депозит е недостъпно.
            </p>
            <p>
              За да изисквате депозит, гостът трябва да може да плати онлайн.
              Нямате нито активен Stripe (карта), нито банкова сметка, затова няма
              начин за онлайн предплащане или дигитален депозит. Плащането е
              заключено на 100% при пристигане.{" "}
              <Link
                to="/settings/payments"
                className="font-medium underline hover:text-amber-800 dark:hover:text-amber-300"
              >
                Настрой методи за плащане →
              </Link>
            </p>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="payment_config.deposit_pct"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Изискуем депозит (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={20}
                max={100}
                {...field}
                disabled={!canCollectDeposit}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="max-w-40"
              />
            </FormControl>
            <FormDescription>
              20–100. Използвайте 100 за пълно плащане при резервация.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="payment_config.remaining_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Метод за остатъка</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              value={field.value ?? "none"}
              disabled={!canCollectDeposit}
            >
              <FormControl>
                <SelectTrigger className="max-w-64">
                  <SelectValue placeholder="Неприложимо (пълно плащане предварително)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Неприложимо (пълно плащане предварително)</SelectItem>
                <SelectItem value="cash">В брой (при пристигане)</SelectItem>
                <SelectItem value="bank_transfer">Банков превод</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Прилага се само когато депозитът е под 100%.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}

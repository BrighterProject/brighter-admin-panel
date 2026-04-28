import { useState } from "react";
import {
  X,
  AlertCircle,
  Sparkles,
  CreditCard,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isAdmin, isPropertyOwner } from "@/lib/scopes";

interface OwnerStatusBannerProps {
  scopes: string[];
  stripeConnected: boolean;
  stripeVerified?: boolean;
  stripeRequirementsOutstanding?: boolean;
  stripeRequirementsEventuallyDue?: boolean;
}

type BannerState =
  | "pending"
  | "newly_escalated"
  | "no_stripe"
  | "stripe_action_required"
  | "stripe_pending_verification"
  | "stripe_eventually_due"
  | null;

function deriveBannerState(
  scopes: string[],
  stripeConnected: boolean,
  stripeVerified: boolean,
  stripeRequirementsOutstanding: boolean,
  stripeRequirementsEventuallyDue: boolean,
): BannerState {
  if (isAdmin(scopes)) return null;
  if (!isPropertyOwner(scopes)) return "pending";
  if (!localStorage.getItem("owner_welcomed")) return "newly_escalated";
  if (!stripeConnected) return "no_stripe";
  if (stripeRequirementsOutstanding) return "stripe_action_required";
  if (!stripeVerified) return "stripe_pending_verification";
  if (stripeRequirementsEventuallyDue) return "stripe_eventually_due";
  return null;
}

const SETTINGS_PAYMENTS_LINK = (
  <Link to="/settings/payments" className="underline font-medium">
    Настройки → Плащания
  </Link>
);

export function OwnerStatusBanner({
  scopes,
  stripeConnected,
  stripeVerified = false,
  stripeRequirementsOutstanding = false,
  stripeRequirementsEventuallyDue = false,
}: OwnerStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const state = dismissed
    ? null
    : deriveBannerState(
        scopes,
        stripeConnected,
        stripeVerified,
        stripeRequirementsOutstanding,
        stripeRequirementsEventuallyDue,
      );

  if (!state) return null;

  const handleDismiss = () => {
    if (state === "newly_escalated") {
      localStorage.setItem("owner_welcomed", "1");
    }
    setDismissed(true);
  };

  const configs = {
    pending: {
      icon: <AlertCircle className="size-4 shrink-0 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      text: "Вашият акаунт се преглежда. Администратор ще ви предостави достъп на собственик скоро.",
      cta: null,
      dismissable: false,
    },
    newly_escalated: {
      icon: <Sparkles className="size-4 shrink-0 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
      text: "Добре дошли! Вашият акаунт е активиран като собственик на имот. Започнете, като добавите вашия първи имот.",
      cta: (
        <Link to="/properties/new">
          <Button size="sm" className="cursor-pointer">
            Добави имот
          </Button>
        </Link>
      ),
      dismissable: true,
    },
    no_stripe: {
      icon: <CreditCard className="size-4 shrink-0 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      text: "За да получавате плащания, свържете вашия Stripe акаунт в",
      cta: SETTINGS_PAYMENTS_LINK,
      dismissable: false,
    },
    stripe_action_required: {
      icon: <AlertTriangle className="size-4 shrink-0 text-red-600" />,
      bg: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
      text: "Изплащанията са спрени — необходими са действия по вашия Stripe акаунт в",
      cta: SETTINGS_PAYMENTS_LINK,
      dismissable: false,
    },
    stripe_pending_verification: {
      icon: <Clock className="size-4 shrink-0 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      text: "Stripe акаунтът ви е свързан, но верификацията е в процес. Изплащанията ще се активират след одобрение.",
      cta: null,
      dismissable: false,
    },
    stripe_eventually_due: {
      icon: <AlertCircle className="size-4 shrink-0 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
      text: "Stripe може да изисква допълнителна информация в бъдеще. Попълнете я предварително в",
      cta: SETTINGS_PAYMENTS_LINK,
      dismissable: true,
    },
  } satisfies Record<
    NonNullable<BannerState>,
    {
      icon: React.ReactNode;
      bg: string;
      text: string;
      cta: React.ReactNode;
      dismissable: boolean;
    }
  >;

  const cfg = configs[state];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${cfg.bg}`}
    >
      {cfg.icon}
      <p className="flex-1 text-sm">
        {cfg.text} {cfg.cta}
      </p>
      {cfg.dismissable && (
        <button
          onClick={handleDismiss}
          aria-label="Затвори"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

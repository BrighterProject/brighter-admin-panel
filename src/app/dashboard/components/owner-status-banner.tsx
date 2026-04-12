import { useState } from 'react';
import { X, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAdmin, isPropertyOwner } from '@/lib/scopes';

interface OwnerStatusBannerProps {
  scopes: string[];
  stripeConnected: boolean;
}

type BannerState = 'pending' | 'newly_escalated' | 'no_stripe' | null;

function deriveBannerState(scopes: string[], stripeConnected: boolean): BannerState {
  if (isAdmin(scopes)) return null;
  if (!isPropertyOwner(scopes)) return 'pending';
  if (!localStorage.getItem('owner_welcomed')) return 'newly_escalated';
  if (!stripeConnected) return 'no_stripe';
  return null;
}

export function OwnerStatusBanner({ scopes, stripeConnected }: OwnerStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const state = dismissed ? null : deriveBannerState(scopes, stripeConnected);

  if (!state) return null;

  const handleDismiss = () => {
    if (state === 'newly_escalated') {
      localStorage.setItem('owner_welcomed', '1');
    }
    setDismissed(true);
  };

  const configs = {
    pending: {
      icon: <AlertCircle className="size-4 shrink-0 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
      text: 'Вашият акаунт се преглежда. Администратор ще ви предостави достъп на собственик скоро.',
      cta: null,
      dismissable: false,
    },
    newly_escalated: {
      icon: <Sparkles className="size-4 shrink-0 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800',
      text: 'Добре дошли! Вашият акаунт е активиран като собственик на имот. Започнете, като добавите вашия първи имот.',
      cta: (
        <Link to="/properties/new">
          <Button size="sm" className="cursor-pointer">Добави имот</Button>
        </Link>
      ),
      dismissable: true,
    },
    no_stripe: {
      icon: <CreditCard className="size-4 shrink-0 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
      text: 'За да получавате плащания, свържете вашия Stripe акаунт в',
      cta: (
        <Link to="/settings/payments" className="underline font-medium text-blue-700 dark:text-blue-400">
          Настройки → Плащания
        </Link>
      ),
      dismissable: false,
    },
  } satisfies Record<NonNullable<BannerState>, {
    icon: React.ReactNode;
    bg: string;
    text: string;
    cta: React.ReactNode;
    dismissable: boolean;
  }>;

  const cfg = configs[state];

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${cfg.bg}`}>
      {cfg.icon}
      <p className="flex-1 text-sm">{cfg.text} {cfg.cta}</p>
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

import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Booking } from '@/app/bookings/types';

interface OwnerEarningsProps {
  bookings: Booking[];
  stripeConnected: boolean;
  loading: boolean;
}

function sumEarnings(bookings: Booking[], fromDate: Date): number {
  return bookings
    .filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'completed') &&
        new Date(b.updated_at) >= fromDate,
    )
    .reduce((acc, b) => acc + parseFloat(b.total_price), 0);
}

export function OwnerEarnings({ bookings, stripeConnected, loading }: OwnerEarningsProps) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const stats = [
    { label: 'Тази седмица', value: sumEarnings(bookings, weekAgo) },
    { label: 'Този месец', value: sumEarnings(bookings, monthAgo) },
    { label: 'За всичко', value: sumEarnings(bookings, new Date(0)) },
  ];

  if (!stripeConnected) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} to="/settings/payments" className="block">
            <Card className="border cursor-pointer hover:border-primary transition-colors opacity-60 hover:opacity-80">
              <CardContent className="space-y-2 py-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="size-4 shrink-0" />
                  <span>Свържи Stripe</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border">
          <CardContent className="space-y-1 py-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">
              {loading ? '…' : `${stat.value.toFixed(2)} EUR`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

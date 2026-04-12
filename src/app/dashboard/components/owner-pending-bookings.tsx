import { Check, X, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateBookingStatus } from '@/app/bookings/hooks';
import type { Booking } from '@/app/bookings/types';

interface OwnerPendingBookingsProps {
  bookings: Booking[];
  loading: boolean;
}

function fmt(dt: string) {
  return new Date(dt).toLocaleDateString('bg-BG', {
    month: 'short',
    day: 'numeric',
  });
}

function nightCount(start: string, end: string) {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
  );
}

export function OwnerPendingBookings({ bookings, loading }: OwnerPendingBookingsProps) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} data-testid="skeleton" className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Няма чакащи резервации — всичко е наред.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="border">
          <CardContent className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold truncate">
                {booking.property_name ?? booking.property_id.slice(0, 8) + '…'}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {booking.guest_name ?? booking.customer_full_name ?? booking.customer_username ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {fmt(booking.start_date)} – {fmt(booking.end_date)}
                  {' '}({nightCount(booking.start_date, booking.end_date)} нощи)
                </span>
              </div>
              <p className="text-sm font-medium">
                {booking.total_price} {booking.currency}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                disabled={isPending}
                className="cursor-pointer"
                aria-label="Потвърди"
                onClick={() =>
                  updateStatus({ id: booking.id, status: 'confirmed' }, {})
                }
              >
                <Check className="size-4 mr-1" />
                Потвърди
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                aria-label="Откажи"
                onClick={() =>
                  updateStatus({ id: booking.id, status: 'cancelled' }, {})
                }
              >
                <X className="size-4 mr-1" />
                Откажи
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

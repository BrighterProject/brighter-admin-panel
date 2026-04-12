import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { Booking } from '@/app/bookings/types';
import type { PropertyListItem } from '@/app/properties/types';

interface OwnerOccupancyProps {
  properties: PropertyListItem[];
  bookings: Booking[];
  loading: boolean;
}

export function computeOccupancy(bookings: Booking[], propertyId: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const confirmed = bookings.filter(
    (b) => b.property_id === propertyId && b.status === 'confirmed',
  );
  let occupied = 0;
  for (let i = 0; i < 30; i++) {
    const day = new Date(today.getTime() + i * 86400000);
    const isOccupied = confirmed.some((b) => {
      const bStart = new Date(b.start_date);
      bStart.setHours(0, 0, 0, 0);
      const bEnd = new Date(b.end_date);
      bEnd.setHours(0, 0, 0, 0);
      return bStart <= day && day < bEnd;
    });
    if (isOccupied) occupied++;
  }
  return Math.round((occupied / 30) * 100);
}

export function OwnerOccupancy({ properties, bookings, loading }: OwnerOccupancyProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">Нямате добавени имоти.</p>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const pct = computeOccupancy(bookings, property.id);
        return (
          <div key={property.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate">{property.name}</span>
              <span className="text-muted-foreground shrink-0 ml-2">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}

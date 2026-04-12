"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { StatCards } from "./components/stat-cards";
import { BookingsTrendChart } from "./components/bookings-trend-chart";
import { RecentBookingsTable } from "./components/recent-bookings-table";
import { OwnerPendingBookings } from "./components/owner-pending-bookings";
import { OwnerOccupancy } from "./components/owner-occupancy";
import { OwnerEarnings } from "./components/owner-earnings";
import { useMe } from "@/app/auth/api/hooks";
import { useProperties } from "@/app/properties/hooks";
import { useBookings } from "@/app/bookings/hooks";
import { useUsers } from "@/app/auth/api/hooks";
import { isAdmin, isPropertyOwner } from "@/lib/scopes";

export default function Page() {
  const { data: me } = useMe();
  const admin = me ? isAdmin(me.scopes) : false;
  const owner = me ? isPropertyOwner(me.scopes) : false;

  const propertyParams =
    owner && me ? { owner_id: String(me.id) } : undefined;
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties(propertyParams);
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: users = [], isLoading: usersLoading } = useUsers(admin);

  const loading = propertiesLoading || bookingsLoading;

  // Owner sees only their own bookings from the shared bookings query
  const ownerBookings = owner && me
    ? bookings.filter((b) => b.property_owner_id === String(me.id))
    : bookings;

  const pendingBookings = ownerBookings.filter((b) => b.status === 'pending');

  if (owner) {
    return (
      <BaseLayout title="Табло" description="Преглед на вашия бизнес">
        <div className="space-y-6 px-4 lg:px-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Чакащи резервации
            </h2>
            <OwnerPendingBookings
              bookings={pendingBookings}
              loading={bookingsLoading}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Заетост (следващи 30 дни)
            </h2>
            <OwnerOccupancy
              properties={properties}
              bookings={ownerBookings}
              loading={loading}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Приходи
            </h2>
            <OwnerEarnings
              bookings={ownerBookings}
              stripeConnected={false}
              loading={bookingsLoading}
            />
          </section>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Табло"
      description="Преглед на платформата"
    >
      <div className="space-y-6 px-4 lg:px-6">
        <StatCards
          properties={properties}
          bookings={bookings}
          userCount={users.length}
          loading={loading}
          usersLoading={usersLoading}
          isAdmin={admin}
        />
        <BookingsTrendChart bookings={bookings} loading={bookingsLoading} />
        <RecentBookingsTable
          bookings={bookings}
          loading={bookingsLoading}
          isAdmin={admin}
        />
      </div>
    </BaseLayout>
  );
}

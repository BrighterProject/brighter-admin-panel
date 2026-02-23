import { useBookings } from "./hooks";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";

export default function BookingsPage() {
  const { data: bookings = [], isLoading } = useBookings();

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and review bookings for your venues.
        </p>
      </div>
      <StatCards bookings={bookings} loading={isLoading} />
      <DataTable bookings={bookings} loading={isLoading} />
    </div>
  );
}

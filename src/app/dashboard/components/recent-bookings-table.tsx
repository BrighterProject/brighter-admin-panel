"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Booking, BookingStatus } from "@/app/bookings/types";

interface Props {
  bookings: Booking[];
  loading: boolean;
  isAdmin: boolean;
}

const statusLabels: Record<BookingStatus, string> = {
  pending: "Чакаща",
  confirmed: "Потвърдена",
  completed: "Завършена",
  cancelled: "Отказана",
  no_show: "Неявяване",
};

const statusColors: Record<BookingStatus, string> = {
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400",
  confirmed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
  completed:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400",
  no_show:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("bg-BG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentBookingsTable({ bookings, loading, isAdmin }: Props) {
  const sorted = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.start_datetime).getTime() -
        new Date(a.start_datetime).getTime(),
    )
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Скорошни резервации</CardTitle>
        <CardDescription>
          Последните 10 резервации{isAdmin ? " в платформата" : " за вашите обекти"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground animate-pulse">
              Зареждане…
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            Няма намерени резервации.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Обект</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Начало</TableHead>
                  <TableHead>Край</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {b.property_name || b.property_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {b.customer_full_name ||
                        b.customer_username ||
                        b.user_id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(b.start_datetime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(b.end_datetime)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {parseFloat(b.total_price).toFixed(2)} {b.currency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[b.status]}
                      >
                        {statusLabels[b.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

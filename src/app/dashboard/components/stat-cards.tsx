import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PropertyListItem } from "@/app/properties/types";
import type { Booking } from "@/app/bookings/types";

interface StatCardsProps {
  properties: PropertyListItem[];
  bookings: Booking[];
  userCount: number;
  loading: boolean;
  usersLoading: boolean;
  isAdmin: boolean;
}

const badgeColors = {
  green:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400",
  yellow:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400",
  blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
  orange:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400",
} as const;

export function StatCards({
  properties,
  bookings,
  userCount,
  loading,
  usersLoading,
  isAdmin,
}: StatCardsProps) {
  const activeProperties = properties.filter((v) => v.status === "active").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const reproperty = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + parseFloat(b.total_price || "0"), 0);

  const metrics = isAdmin
    ? [
        {
          title: "Потребители",
          value: usersLoading ? "…" : userCount,
          icon: Users,
          badge: null,
          color: null,
        },
        {
          title: "Обекти",
          value: loading ? "…" : `${activeProperties} / ${properties.length}`,
          icon: Building2,
          badge: properties.length > 0
            ? `${Math.round((activeProperties / properties.length) * 100)}% активни`
            : null,
          color: "green" as const,
        },
        {
          title: "Резервации",
          value: loading ? "…" : bookings.length,
          icon: CalendarCheck,
          badge: null,
          color: null,
        },
        {
          title: "Чакащи потвърждение",
          value: loading ? "…" : pendingBookings,
          icon: Clock,
          badge: bookings.length > 0
            ? `${Math.round((pendingBookings / bookings.length) * 100)}%`
            : null,
          color: "yellow" as const,
        },
        {
          title: "Потвърдени",
          value: loading ? "…" : confirmedBookings,
          icon: CheckCircle2,
          badge: bookings.length > 0
            ? `${Math.round((confirmedBookings / bookings.length) * 100)}%`
            : null,
          color: "blue" as const,
        },
        {
          title: "Приходи",
          value: loading ? "…" : `${reproperty.toFixed(2)} EUR`,
          icon: DollarSign,
          badge: completedBookings > 0
            ? `${completedBookings} завършени`
            : null,
          color: "green" as const,
        },
      ]
    : [
        {
          title: "Моите обекти",
          value: loading ? "…" : `${activeProperties} / ${properties.length}`,
          icon: Building2,
          badge: properties.length > 0
            ? `${Math.round((activeProperties / properties.length) * 100)}% активни`
            : null,
          color: "green" as const,
        },
        {
          title: "Общо резервации",
          value: loading ? "…" : bookings.length,
          icon: CalendarCheck,
          badge: null,
          color: null,
        },
        {
          title: "Нужни действия",
          value: loading ? "…" : pendingBookings,
          icon: Clock,
          badge: pendingBookings > 0 ? "изисква внимание" : null,
          color: "orange" as const,
        },
        {
          title: "Потвърдени",
          value: loading ? "…" : confirmedBookings,
          icon: CheckCircle2,
          badge: bookings.length > 0
            ? `${Math.round((confirmedBookings / bookings.length) * 100)}%`
            : null,
          color: "blue" as const,
        },
        {
          title: "Завършени",
          value: loading ? "…" : completedBookings,
          icon: CheckCircle2,
          badge: bookings.length > 0
            ? `${Math.round((completedBookings / bookings.length) * 100)}%`
            : null,
          color: "green" as const,
        },
        {
          title: "Приходи",
          value: loading ? "…" : `${reproperty.toFixed(2)} лв.`,
          icon: DollarSign,
          badge: completedBookings > 0
            ? `${completedBookings} завършени`
            : null,
          color: "green" as const,
        },
      ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <metric.icon className="text-muted-foreground size-6" />
              {metric.badge && metric.color && (
                <Badge variant="outline" className={badgeColors[metric.color]}>
                  {metric.badge}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                {metric.title}
              </p>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  UserX,
} from "lucide-react";
import type { Booking } from "../types";

interface StatCardsProps {
  bookings: Booking[];
  loading: boolean;
}

export function StatCards({ bookings, loading }: StatCardsProps) {
  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const noShow = bookings.filter((b) => b.status === "no_show").length;

  const metrics = [
    {
      title: "Total Bookings",
      value: loading ? "…" : total,
      icon: CalendarCheck,
      badge: null,
    },
    {
      title: "Pending",
      value: loading ? "…" : pending,
      icon: Clock,
      badge: total > 0 ? `${Math.round((pending / total) * 100)}%` : null,
      badgeColor:
        "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400",
    },
    {
      title: "Confirmed",
      value: loading ? "…" : confirmed,
      icon: CheckCircle2,
      badge: total > 0 ? `${Math.round((confirmed / total) * 100)}%` : null,
      badgeColor:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
    },
    {
      title: "Completed",
      value: loading ? "…" : completed,
      icon: Trophy,
      badge: total > 0 ? `${Math.round((completed / total) * 100)}%` : null,
      badgeColor:
        "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400",
    },
    {
      title: "Cancelled",
      value: loading ? "…" : cancelled,
      icon: XCircle,
      badge: total > 0 ? `${Math.round((cancelled / total) * 100)}%` : null,
      badgeColor:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400",
    },
    {
      title: "No-show",
      value: loading ? "…" : noShow,
      icon: UserX,
      badge: total > 0 ? `${Math.round((noShow / total) * 100)}%` : null,
      badgeColor:
        "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <metric.icon className="text-muted-foreground size-6" />
              {metric.badge && (
                <Badge variant="outline" className={metric.badgeColor}>
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

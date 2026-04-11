import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Star, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PropertyListItem } from "../types";

interface StatCardsProps {
  properties: PropertyListItem[];
  loading: boolean;
}

export function StatCards({ properties, loading }: StatCardsProps) {
  const total = properties.length;
  const active = properties.filter((v) => v.status === "active").length;
  const pending = properties.filter((v) => v.status === "pending_approval").length;
  const apartments = properties.filter((v) => v.property_type === "apartment").length;
  const villas = properties.filter(
    (v) => v.property_type === "villa" || v.property_type === "house",
  ).length;

  const avgRating =
    total > 0
      ? (
          properties.reduce((sum, v) => sum + parseFloat(v.rating), 0) / total
        ).toFixed(1)
      : "0.0";

  const metrics = [
    {
      title: "Общо обекти",
      value: loading ? "…" : total,
      icon: Building2,
      badge: null,
    },
    {
      title: "Активни обекти",
      value: loading ? "…" : active,
      icon: CheckCircle2,
      badge: total > 0 ? `${Math.round((active / total) * 100)}%` : null,
      badgeGreen: true,
    },
    {
      title: "Чакащи одобрение",
      value: loading ? "…" : pending,
      icon: Clock,
      badge: total > 0 ? `${Math.round((pending / total) * 100)}%` : null,
      badgeYellow: true,
    },
    {
      title: "Средна оценка",
      value: loading ? "…" : avgRating,
      icon: Star,
      badge: null,
    },
    {
      title: "Апартаменти",
      value: loading ? "…" : apartments,
      icon: Building2,
      badge: total > 0 ? `${Math.round((apartments / total) * 100)}%` : null,
      badgeBlue: true,
    },
    {
      title: "Вили / Къщи",
      value: loading ? "…" : villas,
      icon: MapPin,
      badge: total > 0 ? `${Math.round((villas / total) * 100)}%` : null,
      badgeOrange: true,
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
                <Badge
                  variant="outline"
                  className={
                    metric.badgeGreen
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
                      : metric.badgeYellow
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400"
                        : metric.badgeBlue
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                          : metric.badgeOrange
                            ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-400"
                            : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/20 dark:text-gray-400"
                  }
                >
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

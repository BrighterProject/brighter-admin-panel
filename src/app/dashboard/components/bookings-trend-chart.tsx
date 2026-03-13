"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking } from "@/app/bookings/types";

interface Props {
  bookings: Booking[];
  loading: boolean;
}

type Range = "7d" | "30d" | "90d";

export function BookingsTrendChart({ bookings, loading }: Props) {
  const [range, setRange] = useState<Range>("30d");

  const chartData = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const now = new Date();
    const buckets: Record<string, { date: string; bookings: number; reproperty: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = {
        date: key,
        bookings: 0,
        reproperty: 0,
      };
    }

    for (const b of bookings) {
      const key = b.start_datetime.slice(0, 10);
      if (buckets[key]) {
        buckets[key].bookings += 1;
        if (b.status === "completed") {
          buckets[key].reproperty += parseFloat(b.total_price || "0");
        }
      }
    }

    return Object.values(buckets);
  }, [bookings, range]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Резервации по дни</CardTitle>
          <CardDescription>
            Брой резервации за избрания период
          </CardDescription>
        </div>
        <Select
          value={range}
          onValueChange={(v) => setRange(v as Range)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 дни</SelectItem>
            <SelectItem value="30d">30 дни</SelectItem>
            <SelectItem value="90d">90 дни</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-muted-foreground animate-pulse">
              Зареждане…
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => {
                  const d = new Date(v + "T00:00:00");
                  return d.toLocaleDateString("bg-BG", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelFormatter={(v: string) => {
                  const d = new Date(v + "T00:00:00");
                  return d.toLocaleDateString("bg-BG", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === "bookings" ? "Резервации" : "Приход (лв.)",
                ]}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(var(--primary))"
                fill="url(#fillBookings)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

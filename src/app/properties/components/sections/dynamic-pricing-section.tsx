import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetDatePrices, useClearDatePrices } from "../../hooks";
import type { DatePrice } from "../../types";

const WEEKDAY_HEADERS = ["Пон", "Вт", "Ср", "Чет", "Пет", "Съб", "Нед"];

const MONTH_NAMES = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември",
];

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendarDays(year: number, month: number): Array<string | null> {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // ISO: Mon=0 … Sun=6
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells: Array<string | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toIso(year, month, d));
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) cells.push(null);
  return cells;
}

function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Coalesce a date→price map into contiguous same-price ranges. */
function coalesce(prices: Map<string, string>): PendingPriceRange[] {
  const sorted = Array.from(prices.entries()).sort(([a], [b]) => a.localeCompare(b));
  const ranges: PendingPriceRange[] = [];
  for (const [date, price] of sorted) {
    const last = ranges[ranges.length - 1];
    const nextDay = new Date(last?.end_date ?? "");
    nextDay.setDate(nextDay.getDate() + 1);
    if (last && last.price === price && nextDay.toISOString().slice(0, 10) === date) {
      last.end_date = date;
    } else {
      ranges.push({ start_date: date, end_date: date, price });
    }
  }
  return ranges;
}

export interface PendingPriceRange {
  start_date: string;
  end_date: string;
  price: string;
}

interface DynamicPricingSectionProps {
  propertyId: string | undefined;
  currency?: string;
  datePrices?: DatePrice[];
  onPendingPricesChange?: (ranges: PendingPriceRange[]) => void;
}

export function DynamicPricingSection({
  propertyId,
  currency = "EUR",
  datePrices = [],
  onPendingPricesChange,
}: DynamicPricingSectionProps) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  // Range selection: first click sets the anchor, second extends it.
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd, setSelEnd] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Create mode keeps prices offline until submit; edit mode calls the API and
  // overlays just-saved values so the calendar updates before the refetch
  // (which can be served stale from the HTTP cache). null = cleared this session.
  const [offlinePrices, setOfflinePrices] = useState<Map<string, string>>(new Map());
  const [editOverlay, setEditOverlay] = useState<Map<string, string | null>>(new Map());

  const setPrices = useSetDatePrices(propertyId ?? "");
  const clearPrices = useClearDatePrices(propertyId ?? "");
  const saving = setPrices.isPending || clearPrices.isPending;

  // Effective date→price map for display.
  const priceMap = new Map<string, string>();
  if (propertyId) {
    for (const p of datePrices) priceMap.set(p.date, p.price);
    for (const [d, p] of editOverlay) {
      if (p === null) priceMap.delete(d);
      else priceMap.set(d, p);
    }
  } else {
    for (const [d, p] of offlinePrices) priceMap.set(d, p);
  }

  const emitOffline = (next: Map<string, string>) => {
    onPendingPricesChange?.(coalesce(next));
  };

  const rangeBounds = (): { start: string; end: string } | null => {
    if (!selStart) return null;
    const a = selStart;
    const b = selEnd ?? selStart;
    return a <= b ? { start: a, end: b } : { start: b, end: a };
  };

  const resetSelection = () => {
    setSelStart(null);
    setSelEnd(null);
    setPrice("");
    setError(null);
  };

  const handleDayClick = (date: string) => {
    if (date < todayStr) return;
    setError(null);
    // Start a fresh selection, or extend the current anchor to a range.
    if (selStart === null || selEnd !== null) {
      setSelStart(date);
      setSelEnd(null);
      const existing = priceMap.get(date);
      setPrice(existing ? String(Number(existing)) : "");
    } else {
      setSelEnd(date);
    }
  };

  const applyPrice = async () => {
    const bounds = rangeBounds();
    if (!bounds) return;
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError("Въведете валидна цена");
      return;
    }
    const value = Number(price).toFixed(2);
    if (propertyId) {
      await setPrices.mutateAsync({
        start_date: bounds.start,
        end_date: bounds.end,
        price: value,
      });
      setEditOverlay((prev) => {
        const next = new Map(prev);
        for (const d of eachDay(bounds.start, bounds.end)) next.set(d, value);
        return next;
      });
    } else {
      setOfflinePrices((prev) => {
        const next = new Map(prev);
        for (const d of eachDay(bounds.start, bounds.end)) next.set(d, value);
        emitOffline(next);
        return next;
      });
    }
    resetSelection();
  };

  const clearRange = async () => {
    const bounds = rangeBounds();
    if (!bounds) return;
    if (propertyId) {
      await clearPrices.mutateAsync({ start_date: bounds.start, end_date: bounds.end });
      setEditOverlay((prev) => {
        const next = new Map(prev);
        for (const d of eachDay(bounds.start, bounds.end)) next.set(d, null);
        return next;
      });
    } else {
      setOfflinePrices((prev) => {
        const next = new Map(prev);
        for (const d of eachDay(bounds.start, bounds.end)) next.delete(d);
        emitOffline(next);
        return next;
      });
    }
    resetSelection();
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildCalendarDays(year, month);
  const bounds = rangeBounds();

  const inSelection = (date: string): boolean =>
    bounds !== null && date >= bounds.start && date <= bounds.end;

  return (
    <section id="section-dynamic-pricing" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Ценови календар</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Изберете дата или период и задайте цена за нощувка. Дните без зададена
          цена са недостъпни за резервация.
          {!propertyId && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              (Цените ще бъдат запазени при изпращане.)
            </span>
          )}
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setViewDate((d) => addMonths(d, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {MONTH_NAMES[month]} {year}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {WEEKDAY_HEADERS.map((h) => (
            <div
              key={h}
              className="py-1.5 text-center text-xs font-medium text-muted-foreground"
            >
              {h}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((date, idx) => {
            if (!date) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="aspect-square border-r border-b last:border-r-0 bg-muted/20"
                />
              );
            }

            const isToday = date === todayStr;
            const isPast = date < todayStr;
            const priced = priceMap.get(date);
            const selected = inSelection(date);

            return (
              <div
                key={date}
                className={[
                  "relative aspect-square border-r border-b last:border-r-0 flex flex-col items-center justify-center gap-0.5 select-none transition-colors",
                  isPast ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                  selected ? "bg-primary/10 ring-1 ring-inset ring-primary" : "",
                  isToday && !selected ? "bg-blue-50 dark:bg-blue-950/20" : "",
                ].join(" ")}
                onClick={() => handleDayClick(date)}
              >
                <span
                  className={[
                    "text-xs font-medium leading-none",
                    isToday ? "text-blue-600 dark:text-blue-400" : "text-foreground",
                  ].join(" ")}
                >
                  {parseInt(date.slice(8))}
                </span>
                <span
                  className={[
                    "text-[10px] leading-none",
                    priced
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-muted-foreground/50",
                  ].join(" ")}
                >
                  {priced ? Number(priced).toFixed(0) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply / clear bar for the current selection */}
      {bounds && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="text-xs font-medium text-foreground">
            {bounds.start === bounds.end
              ? bounds.start
              : `${bounds.start} → ${bounds.end}`}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              autoFocus
              onChange={(e) => {
                setPrice(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice();
                if (e.key === "Escape") resetSelection();
              }}
              placeholder="0.00"
              className="h-8 text-sm max-w-32"
            />
            <span className="text-xs text-muted-foreground shrink-0">
              {currency} / нощ
            </span>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={saving}
              onClick={applyPrice}
            >
              <Check className="size-3 mr-1" />
              Приложи
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              disabled={saving}
              onClick={clearRange}
            >
              <X className="size-3 mr-1" />
              Изчисти
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              disabled={saving}
              onClick={resetSelection}
            >
              Отказ
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted border" />
          Без цена (недостъпно)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-900 border border-emerald-300" />
          Зададена цена
        </span>
      </div>
    </section>
  );
}

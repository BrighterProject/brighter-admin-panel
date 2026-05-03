import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateDateOverride,
  useUpdateDateOverride,
  useDeleteDateOverride,
} from "../../hooks";
import type { DatePriceOverride } from "../../types";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

interface DayEditPopoverProps {
  date: string;
  currentPrice: string | null;
  basePrice: string;
  currency: string;
  overrideId: string | null;
  onCreate: (price: string) => Promise<void>;
  onUpdate: (price: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

function DayEditPopover({
  date,
  currentPrice,
  basePrice,
  currency,
  overrideId,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: DayEditPopoverProps) {
  const [price, setPrice] = useState(currentPrice ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function handleSave() {
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError("Enter a valid price");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (overrideId) {
        await onUpdate(price);
      } else {
        await onCreate(price);
      }
      onClose();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (!overrideId) { onClose(); return; }
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setError("Failed to clear");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 w-44 rounded-lg border bg-popover shadow-md p-3 space-y-2">
      <div className="text-xs font-medium text-foreground">{date}</div>
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
          placeholder={basePrice}
          className="h-7 text-sm"
        />
        <span className="text-xs text-muted-foreground shrink-0">{currency}</span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-1">
        <Button size="sm" className="h-6 px-2 text-xs flex-1" disabled={saving} onClick={handleSave}>
          <Check className="size-3 mr-1" />
          Save
        </Button>
        {overrideId && (
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" disabled={saving} onClick={handleClear}>
            <X className="size-3" />
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" disabled={saving} onClick={onClose}>
          Esc
        </Button>
      </div>
    </div>
  );
}

interface PendingOverride {
  start_date: string;
  end_date: string;
  price: string;
}

interface DynamicPricingSectionProps {
  propertyId: string | undefined;
  basePricePerNight?: string;
  currency?: string;
  dateOverrides?: DatePriceOverride[];
  onPendingOverridesChange?: (overrides: PendingOverride[]) => void;
}

export function DynamicPricingSection({
  propertyId,
  basePricePerNight = "0",
  currency = "EUR",
  dateOverrides = [],
  onPendingOverridesChange,
}: DynamicPricingSectionProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [offlineOverrides, setOfflineOverrides] = useState<Map<string, string>>(new Map());

  const create = useCreateDateOverride(propertyId ?? '');
  const update = useUpdateDateOverride(propertyId ?? '');
  const del = useDeleteDateOverride(propertyId ?? '');

  const setOffline = (date: string, price: string) => {
    setOfflineOverrides((prev) => {
      const next = new Map(prev);
      next.set(date, price);
      onPendingOverridesChange?.(Array.from(next.entries()).map(([d, p]) => ({ start_date: d, end_date: d, price: p })));
      return next;
    });
  };

  const deleteOffline = (date: string) => {
    setOfflineOverrides((prev) => {
      const next = new Map(prev);
      next.delete(date);
      onPendingOverridesChange?.(Array.from(next.entries()).map(([d, p]) => ({ start_date: d, end_date: d, price: p })));
      return next;
    });
  };

  // In create mode: use offline overrides; in edit mode: use API-backed overrides
  const singleDayMap = new Map<string, DatePriceOverride>();
  if (propertyId) {
    for (const o of dateOverrides) {
      if (o.start_date === o.end_date) singleDayMap.set(o.start_date, o);
    }
  } else {
    for (const [date, price] of offlineOverrides.entries()) {
      singleDayMap.set(date, { id: date, start_date: date, end_date: date, price, label: null } as DatePriceOverride);
    }
  }

  // Range overrides (start != end) — shown as info only (edit mode only)
  const rangeOverrides = propertyId ? dateOverrides.filter((o) => o.start_date !== o.end_date) : [];

  // Determine which dates are covered by a range override
  const rangeCoveredDates = new Set<string>();
  for (const o of rangeOverrides) {
    const start = new Date(o.start_date);
    const end = new Date(o.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      rangeCoveredDates.add(d.toISOString().slice(0, 10));
    }
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildCalendarDays(year, month);
  const todayStr = today.toISOString().slice(0, 10);

  function getPriceDisplay(date: string): { price: string; isCustom: boolean } {
    const o = singleDayMap.get(date);
    if (o) return { price: Number(o.price).toFixed(0), isCustom: true };
    if (rangeCoveredDates.has(date)) return { price: "range", isCustom: true };
    return { price: Number(basePricePerNight).toFixed(0), isCustom: false };
  }

  return (
    <section id="section-dynamic-pricing" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Pricing Calendar</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Click any date to set a custom price. Base price ({Number(basePricePerNight).toFixed(0)} {currency}) applies otherwise.
          {!propertyId && <span className="ml-1 text-amber-600 dark:text-amber-400">(Overrides will be saved when you submit.)</span>}
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => { setEditingDate(null); setViewDate((d) => addMonths(d, -1)); }}
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
          onClick={() => { setEditingDate(null); setViewDate((d) => addMonths(d, 1)); }}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {WEEKDAY_HEADERS.map((h) => (
            <div key={h} className="py-1.5 text-center text-xs font-medium text-muted-foreground">
              {h}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((date, idx) => {
            if (!date) {
              return <div key={`blank-${idx}`} className="aspect-square border-r border-b last:border-r-0 bg-muted/20" />;
            }

            const isToday = date === todayStr;
            const isEditing = editingDate === date;
            const override = singleDayMap.get(date);
            const { price, isCustom } = getPriceDisplay(date);
            const isRange = rangeCoveredDates.has(date) && !override;
            const isPast = date < todayStr;

            return (
              <div
                key={date}
                className={[
                  "relative aspect-square border-r border-b last:border-r-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-colors",
                  isPast ? "opacity-50" : "hover:bg-muted/50",
                  isEditing ? "bg-primary/5 ring-1 ring-inset ring-primary" : "",
                  isToday && !isEditing ? "bg-blue-50 dark:bg-blue-950/20" : "",
                ].join(" ")}
                onClick={() => {
                  if (isEditing) return;
                  setEditingDate(date);
                }}
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
                    isCustom && !isRange ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "",
                    isRange ? "text-amber-500 dark:text-amber-400 font-medium" : "",
                    !isCustom ? "text-muted-foreground" : "",
                  ].join(" ")}
                >
                  {isRange ? "range" : `${price}`}
                </span>

                {isEditing && (
                  <DayEditPopover
                    date={date}
                    currentPrice={override ? String(override.price) : null}
                    basePrice={basePricePerNight}
                    currency={currency}
                    overrideId={override?.id ?? null}
                    onCreate={async (p) => {
                      if (!propertyId) { setOffline(date, p); return; }
                      await create.mutateAsync({ start_date: date, end_date: date, price: p });
                    }}
                    onUpdate={async (p) => {
                      if (!propertyId) { setOffline(date, p); return; }
                      await update.mutateAsync({ overrideId: override!.id, price: p });
                    }}
                    onDelete={async () => {
                      if (!propertyId) { deleteOffline(date); return; }
                      await del.mutateAsync(override!.id);
                    }}
                    onClose={() => setEditingDate(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted border" />
          Base price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-900 border border-emerald-300" />
          Custom price
        </span>
        {rangeOverrides.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-100 dark:bg-amber-900 border border-amber-300" />
            Range override
          </span>
        )}
      </div>

      {/* Range overrides info */}
      {rangeOverrides.length > 0 && (
        <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1.5">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Range-based overrides (not editable via calendar):
          </p>
          {rangeOverrides.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground">
                {o.start_date} → {o.end_date}
                {o.label && <span className="ml-1 text-muted-foreground">({o.label})</span>}
                {" — "}
                <span className="font-medium">{Number(o.price).toFixed(0)} {currency}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => del.mutate(o.id)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

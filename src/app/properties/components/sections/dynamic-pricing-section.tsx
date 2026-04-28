import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpsertWeekdayPrices,
  useCreateDateOverride,
  useUpdateDateOverride,
  useDeleteDateOverride,
} from "../../hooks";
import type { DatePriceOverride, WeekdayPrice } from "../../types";

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ─── Weekday grid ─────────────────────────────────────────────────────────────

interface WeekdayGridProps {
  propertyId: string;
  basePricePerNight: string;
  currency: string;
  existing: WeekdayPrice[];
}

function WeekdayGrid({ propertyId, basePricePerNight, currency, existing }: WeekdayGridProps) {
  const upsert = useUpsertWeekdayPrices(propertyId);

  const [prices, setPrices] = useState<(string | null)[]>(() => {
    const map = Object.fromEntries((existing ?? []).map((w) => [w.weekday, w.price]));
    return Array.from({ length: 7 }, (_, i) => map[i] ?? null);
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePriceChange(i: number, value: string) {
    setPrices((prev) => {
      const next = [...prev];
      next[i] = value === "" ? null : value;
      return next;
    });
    setSaved(false);
  }

  function handleToggle(i: number, useBase: boolean) {
    setPrices((prev) => {
      const next = [...prev];
      next[i] = useBase ? null : basePricePerNight;
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    const rules = prices
      .map((price, weekday) => (price !== null ? { weekday, price } : null))
      .filter(Boolean) as { weekday: number; price: string }[];
    try {
      await upsert.mutateAsync(rules);
      setSaved(true);
    } catch {
      setError("Failed to save weekday prices. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Weekday Prices</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Override per-weekday price. Leave "Use base" checked to use the
          default ({Number(basePricePerNight).toFixed(0)} {currency}/night).
        </p>
      </div>

      <div className="space-y-1.5">
        {WEEKDAY_LABELS.map((label, i) => {
          const useBase = prices[i] === null;
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <span className="w-24 text-sm font-medium">{label}</span>

              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={useBase}
                  onChange={(e) => handleToggle(i, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-muted"
                />
                Use base
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={useBase}
                value={useBase ? "" : (prices[i] ?? "")}
                onChange={(e) => handlePriceChange(i, e.target.value)}
                placeholder={basePricePerNight}
                className="ml-auto h-8 w-28 text-right disabled:opacity-40"
              />
              <span className="w-8 text-xs text-muted-foreground">{currency}</span>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button size="sm" onClick={handleSave} disabled={upsert.isPending}>
        {upsert.isPending ? "Saving…" : saved ? "Saved!" : "Save weekday prices"}
      </Button>
    </div>
  );
}

// ─── Date override form ───────────────────────────────────────────────────────

interface OverrideFormProps {
  propertyId: string;
  currency: string;
  editTarget?: DatePriceOverride;
  onDone: () => void;
}

function OverrideForm({ propertyId, currency, editTarget, onDone }: OverrideFormProps) {
  const create = useCreateDateOverride(propertyId);
  const update = useUpdateDateOverride(propertyId);

  const [startDate, setStartDate] = useState(editTarget?.start_date ?? "");
  const [endDate, setEndDate] = useState(editTarget?.end_date ?? "");
  const [price, setPrice] = useState(editTarget?.price ?? "");
  const [label, setLabel] = useState(editTarget?.label ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!startDate || !endDate || !price) {
      setError("Start date, end date and price are required.");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be on or after start date.");
      return;
    }
    try {
      if (editTarget) {
        await update.mutateAsync({
          overrideId: editTarget.id,
          start_date: startDate,
          end_date: endDate,
          price,
          label: label || null,
        });
      } else {
        await create.mutateAsync({
          start_date: startDate,
          end_date: endDate,
          price,
          label: label || null,
        });
      }
      onDone();
    } catch {
      setError("Failed to save override. Please try again.");
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h5 className="text-sm font-semibold">
        {editTarget ? "Edit override" : "Add date override"}
      </h5>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Start date *</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End date *</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Price per night * ({currency})</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Label (optional)</Label>
          <Input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Easter weekend"
            className="h-8 text-sm"
            maxLength={100}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Saving…" : editTarget ? "Update" : "Add"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Date overrides list ──────────────────────────────────────────────────────

interface DateOverridesProps {
  propertyId: string;
  currency: string;
  overrides: DatePriceOverride[];
}

function DateOverrides({ propertyId, currency, overrides }: DateOverridesProps) {
  const deleteOverride = useDeleteDateOverride(propertyId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DatePriceOverride | undefined>(undefined);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Date Overrides</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Holiday / special-date prices (highest priority).
          </p>
        </div>
        {!showForm && !editing && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowForm(true)}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        )}
      </div>

      {(showForm || editing) && (
        <OverrideForm
          propertyId={propertyId}
          currency={currency}
          editTarget={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}

      {overrides.length === 0 ? (
        <p className="text-sm text-muted-foreground">No date overrides yet.</p>
      ) : (
        <div className="space-y-1.5">
          {overrides.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {o.start_date} → {o.end_date}
                </span>
                {o.label && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {o.label}
                  </span>
                )}
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {Number(o.price).toFixed(0)} {currency}/night
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(o);
                    setShowForm(false);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteOverride.mutate(o.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface DynamicPricingSectionProps {
  propertyId: string | undefined;
  basePricePerNight?: string;
  currency?: string;
  weekdayPrices?: WeekdayPrice[];
  dateOverrides?: DatePriceOverride[];
}

export function DynamicPricingSection({
  propertyId,
  basePricePerNight = "0",
  currency = "EUR",
  weekdayPrices = [],
  dateOverrides = [],
}: DynamicPricingSectionProps) {
  return (
    <section id="section-dynamic-pricing" className="space-y-6 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Dynamic Pricing</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Per-weekday rates and special-date overrides. Priority: date override › weekday › base
          price.
        </p>
      </div>

      {!propertyId ? (
        <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
          Save the property first to configure dynamic pricing.
        </p>
      ) : (
        <>
          <WeekdayGrid
            propertyId={propertyId}
            basePricePerNight={basePricePerNight}
            currency={currency}
            existing={weekdayPrices}
          />
          <DateOverrides propertyId={propertyId} currency={currency} overrides={dateOverrides} />
        </>
      )}
    </section>
  );
}

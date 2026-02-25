"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useController, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateVenue, useVenue } from "../hooks";
import type { VenueListItem, Venue, SportType, WorkingHours } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPORT_LABELS: Record<string, string> = {
  football: "Футбол",
  basketball: "Баскетбол",
  tennis: "Тенис",
  volleyball: "Волейбол",
  swimming: "Плуване",
  gym: "Фитнес",
  padel: "Падел",
  other: "Друго",
};

const sportTypeOptions: SportType[] = [
  "football",
  "basketball",
  "tennis",
  "volleyball",
  "swimming",
  "gym",
  "padel",
  "other",
];

const DAYS = [
  { key: "0", label: "Понеделник" },
  { key: "1", label: "Вторник" },
  { key: "2", label: "Сряда" },
  { key: "3", label: "Четвъртък" },
  { key: "4", label: "Петък" },
  { key: "5", label: "Събота" },
  { key: "6", label: "Неделя" },
  { key: "default", label: "По подразбиране" },
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const timeSlotSchema = z.object({
  enabled: z.boolean(),
  open: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Използвайте формат ЧЧ:ММ")
    .optional()
    .or(z.literal("")),
  close: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Използвайте формат ЧЧ:ММ")
    .optional()
    .or(z.literal("")),
});

const editFormSchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа.").optional(),
  description: z
    .string()
    .min(10, "Описанието трябва да е поне 10 символа.")
    .optional()
    .or(z.literal("")),
  sport_types: z.array(z.string()).optional(),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional(),
  latitude: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Невалиден формат за географска ширина.")
    .optional()
    .or(z.literal("")),
  longitude: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Невалиден формат за географска дължина.")
    .optional()
    .or(z.literal("")),
  price_per_hour: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Невалиден формат на цената.")
    .optional(),
  currency: z
    .string()
    .length(3, "Валутата трябва да е 3 символа (напр. BGN)")
    .optional(),
  capacity: z.coerce
    .number()
    .min(1, "Капацитетът трябва да е поне 1")
    .optional(),
  is_indoor: z.boolean().optional(),
  has_parking: z.boolean().optional(),
  has_changing_rooms: z.boolean().optional(),
  has_showers: z.boolean().optional(),
  has_equipment_rental: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
  working_hours: z.record(z.string(), timeSlotSchema).optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;
type TimeSlot = z.infer<typeof timeSlotSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormWorkingHours(
  wh: WorkingHours | null | undefined,
): Record<string, TimeSlot> {
  const result: Record<string, TimeSlot> = {};
  for (const { key } of DAYS) {
    const slot = wh?.[key as keyof WorkingHours] as
      | { open: string; close: string }
      | null
      | undefined;
    result[key] = slot
      ? { enabled: true, open: slot.open, close: slot.close }
      : { enabled: false, open: "08:00", close: "20:00" };
  }
  return result;
}

function toApiWorkingHours(
  formWH: Record<string, TimeSlot>,
): WorkingHours | null {
  const result: Record<string, { open: string; close: string } | null> = {};
  let hasAny = false;
  for (const { key } of DAYS) {
    const slot = formWH[key];
    if (slot?.enabled && slot.open && slot.close) {
      result[key] = { open: slot.open, close: slot.close };
      hasAny = true;
    }
  }
  return hasAny ? (result as WorkingHours) : null;
}

// ─── AmenitiesInput ───────────────────────────────────────────────────────────

function AmenitiesInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-1.5 min-h-10 p-2 rounded-md border bg-background cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1 pr-1 h-6">
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(item);
              }}
              className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={
            value.length === 0 ? "Въведете и натиснете Enter..." : ""
          }
          className="flex-1 min-w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {draft.trim() && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={add}
        >
          <Plus className="size-3 mr-1" />
          Добави &bdquo;{draft.trim()}&ldquo;
        </Button>
      )}
    </div>
  );
}

// ─── WorkingHoursRow ──────────────────────────────────────────────────────────

function WorkingHoursRow({
  dayKey,
  label,
  control,
}: {
  dayKey: string;
  label: string;
  control: ReturnType<typeof useForm<EditFormValues>>["control"];
}) {
  const { field: enabledField } = useController({
    control,
    name: `working_hours.${dayKey}.enabled` as any,
  });
  const { field: openField } = useController({
    control,
    name: `working_hours.${dayKey}.open` as any,
  });
  const { field: closeField } = useController({
    control,
    name: `working_hours.${dayKey}.close` as any,
  });

  const isEnabled = !!enabledField.value;
  const isDefault = dayKey === "default";

  return (
    <div
      className={`grid grid-cols-[160px_1fr_1fr] items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
        isEnabled
          ? isDefault
            ? "bg-primary/5 border-primary/20"
            : "bg-background"
          : "bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={enabledField.onChange}
          className="scale-90 shrink-0"
        />
        <span
          className={`text-sm font-medium truncate ${
            !isEnabled
              ? "text-muted-foreground"
              : isDefault
                ? "text-primary"
                : ""
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-11 shrink-0">
          Отв.
        </span>
        <Input
          type="time"
          disabled={!isEnabled}
          className="h-8 text-sm"
          {...openField}
          value={openField.value ?? ""}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-11 shrink-0">
          Затв.
        </span>
        <Input
          type="time"
          disabled={!isEnabled}
          className="h-8 text-sm"
          {...closeField}
          value={closeField.value ?? ""}
        />
      </div>
    </div>
  );
}

// ─── FormSkeleton ─────────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-6 pr-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface VenueEditDialogProps {
  venue: VenueListItem | null;
  onClose: () => void;
}

export function VenueEditDialog({ venue, onClose }: VenueEditDialogProps) {
  const { mutate: updateVenue, isPending } = useUpdateVenue();
  const { data: fullVenue, isLoading } = useVenue(venue?.id ?? null);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema) as Resolver<EditFormValues>,
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      price_per_hour: "",
      currency: "BGN",
      capacity: 1,
      is_indoor: false,
      has_parking: false,
      has_changing_rooms: false,
      has_showers: false,
      has_equipment_rental: false,
      sport_types: [],
      amenities: [],
      working_hours: toFormWorkingHours(null),
    },
  });

  const selectedSports = form.watch("sport_types") ?? [];

  useEffect(() => {
    const source = fullVenue ?? venue;
    if (!source) return;

    form.reset({
      name: source.name,
      city: source.city,
      price_per_hour: source.price_per_hour,
      currency: source.currency,
      capacity: source.capacity,
      is_indoor: source.is_indoor,
      sport_types: source.sport_types,
      description: (source as Venue).description ?? "",
      address: (source as Venue).address ?? "",
      latitude: (source as Venue).latitude ?? "",
      longitude: (source as Venue).longitude ?? "",
      has_parking: (source as Venue).has_parking ?? false,
      has_changing_rooms: (source as Venue).has_changing_rooms ?? false,
      has_showers: (source as Venue).has_showers ?? false,
      has_equipment_rental: (source as Venue).has_equipment_rental ?? false,
      amenities: (source as Venue).amenities ?? [],
      working_hours: toFormWorkingHours((source as Venue).working_hours),
    });
  }, [fullVenue, venue, form]);

  const toggleSport = (sport: SportType) => {
    const current = form.getValues("sport_types") ?? [];
    form.setValue(
      "sport_types",
      current.includes(sport)
        ? current.filter((s) => s !== sport)
        : [...current, sport],
      { shouldDirty: true },
    );
  };

  const onSubmit = (data: EditFormValues) => {
    if (!venue) return;
    const source = fullVenue ?? venue;
    const changed: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(data)) {
      if (key === "working_hours") continue;
      if (val === "" || val === undefined) continue;
      const sourceKey = key as keyof typeof source;
      if (Array.isArray(val)) {
        if (JSON.stringify(val) !== JSON.stringify(source[sourceKey])) {
          changed[key] = val;
        }
      } else if (val !== source[sourceKey]) {
        changed[key] = val;
      }
    }

    if (data.working_hours) {
      const apiWH = toApiWorkingHours(data.working_hours);
      const originalWH = (source as Venue).working_hours ?? null;
      if (JSON.stringify(apiWH) !== JSON.stringify(originalWH)) {
        changed.working_hours = apiWH;
      }
    }

    if (Object.keys(changed).length === 0) {
      onClose();
      return;
    }

    updateVenue({ id: venue.id, data: changed }, { onSuccess: onClose });
  };

  return (
    <Dialog open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Редактиране на обект</DialogTitle>
          <DialogDescription>
            Актуализирайте данните за обекта. Ще бъдат изпратени само
            променените полета.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6 pr-4">
                  {/* ── Basic Information ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Основна информация
                    </h4>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Име на обекта</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Опишете обекта..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ── Location ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Локация
                    </h4>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адрес</FormLabel>
                          <FormControl>
                            <Input placeholder="ул. Примерна 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Град</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ширина (Lat)</FormLabel>
                            <FormControl>
                              <Input placeholder="напр. 42.6977" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Дължина (Long)</FormLabel>
                            <FormControl>
                              <Input placeholder="напр. 23.3219" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* ── Sport Types ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Видове спорт
                    </h4>
                    <FormField
                      control={form.control}
                      name="sport_types"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <div className="flex flex-wrap gap-2">
                              {sportTypeOptions.map((sport) => (
                                <Badge
                                  key={sport}
                                  variant={
                                    selectedSports.includes(sport)
                                      ? "default"
                                      : "outline"
                                  }
                                  className="cursor-pointer"
                                  onClick={() => toggleSport(sport)}
                                >
                                  {SPORT_LABELS[sport] || sport}
                                </Badge>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ── Pricing & Capacity ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Цени и капацитет
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price_per_hour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Цена на час</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Валута</FormLabel>
                            <FormControl>
                              <Input maxLength={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Макс. капацитет</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ── Facilities ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Оборудване и условия
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(
                        [
                          { name: "is_indoor", label: "Закрит обект" },
                          { name: "has_parking", label: "Паркинг" },
                          {
                            name: "has_changing_rooms",
                            label: "Съблекални",
                          },
                          { name: "has_showers", label: "Душове" },
                          {
                            name: "has_equipment_rental",
                            label: "Наем на екипировка",
                          },
                        ] as const
                      ).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <FormLabel className="cursor-pointer m-0">
                                {label}
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* ── Amenities ── */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Допълнителни удобства
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Въведете текст и натиснете Enter, за да добавите таг.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AmenitiesInput
                              value={field.value ?? []}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ── Working Hours ── */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Работно време
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Активирайте всеки ден поотделно. Редът{" "}
                        <span className="font-medium">По подразбиране</span> се
                        ползва за непосочени дни.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {DAYS.map(({ key, label }) => (
                        <WorkingHoursRow
                          key={key}
                          dayKey={key}
                          label={label}
                          control={form.control}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="cursor-pointer"
                  >
                    Отказ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || isLoading}
                    className="cursor-pointer"
                  >
                    {isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Запази промените
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

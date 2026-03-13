"use client";

import { useRef, useState } from "react";
import { useForm, useController, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddProperty } from "@/app/properties/hooks";
import type { PropertyFormValues, SportType } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

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
    .regex(/^\d{2}:\d{2}$/, "Използвайте ЧЧ:ММ")
    .optional()
    .or(z.literal("")),
  close: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Използвайте ЧЧ:ММ")
    .optional()
    .or(z.literal("")),
});

const propertyFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name must be at most 255 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  sport_types: z.array(z.string()).min(1, "Select at least one sport type."),
  address: z
    .string()
    .min(1, "Address is required.")
    .max(500, "Address must be at most 500 characters."),
  city: z
    .string()
    .min(1, "City is required.")
    .max(100, "City must be at most 100 characters."),
  latitude: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Invalid latitude format.")
    .optional()
    .or(z.literal("")),
  longitude: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Invalid longitude format.")
    .optional()
    .or(z.literal("")),
  price_per_hour: z.string().regex(/^\d*\.?\d{0,2}$/, "Invalid price format."),
  currency: z.string().length(3, "Currency must be 3 characters."),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  is_indoor: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_changing_rooms: z.boolean().default(false),
  has_showers: z.boolean().default(false),
  has_equipment_rental: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  working_hours: z.record(z.string(), timeSlotSchema).optional(),
});

type FormValues = z.infer<typeof propertyFormSchema>;
type TimeSlot = z.infer<typeof timeSlotSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultWorkingHours(): Record<string, TimeSlot> {
  return Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      { enabled: false, open: "08:00", close: "20:00" },
    ]),
  );
}

function toApiWorkingHours(
  formWH: Record<string, TimeSlot>,
): Record<string, { open: string; close: string }> | null {
  const result: Record<string, { open: string; close: string }> = {};
  let hasAny = false;
  for (const { key } of DAYS) {
    const slot = formWH[key];
    if (slot?.enabled && slot.open && slot.close) {
      result[key] = { open: slot.open, close: slot.close };
      hasAny = true;
    }
  }
  return hasAny ? result : null;
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
    const trimmed = draft.trim().toLowerCase();
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
          <Badge
            key={item}
            variant="secondary"
            className="gap-1 pr-1 capitalize h-6"
          >
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
          placeholder={value.length === 0 ? "Въведете и натиснете Enter…" : ""}
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
          Add &ldquo;{draft.trim()}&rdquo;
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
  control: ReturnType<typeof useForm<FormValues>>["control"];
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
        <span className="text-xs text-muted-foreground w-9 shrink-0">
          Отваря
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
        <span className="text-xs text-muted-foreground w-9 shrink-0">
          Затваря
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function PropertyFormDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createProperty, isPending } = useAddProperty();

  const form = useForm<FormValues>({
    resolver: zodResolver(propertyFormSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      sport_types: [],
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
      amenities: [],
      working_hours: defaultWorkingHours(),
    },
  });

  const selectedSports = form.watch("sport_types");

  const toggleSport = (sport: SportType) => {
    const current = form.getValues("sport_types");
    form.setValue(
      "sport_types",
      current.includes(sport)
        ? current.filter((s) => s !== sport)
        : [...current, sport],
      { shouldValidate: true },
    );
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    const payload: PropertyFormValues = {
      ...data,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      working_hours: data.working_hours
        ? toApiWorkingHours(data.working_hours)
        : null,
    } as PropertyFormValues;

    createProperty(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 size-4" />
          Добави обект
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Добави обект</DialogTitle>
          <DialogDescription>
            Създайте нов обект. Попълнете всички задължителни полета и натиснете
            запази.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 pr-4">
                {/* ── Basic Information ── */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Основна информация
                  </h4>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Наименование</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Централна спортна арена"
                            {...field}
                          />
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
                            placeholder="Опишете обекта…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* ── Sport Types ── */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Видове спорт
                  </h4>
                  <FormField
                    control={form.control}
                    name="sport_types"
                    render={() => (
                      <FormItem>
                        <FormLabel>Изберете спортове</FormLabel>
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
                                className="cursor-pointer capitalize"
                                onClick={() => toggleSport(sport)}
                              >
                                {sport}
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

                {/* ── Location ── */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Местоположение
                  </h4>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес</FormLabel>
                        <FormControl>
                          <Input placeholder="ул. Витоша 1" {...field} />
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
                          <Input placeholder="София" {...field} />
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
                          <FormLabel>Географска ширина (по избор)</FormLabel>
                          <FormControl>
                            <Input placeholder="40.7128" {...field} />
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
                          <FormLabel>Географска дължина (по избор)</FormLabel>
                          <FormControl>
                            <Input placeholder="-74.0060" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* ── Pricing & Capacity ── */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">
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
                            <Input placeholder="50.00" {...field} />
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
                            <Input placeholder="EUR" maxLength={3} {...field} />
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
                        <FormLabel>Капацитет</FormLabel>
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
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Съоръжения
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        { name: "is_indoor", label: "Закрит" },
                        { name: "has_parking", label: "Паркинг" },
                        { name: "has_changing_rooms", label: "Съблекални" },
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
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Удобства
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Въведете и натиснете Enter. Backspace премахва последния
                      таг.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <AmenitiesInput
                            value={field.value}
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
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Работно време
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Включете всеки ден поотделно. Редът{" "}
                      <span className="font-medium">по подразбиране</span> важи
                      за неуточнени дни.
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
                  onClick={handleClose}
                  className="cursor-pointer"
                >
                  Отказ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  {isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Запази обект
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

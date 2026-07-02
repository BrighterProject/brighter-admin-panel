import { z } from "zod";

const translationLocaleSchema = z.object({
  name: z.string(),
  description: z.string(),
  address: z.string(),
  house_rules: z.string().optional(),
});

const bedEntrySchema = z.object({
  bed_type: z.enum([
    "single",
    "double",
    "queen",
    "king",
    "sofa_bed",
    "bunk",
    "crib",
  ]),
  count: z.coerce.number().min(1, "Поне 1 легло"),
});

const roomEntrySchema = z.object({
  room_type: z.enum([
    "bedroom",
    "living_room",
    "kitchen",
    "bathroom",
    "studio",
  ]),
  count: z.coerce.number().min(1, "Поне 1"),
  beds: z.array(bedEntrySchema),
});

const imageCreateSchema = z.object({
  url: z.string().url("Невалиден URL на снимка"),
  is_thumbnail: z.boolean().default(false),
  order: z.number().default(0),
});

export const propertyFormSchema = z.object({
  property_type: z.enum(
    [
      "apartment",
      "house",
      "villa",
      "hotel",
      "hostel",
      "guesthouse",
      "room",
      "other",
    ],
    { required_error: "Видът имот е задължителен" },
  ),
  registration_number: z
    .string()
    .min(1, "Регистрационният номер е задължителен"),
  region_code: z.string().min(1, "Регионът е задължителен"),
  settlement_ekatte: z.string().min(1, "Населеното място е задължително"),
  lat: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Невалидна ширина")
    .optional()
    .or(z.literal("")),
  lng: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Невалидна дължина")
    .optional()
    .or(z.literal("")),
  has_parking: z.boolean().default(false),
  // Base price is no longer entered here — it is derived server-side as the
  // cheapest night in the pricing calendar (dynamic-pricing section below).
  currency: z.string().length(3, "Трябва да е 3 символа").default("EUR"),
  min_nights: z.coerce.number().min(1, "Минимум 1 нощувка").default(1),
  max_nights: z.coerce.number().min(1, "Минимум 1 нощувка").default(30),
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/, "Използвайте формат ЧЧ:ММ"),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/, "Използвайте формат ЧЧ:ММ"),
  cancellation_policy: z.enum(["free", "moderate", "strict"], {
    required_error: "Политиката за отказ е задължителна",
  }),
  bedrooms: z.coerce.number().min(0, "Не може да е отрицателно"),
  bathrooms: z.coerce.number().min(0, "Не може да е отрицателно"),
  beds: z.coerce.number().min(1, "Поне 1 легло"),
  max_guests: z.coerce.number().min(1, "Поне 1 гост"),
  rooms: z.array(roomEntrySchema),
  amenities: z.array(
    z.enum([
      "wifi",
      "air_conditioning",
      "kitchen",
      "washing_machine",
      "fireplace",
      "bbq",
      "mountain_view",
      "ski_storage",
      "breakfast_included",
      "reception_24h",
      "sea_view",
      "balcony",
      "pool",
      "garden",
      "pet_friendly",
      "coffee_machine",
    ]),
  ),
  images: z.array(imageCreateSchema),
  enable_gap_filler: z.boolean().default(false),
  gap_tax_pct: z.coerce.number().min(-100).max(100).default(10),
  gap_last_minute_window: z.coerce.number().min(1).max(90).default(7),
  payment_config: z
    .object({
      accepted_methods: z
        .array(z.enum(["card", "bank_transfer", "cash"]))
        .default(["card"]),
      deposit_pct: z.number().min(20).max(100).default(100),
      remaining_method: z
        .enum(["card", "bank_transfer", "cash"])
        .nullable()
        .optional(),
    })
    .default({}),
  translations: z.object({
    bg: z.object({
      name: z.string().min(2, "Наименованието трябва да е поне 2 символа"),
      description: z
        .string()
        .min(10, "Описанието трябва да е поне 10 символа"),
      address: z.string().min(1, "Адресът е задължителен"),
      house_rules: z.string().optional(),
    }),
    en: translationLocaleSchema,
    ru: translationLocaleSchema,
  }),
}).superRefine((data, ctx) => {
  // Optional locales (en/ru) are all-or-nothing: if the owner starts filling
  // one in, name/description/address must satisfy the same minimums the backend
  // enforces — otherwise a half-filled translation is silently rejected by the
  // API with no field-level error shown in the form.
  for (const locale of ["en", "ru"] as const) {
    const t = data.translations[locale];
    const started =
      t.name.trim() !== "" ||
      t.description.trim() !== "" ||
      t.address.trim() !== "" ||
      (t.house_rules?.trim() ?? "") !== "";
    if (!started) continue;

    if (t.name.trim().length < 2)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["translations", locale, "name"],
        message: "Наименованието трябва да е поне 2 символа",
      });
    if (t.description.trim().length < 10)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["translations", locale, "description"],
        message: "Описанието трябва да е поне 10 символа",
      });
    if (t.address.trim().length < 1)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["translations", locale, "address"],
        message: "Адресът е задължителен",
      });
  }
});

export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;

export const DEV_PROPERTY_DEFAULTS: PropertyFormSchema = {
  property_type: "apartment",
  registration_number: "REG-DEV-001",
  region_code: "",
  settlement_ekatte: "",
  lat: "42.6977",
  lng: "23.3219",
  has_parking: true,
  currency: "EUR",
  min_nights: 1,
  max_nights: 30,
  check_in_time: "14:00",
  check_out_time: "11:00",
  cancellation_policy: "free",
  bedrooms: 2,
  bathrooms: 1,
  beds: 2,
  max_guests: 4,
  rooms: [
    {
      room_type: "bedroom",
      count: 1,
      beds: [{ bed_type: "double", count: 1 }],
    },
    { room_type: "living_room", count: 1, beds: [] },
    { room_type: "bathroom", count: 1, beds: [] },
  ],
  amenities: ["wifi", "air_conditioning", "kitchen"],
  images: [],
  enable_gap_filler: false,
  gap_tax_pct: 10,
  gap_last_minute_window: 7,
  payment_config: {
    accepted_methods: ["cash"],
    deposit_pct: 100,
    remaining_method: null,
  },
  translations: {
    bg: {
      name: "Тест апартамент София",
      description:
        "Уютен апартамент в центъра на София с прекрасна гледка към Витоша. Напълно обзаведен с модерна кухня и всички необходими удобства.",
      address: "ул. Витоша 1, ет. 3, ап. 7",
      house_rules: "Не се пуши. Домашни любимци с предварително съгласие.",
    },
    en: {
      name: "Test Apartment Sofia",
      description:
        "Cozy apartment in the centre of Sofia with a lovely view of Vitosha mountain. Fully furnished with a modern kitchen and all necessary amenities.",
      address: "1 Vitosha Str, fl. 3, apt. 7",
      house_rules: "No smoking. Pets allowed with prior agreement.",
    },
    ru: { name: "", description: "", address: "", house_rules: "" },
  },
};

export const PROPERTY_FORM_DEFAULTS: PropertyFormSchema = {
  property_type: "apartment",
  registration_number: "",
  region_code: "",
  settlement_ekatte: "",
  lat: "",
  lng: "",
  has_parking: false,
  currency: "EUR",
  min_nights: 1,
  max_nights: 30,
  check_in_time: "14:00",
  check_out_time: "11:00",
  cancellation_policy: "free",
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  max_guests: 2,
  rooms: [],
  amenities: [],
  images: [],
  enable_gap_filler: false,
  gap_tax_pct: 10,
  gap_last_minute_window: 7,
  payment_config: {
    accepted_methods: ["cash"],
    deposit_pct: 100,
    remaining_method: null,
  },
  translations: {
    bg: { name: "", description: "", address: "", house_rules: "" },
    en: { name: "", description: "", address: "", house_rules: "" },
    ru: { name: "", description: "", address: "", house_rules: "" },
  },
};

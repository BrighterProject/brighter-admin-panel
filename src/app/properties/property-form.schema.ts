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
  count: z.coerce.number().min(1, "At least 1 bed"),
});

const roomEntrySchema = z.object({
  room_type: z.enum([
    "bedroom",
    "living_room",
    "kitchen",
    "bathroom",
    "studio",
  ]),
  count: z.coerce.number().min(1, "At least 1"),
  beds: z.array(bedEntrySchema),
});

const imageCreateSchema = z.object({
  url: z.string().url("Invalid image URL"),
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
    { required_error: "Property type is required" },
  ),
  registration_number: z
    .string()
    .min(1, "Регистрационният номер е задължителен"),
  region_code: z.string().min(1, "Region is required"),
  settlement_ekatte: z.string().min(1, "Settlement is required"),
  lat: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Invalid latitude")
    .optional()
    .or(z.literal("")),
  lng: z
    .string()
    .regex(/^[-+]?\d*\.?\d*$/, "Invalid longitude")
    .optional()
    .or(z.literal("")),
  has_parking: z.boolean().default(false),
  price_per_night: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price — use format like 80 or 80.50"),
  currency: z.string().length(3, "Must be 3 characters").default("EUR"),
  min_nights: z.coerce.number().min(1, "Minimum 1 night").default(1),
  max_nights: z.coerce.number().min(1, "Minimum 1 night").default(30),
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  cancellation_policy: z.enum(["free", "moderate", "strict"], {
    required_error: "Cancellation policy is required",
  }),
  bedrooms: z.coerce.number().min(0, "Cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Cannot be negative"),
  beds: z.coerce.number().min(1, "At least 1 bed"),
  max_guests: z.coerce.number().min(1, "At least 1 guest"),
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
  payment_config: z.object({
    accepted_methods: z.array(z.enum(["card", "bank_transfer", "cash"])).default(["card"]),
    deposit_pct: z.number().min(20).max(100).default(100),
    remaining_method: z.enum(["card", "bank_transfer", "cash"]).nullable().optional(),
  }).default({}),
  translations: z.object({
    bg: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      address: z.string().min(1, "Address is required"),
      house_rules: z.string().optional(),
    }),
    en: translationLocaleSchema,
    ru: translationLocaleSchema,
  }),
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
  price_per_night: "80",
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
    { room_type: "bedroom", count: 1, beds: [{ bed_type: "double", count: 1 }] },
    { room_type: "living_room", count: 1, beds: [] },
    { room_type: "bathroom", count: 1, beds: [] },
  ],
  amenities: ["wifi", "air_conditioning", "kitchen"],
  images: [],
  enable_gap_filler: false,
  gap_tax_pct: 10,
  gap_last_minute_window: 7,
  payment_config: {
    accepted_methods: ["card"],
    deposit_pct: 100,
    remaining_method: null,
  },
  translations: {
    bg: {
      name: "Тест апартамент София",
      description: "Уютен апартамент в центъра на София с прекрасна гледка към Витоша. Напълно обзаведен с модерна кухня и всички необходими удобства.",
      address: "ул. Витоша 1, ет. 3, ап. 7",
      house_rules: "Не се пуши. Домашни любимци с предварително съгласие.",
    },
    en: {
      name: "Test Apartment Sofia",
      description: "Cozy apartment in the centre of Sofia with a lovely view of Vitosha mountain. Fully furnished with a modern kitchen and all necessary amenities.",
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
  price_per_night: "",
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
    accepted_methods: ["card"],
    deposit_pct: 100,
    remaining_method: null,
  },
  translations: {
    bg: { name: "", description: "", address: "", house_rules: "" },
    en: { name: "", description: "", address: "", house_rules: "" },
    ru: { name: "", description: "", address: "", house_rules: "" },
  },
};

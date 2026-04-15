"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { PropertyListItem, AmenityType, CancellationPolicy } from "../types";
import { AMENITY_LABELS } from "../types";
import { useProperty } from "../hooks";
import {
  MapPin,
  Users,
  Star,
  Building2,
  Car,
  Clock,
  Image as ImageIcon,
  CalendarX,
  Pencil,
  ImagePlus,
  CalendarPlus,
} from "lucide-react";

interface PropertyDetailsDialogProps {
  property: PropertyListItem | null;
  onClose: () => void;
  onEditClick: (property: PropertyListItem) => void;
  onManageImages?: (property: PropertyListItem) => void;
  onManageUnavailability?: (property: PropertyListItem) => void;
}

const statusColors: Record<string, string> = {
  active: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  inactive: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20",
  maintenance:
    "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  pending_approval:
    "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  inactive: "Неактивен",
  maintenance: "Профилактика",
  pending_approval: "Чака одобрение",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Апартамент",
  house: "Къща",
  villa: "Вила",
  hotel: "Хотел",
  hostel: "Хостел",
  guesthouse: "Гостилница",
  room: "Стая",
  other: "Друго",
};

const CANCELLATION_LABELS: Record<CancellationPolicy, string> = {
  free: "Безплатна",
  moderate: "Умерена",
  strict: "Строга",
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  bedroom: "Спалня",
  living_room: "Хол",
  kitchen: "Кухня",
  bathroom: "Баня",
  studio: "Студио",
};

const BED_TYPE_LABELS: Record<string, string> = {
  single: "Единично",
  double: "Двойно",
  queen: "Queen",
  king: "King",
  sofa_bed: "Разтегателен диван",
  bunk: "Двуетажно",
  crib: "Бебешко",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

export function PropertyDetailsDialog({
  property,
  onClose,
  onEditClick,
  onManageImages,
  onManageUnavailability,
}: PropertyDetailsDialogProps) {
  const { data: fullProperty, isLoading } = useProperty(property?.id ?? null);

  if (!property) return null;

  const bgTranslation = fullProperty?.translations?.find((t) => t.locale === "bg");
  const address = bgTranslation?.address ?? "";

  return (
    <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Детайли за обекта</DialogTitle>
          <DialogDescription>
            Пълна информация за избрания обект.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {isLoading ? (
            <div className="space-y-4 pr-4">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {fullProperty?.images?.[0]?.url ? (
                    <img
                      src={fullProperty.images[0].url}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : property.thumbnail ? (
                    <img
                      src={property.thumbnail}
                      alt={property.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <MapPin className="size-3.5" />
                    <span>
                      {address ? `${address}, ` : ""}
                      {property.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={statusColors[property.status]}
                    >
                      {STATUS_LABELS[property.status] || property.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <ImageIcon className="size-4" /> Снимки (
                    {fullProperty?.images?.length ?? 0})
                  </p>
                  {onManageImages && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1"
                      onClick={() => onManageImages(property)}
                    >
                      <ImagePlus className="size-3.5" />
                      Управление
                    </Button>
                  )}
                </div>
                {fullProperty?.images && fullProperty.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {fullProperty.images.slice(0, 8).map((img, i) => (
                      <div
                        key={img.id ?? i}
                        className="aspect-square rounded-md overflow-hidden bg-muted relative"
                      >
                        <img
                          src={img.url}
                          alt={`Снимка ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {img.is_thumbnail && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                            Основна
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg">
                    <ImageIcon className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Няма добавени снимки</p>
                    {onManageImages && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => onManageImages(property)}
                      >
                        <ImagePlus className="size-3.5 mr-1" />
                        Добави снимки
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Описание</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="size-4 fill-current" />
                    <span className="font-semibold">{property.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {property.total_reviews} отзива
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <span className="font-semibold">
                      {property.price_per_night} {property.currency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">на нощ</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Users className="size-4" />
                    <span className="font-semibold">{property.max_guests}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">макс. гости</p>
                </div>
              </div>

              {/* Bedrooms / Bathrooms / Beds */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg border">
                  <p className="font-semibold">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Спални</p>
                </div>
                {fullProperty && (
                  <>
                    <div className="text-center p-3 rounded-lg border">
                      <p className="font-semibold">{fullProperty.bathrooms}</p>
                      <p className="text-xs text-muted-foreground">Бани</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border">
                      <p className="font-semibold">{fullProperty.beds}</p>
                      <p className="text-xs text-muted-foreground">Легла</p>
                    </div>
                  </>
                )}
              </div>

              {/* Amenities */}
              {fullProperty && fullProperty.amenities.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Удобства</p>
                    <div className="flex flex-wrap gap-2">
                      {fullProperty.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {AMENITY_LABELS[amenity as AmenityType] ?? amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Booking Conditions */}
              {fullProperty && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Условия за наем</p>
                    <DetailRow
                      label="Настаняване / Напускане"
                      value={
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {fullProperty.check_in_time} / {fullProperty.check_out_time}
                        </span>
                      }
                    />
                    <DetailRow
                      label="Мин. нощувки"
                      value={`${fullProperty.min_nights} нощ${fullProperty.min_nights !== 1 ? "и" : ""}`}
                    />
                    {fullProperty.max_nights && (
                      <DetailRow
                        label="Макс. нощувки"
                        value={`${fullProperty.max_nights} нощи`}
                      />
                    )}
                    <DetailRow
                      label="Анулация"
                      value={
                        CANCELLATION_LABELS[fullProperty.cancellation_policy] ||
                        fullProperty.cancellation_policy
                      }
                    />
                    <DetailRow
                      label="Паркинг"
                      value={
                        <span className="flex items-center gap-1">
                          <Car className="size-3.5 text-muted-foreground" />
                          {fullProperty.has_parking ? "Да" : "Не"}
                        </span>
                      }
                    />
                  </div>
                </>
              )}

              {/* Rooms */}
              {fullProperty && fullProperty.rooms.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Стаи</p>
                    <div className="space-y-1">
                      {fullProperty.rooms.map((room, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-md bg-muted/30 border text-sm"
                        >
                          <span className="font-medium">
                            {room.count}×{" "}
                            {ROOM_TYPE_LABELS[room.room_type] ?? room.room_type}
                          </span>
                          {room.beds.length > 0 && (
                            <span className="text-muted-foreground ml-2">
                              (
                              {room.beds
                                .map(
                                  (b) =>
                                    `${b.count}× ${BED_TYPE_LABELS[b.bed_type] ?? b.bed_type}`,
                                )
                                .join(", ")}
                              )
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Unavailabilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <CalendarX className="size-4" /> Неактивни периоди (
                    {fullProperty?.unavailabilities?.length ?? 0})
                  </p>
                  {onManageUnavailability && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1"
                      onClick={() => onManageUnavailability(property)}
                    >
                      <CalendarPlus className="size-3.5" />
                      Управление
                    </Button>
                  )}
                </div>
                {fullProperty?.unavailabilities &&
                fullProperty.unavailabilities.length > 0 ? (
                  <div className="space-y-1">
                    {fullProperty.unavailabilities.slice(0, 5).map((u, i) => {
                      const today = new Date().toISOString().slice(0, 10);
                      const isPast = u.end_date < today;
                      return (
                        <div
                          key={u.id ?? i}
                          className={`flex justify-between items-center text-sm px-3 py-2 rounded-md ${
                            isPast ? "bg-muted/30 opacity-60" : "bg-muted/50"
                          }`}
                        >
                          <span className="text-muted-foreground">
                            {u.reason ?? "Недостъпен"}
                          </span>
                          <span className="font-mono text-xs">
                            {new Date(u.start_date).toLocaleDateString("bg-BG")}{" "}
                            →{" "}
                            {new Date(u.end_date).toLocaleDateString("bg-BG")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg">
                    <CalendarX className="size-6 mx-auto mb-1 opacity-50" />
                    <p className="text-sm">Няма периоди на недостъпност</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* System Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Системна информация</p>
                <DetailRow
                  label="Property ID"
                  value={<span className="font-mono text-xs">{property.id}</span>}
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Затвори
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEditClick(property);
            }}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 size-4" />
            Редактирай
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

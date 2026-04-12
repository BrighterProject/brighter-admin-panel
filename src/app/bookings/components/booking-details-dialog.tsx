"use client";

import { useState } from "react";
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
import { ExternalLink } from "lucide-react";
import type { Booking } from "../types";
import { useUser } from "@/app/users/hooks";
import { UserDetailsDialog } from "@/app/users/components/user-details-dialog";

const statusColors: Record<string, string> = {
  pending:
    "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  confirmed: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  completed:
    "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  cancelled: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  no_show:
    "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
};

const statusLabels: Record<string, string> = {
  pending: "изчакваща",
  confirmed: "потвърдена",
  completed: "завършена",
  cancelled: "отказана",
  no_show: "неявяване",
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

interface UserButtonProps {
  id: string;
  username: string | null;
  fullName: string | null;
  onClick: () => void;
}

function UserButton({ id, username, fullName, onClick }: UserButtonProps) {
  if (!username) {
    return (
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
    );
  }
  return (
    <button
      onClick={onClick}
      className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer text-right"
    >
      {username}
      {fullName && (
        <span className="block text-xs text-muted-foreground">{fullName}</span>
      )}
    </button>
  );
}

interface BookingDetailsDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailsDialog({
  booking,
  onClose,
}: BookingDetailsDialogProps) {
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const { data: viewingUser } = useUser(viewingUserId);

  if (!booking) return null;

  const fmt = (dt: string) =>
    new Date(dt).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const durationNights =
    (new Date(booking.end_date).getTime() -
      new Date(booking.start_date).getTime()) /
    86400000;

  return (
    <>
      <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Детайли за резервацията</DialogTitle>
            <DialogDescription>
              Пълна информация за тази резервация.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-5 pr-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`capitalize ${statusColors[booking.status]}`}
                >
                  {statusLabels[booking.status] || booking.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium">График</p>
                <DetailRow label="Начало" value={fmt(booking.start_date)} />
                <DetailRow label="Край" value={fmt(booking.end_date)} />
                <DetailRow
                  label="Продължителност"
                  value={`${durationNights} нощ${durationNights === 1 ? "" : "и"}`}
                />
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium">Ценообразуване</p>
                <DetailRow
                  label="Тарифа"
                  value={`${booking.price_per_night} ${booking.currency}/нощ`}
                />
                <DetailRow
                  label="Общо"
                  value={
                    <span className="font-semibold">
                      {booking.total_price} {booking.currency}
                    </span>
                  }
                />
              </div>

              <Separator />

              {booking.special_requests && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Специални изисквания</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {booking.special_requests}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium">Справки</p>
                <DetailRow
                  label="ID на резервация"
                  value={
                    <span className="font-mono text-xs">{booking.id}</span>
                  }
                />
                <DetailRow
                  label="Обект"
                  value={
                    <a
                      href={`http://localhost:3000/properties/${booking.property_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
                    >
                      <span className="text-right">
                        {booking.property_name ?? booking.property_id}
                        {booking.property_name && (
                          <span className="block font-mono text-xs text-muted-foreground">
                            {booking.property_id}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  }
                />
                <DetailRow
                  label="Клиент"
                  value={
                    <UserButton
                      id={booking.user_id}
                      username={booking.customer_username}
                      fullName={booking.customer_full_name}
                      onClick={() => setViewingUserId(booking.user_id)}
                    />
                  }
                />
                <DetailRow
                  label="Собственик"
                  value={
                    <UserButton
                      id={booking.property_owner_id}
                      username={booking.owner_username}
                      fullName={booking.owner_full_name}
                      onClick={() => setViewingUserId(booking.property_owner_id)}
                    />
                  }
                />
                <DetailRow
                  label="Последна промяна"
                  value={fmt(booking.updated_at)}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Затвори
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailsDialog
        user={viewingUser ?? null}
        onClose={() => setViewingUserId(null)}
        onEditClick={() => setViewingUserId(null)}
      />
    </>
  );
}

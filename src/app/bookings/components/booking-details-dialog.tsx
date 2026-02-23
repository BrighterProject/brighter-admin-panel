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
import type { Booking } from "../types";

const statusColors: Record<string, string> = {
  pending:
    "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20",
  confirmed:
    "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  completed:
    "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  cancelled: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  no_show:
    "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
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

interface BookingDetailsDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailsDialog({
  booking,
  onClose,
}: BookingDetailsDialogProps) {
  if (!booking) return null;

  const fmt = (dt: string) =>
    new Date(dt).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const durationHours =
    (new Date(booking.end_datetime).getTime() -
      new Date(booking.start_datetime).getTime()) /
    3600000;

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Full information about this booking.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-5 pr-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`capitalize ${statusColors[booking.status]}`}
              >
                {booking.status.replace("_", " ")}
              </Badge>
            </div>

            <Separator />

            {/* Timing */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Schedule</p>
              <DetailRow label="Start" value={fmt(booking.start_datetime)} />
              <DetailRow label="End" value={fmt(booking.end_datetime)} />
              <DetailRow
                label="Duration"
                value={`${durationHours.toFixed(1)} h`}
              />
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Pricing</p>
              <DetailRow
                label="Rate"
                value={`${booking.price_per_hour} ${booking.currency}/h`}
              />
              <DetailRow
                label="Total"
                value={
                  <span className="font-semibold">
                    {booking.total_price} {booking.currency}
                  </span>
                }
              />
            </div>

            <Separator />

            {/* Notes */}
            {booking.notes && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {booking.notes}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* IDs */}
            <div className="space-y-1">
              <p className="text-sm font-medium">References</p>
              <DetailRow
                label="Booking ID"
                value={
                  <span className="font-mono text-xs">{booking.id}</span>
                }
              />
              <DetailRow
                label="Venue ID"
                value={
                  <span className="font-mono text-xs">{booking.venue_id}</span>
                }
              />
              <DetailRow
                label="Customer ID"
                value={
                  <span className="font-mono text-xs">{booking.user_id}</span>
                }
              />
              <DetailRow
                label="Owner ID"
                value={
                  <span className="font-mono text-xs">
                    {booking.venue_owner_id}
                  </span>
                }
              />
              <DetailRow
                label="Last updated"
                value={fmt(booking.updated_at)}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

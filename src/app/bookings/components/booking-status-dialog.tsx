"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUpdateBookingStatus } from "../hooks";
import type { Booking, BookingStatus } from "../types";

// Allowed transitions per status
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

const STATUS_META: Record<
  BookingStatus,
  { label: string; description: string }
> = {
  pending: {
    label: "Pending",
    description: "Awaiting venue owner confirmation",
  },
  confirmed: {
    label: "Confirmed",
    description: "Booking accepted by venue owner",
  },
  completed: {
    label: "Completed",
    description: "Booking period elapsed and fulfilled",
  },
  cancelled: {
    label: "Cancelled",
    description: "Booking was cancelled",
  },
  no_show: {
    label: "No-show",
    description: "Customer did not show up",
  },
};

interface BookingStatusDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingStatusDialog({
  booking,
  onClose,
}: BookingStatusDialogProps) {
  const [selected, setSelected] = useState<BookingStatus | null>(null);
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();

  const options = booking ? TRANSITIONS[booking.status] : [];

  const handleSave = () => {
    if (!booking || !selected) return;
    updateStatus({ id: booking.id, status: selected }, { onSuccess: onClose });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelected(null);
      onClose();
    }
  };

  return (
    <Dialog open={!!booking && options.length > 0} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogDescription>
            {booking
              ? `Current status: ${STATUS_META[booking.status].label}. Choose the new status.`
              : "Choose the new booking status."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selected ?? ""}
            onValueChange={(v) => setSelected(v as BookingStatus)}
            className="space-y-3"
          >
            {options.map((status) => (
              <div
                key={status}
                className="flex items-start space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelected(status)}
              >
                <RadioGroupItem
                  value={status}
                  id={status}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={status}
                    className="font-medium cursor-pointer capitalize"
                  >
                    {STATUS_META[status].label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {STATUS_META[status].description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !selected}
            className="cursor-pointer"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

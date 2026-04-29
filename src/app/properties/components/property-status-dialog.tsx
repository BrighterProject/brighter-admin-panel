"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
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
import { useMe } from "@/app/auth/api/hooks";
import { useStripeStatus } from "@/app/settings/payments/hooks";
import { isAdmin } from "@/lib/scopes";
import { useUpdatePropertyStatus } from "../hooks";
import type { PropertyListItem, PropertyStatus } from "../types";

const statusOptions: {
  value: PropertyStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "active",
    label: "Активен",
    description: "Обектът е достъпен за резервации",
  },
  {
    value: "inactive",
    label: "Неактивен",
    description: "Обектът е временно недостъпен",
  },
  {
    value: "maintenance",
    label: "В поддръжка",
    description: "Обектът е в процес на поддръжка",
  },
  {
    value: "pending_approval",
    label: "Чакащо одобрение",
    description: "Обектът очаква одобрение от администратор",
  },
];

interface PropertyStatusDialogProps {
  property: PropertyListItem | null;
  onClose: () => void;
}

export function PropertyStatusDialog({ property, onClose }: PropertyStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>("active");
  const { mutate: updateStatus, isPending } = useUpdatePropertyStatus();
  const { data: me } = useMe();
  const { data: stripeStatus } = useStripeStatus();

  const userIsAdmin = me ? isAdmin(me.scopes) : false;
  const paymentsRequired =
    selectedStatus === "pending_approval" &&
    !userIsAdmin &&
    !(stripeStatus?.connected && stripeStatus?.verified);

  useEffect(() => {
    if (property) {
      setSelectedStatus(property.status);
    }
  }, [property]);

  const handleSave = () => {
    if (!property) return;
    updateStatus(
      { id: property.id, status: selectedStatus },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Актуализиране на статус</DialogTitle>
          <DialogDescription>
            {property
              ? `Промяна на статуса за ${property.name}.`
              : "Промяна на статуса на обекта."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as PropertyStatus)}
            className="space-y-3"
          >
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-start space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedStatus(option.value)}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {paymentsRequired && (
            <p className="mt-3 text-sm text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="size-4 shrink-0" />
              За да изпратиш обекта за одобрение, трябва първо да свържеш Stripe акаунт.{" "}
              <Link to="/settings/payments" className="underline font-medium">
                Настройки за плащания
              </Link>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Отказ
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || selectedStatus === property?.status || paymentsRequired}
            className="cursor-pointer"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Актуализирай статус
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "../types";
import { useScopes, useUpdateScopes } from "../hooks";

interface ScopeEditorProps {
  user: User | null;
  onClose: () => void;
  onSave: (id: string, scopes: string[]) => void;
}

export function ScopeEditorDialog({ user, onClose }: ScopeEditorProps) {
  const { data: allScopes = [], isLoading } = useScopes(); // cached
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: updateScopes, isPending } = useUpdateScopes();

  useEffect(() => {
    setSelected(Array.isArray(user?.scopes) ? (user.scopes as string[]) : []);
  }, [user]);

  const toggle = (scope: string) => {
    setSelected((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleSave = () => {
    if (!user) return;
    updateScopes(
      { id: user.id, scopes: selected },
      {
        onSuccess: () => {
          toast.success("Правата са обновени успешно.");
          onClose();
        },
        onError: () => {
          toast.error("Грешка при обновяване на правата. Моля, опитайте отново.");
        },
      },
    );
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Управление на права</DialogTitle>
          <DialogDescription>
            {user ? `Задайте права за ${user.full_name ?? user.username}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4 justify-center">
              <Loader2 className="size-4 animate-spin" />
              Зареждане на права…
            </div>
          ) : allScopes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Няма налични права.
            </p>
          ) : (
            allScopes.map((scope) => (
              <label
                key={scope}
                className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={selected.includes(scope)}
                  onCheckedChange={() => toggle(scope)}
                />
                <span className="text-sm font-mono">{scope}</span>
              </label>
            ))
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
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Запази права
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

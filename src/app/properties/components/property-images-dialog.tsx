"use client";

import { useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Star,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  usePropertyImages,
  useAddPropertyImage,
  useUpdatePropertyImage,
  useDeletePropertyImage,
  useReorderPropertyImages,
} from "../hooks";
import type { PropertyListItem } from "../types";

interface PropertyImagesDialogProps {
  property: PropertyListItem | null;
  onClose: () => void;
}

export function PropertyImagesDialog({ property, onClose }: PropertyImagesDialogProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageThumbnail, setNewImageThumbnail] = useState(false);
  const { data: images = [], isLoading } = usePropertyImages(property?.id ?? null);
  const { mutate: addImage, isPending: isAdding } = useAddPropertyImage();
  const { mutate: updateImage, isPending: isUpdating } = useUpdatePropertyImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeletePropertyImage();
  const { mutate: reorderImages, isPending: isReordering } =
    useReorderPropertyImages();

  const handleAddImage = () => {
    if (!property || !newImageUrl.trim()) return;
    addImage(
      {
        propertyId: property.id,
        data: {
          url: newImageUrl.trim(),
          is_thumbnail: newImageThumbnail,
          order: images.length,
        },
      },
      {
        onSuccess: () => {
          setNewImageUrl("");
          setNewImageThumbnail(false);
        },
      },
    );
  };

  const handleSetThumbnail = (imageId: string, isThumbnail: boolean) => {
    if (!property) return;
    updateImage({
      propertyId: property.id,
      imageId,
      data: { is_thumbnail: isThumbnail },
    });
  };

  const handleDeleteImage = (imageId: string) => {
    if (!property) return;
    deleteImage({ propertyId: property.id, imageId });
  };

  const handleMoveUp = (index: number) => {
    if (!property || index === 0) return;
    const newOrder = [...images];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    reorderImages({
      propertyId: property.id,
      imageIds: newOrder.map((img) => img.id),
    });
  };

  const isPending = isAdding || isUpdating || isDeleting || isReordering;

  return (
    <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Управление на изображенията
          </DialogTitle>
          <DialogDescription>
            {property
              ? `Добавяне, подреждане и управление на изображения за ${property.name}.`
              : "Управление на изображения за обекта."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Добавяне на ново изображение */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-medium">Добави ново изображение</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddImage())
                  }
                />
                <Button
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim() || isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is-thumbnail"
                  checked={newImageThumbnail}
                  onCheckedChange={setNewImageThumbnail}
                />
                <Label
                  htmlFor="is-thumbnail"
                  className="text-sm cursor-pointer"
                >
                  Задай като заглавна снимка
                </Label>
              </div>
            </div>

            {/* Списък с изображения */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                Изображения ({images.length})
              </h4>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="size-12 mx-auto mb-3 opacity-50" />
                  <p>Все още няма изображения.</p>
                  <p className="text-sm">
                    Добавете първото изображение по-горе.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        image.is_thumbnail
                          ? "border-primary/30 bg-primary/5"
                          : "bg-background"
                      }`}
                    >
                      {/* Манипулатор за местене */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || isPending}
                          className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <GripVertical className="size-4 rotate-90" />
                        </button>
                      </div>

                      {/* Преглед на изображението */}
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={image.url}
                          alt={`Изображение ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>

                      {/* Информация за изображението */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Изображение {index + 1}
                          {image.is_thumbnail && (
                            <span className="ml-2 text-xs text-primary">
                              (Заглавна)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {image.url.length > 50
                            ? image.url.substring(0, 50) + "..."
                            : image.url}
                        </p>
                      </div>

                      {/* Действия */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            image.is_thumbnail
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                          onClick={() =>
                            handleSetThumbnail(image.id, !image.is_thumbnail)
                          }
                          disabled={isPending}
                          title={
                            image.is_thumbnail
                              ? "Премахни като заглавна"
                              : "Задай като заглавна"
                          }
                        >
                          <Star
                            className={`size-4 ${
                              image.is_thumbnail ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={isPending}
                          title="Изтрий изображението"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
  );
}

import { useRef, useState, useEffect } from 'react';
import { type UseFormReturn, useController } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, Loader2, Plus, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyFormSchema } from '../../property-form.schema';
import { useUploadPropertyImage } from '../../hooks';

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageItem {
  url: string;
  is_thumbnail: boolean;
  order: number;
}

function SortableImage({
  item,
  index,
  onRemove,
  onSetThumbnail,
}: {
  item: ImageItem;
  index: number;
  onRemove: () => void;
  onSetThumbnail: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.url,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-md border p-2',
        item.is_thumbnail && 'border-primary bg-primary/5',
      )}
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="size-4 text-muted-foreground" />
      </button>

      <img
        src={item.url}
        alt={`Property image ${index + 1}`}
        className="size-12 rounded object-cover shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
        }}
      />

      <span className="text-xs text-muted-foreground flex-1 truncate">{item.url}</span>

      <button
        type="button"
        onClick={onSetThumbnail}
        title="Задай като миниатюра"
        className={cn(
          'p-1 rounded',
          item.is_thumbnail
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Star className="size-4" fill={item.is_thumbnail ? 'currentColor' : 'none'} />
      </button>

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

interface PhotosSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
  propertyId?: string;
  onPendingFilesChange?: (files: File[]) => void;
}

export function PhotosSection({ form, propertyId, onPendingFilesChange }: PhotosSectionProps) {
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const pendingFilesRef = useRef(pendingFiles);
  pendingFilesRef.current = pendingFiles;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { field, fieldState } = useController({ control: form.control, name: 'images' });
  const uploadMutation = useUploadPropertyImage();

  useEffect(() => {
    return () => { pendingFilesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)); };
  }, []);

  const images: ImageItem[] = field.value ?? [];

  const sensors = useSensors(useSensor(PointerSensor));

  const addImage = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || images.some((img) => img.url === trimmed)) return;
    const hasThumbnail = images.some((img) => img.is_thumbnail);
    field.onChange([
      ...images,
      { url: trimmed, is_thumbnail: !hasThumbnail, order: images.length },
    ]);
    setUrlInput('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!propertyId) {
      const previewUrl = URL.createObjectURL(file);
      const id = crypto.randomUUID();
      const updated = [...pendingFiles, { id, file, previewUrl }];
      setPendingFiles(updated);
      onPendingFilesChange?.(updated.map((p) => p.file));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const uploaded = await uploadMutation.mutateAsync({ propertyId, file });
      const hasThumbnail = images.some((img) => img.is_thumbnail);
      field.onChange([
        ...images,
        { url: uploaded.url, is_thumbnail: !hasThumbnail, order: images.length },
      ]);
    } catch {
      setUploadError('Неуспешно качване. Проверете вида (JPEG/PNG/WebP) и размера (макс. 5 MB).');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      const updated = prev.filter((p) => p.id !== id);
      onPendingFilesChange?.(updated.map((p) => p.file));
      return updated;
    });
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index].is_thumbnail && updated.length > 0) {
      updated[0] = { ...updated[0], is_thumbnail: true };
    }
    field.onChange(updated.map((img, i) => ({ ...img, order: i })));
  };

  const setThumbnail = (index: number) => {
    field.onChange(
      images.map((img, i) => ({ ...img, is_thumbnail: i === index })),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    field.onChange(
      arrayMove(images, oldIndex, newIndex).map((img, i) => ({ ...img, order: i })),
    );
  };

  return (
    <section id="section-photos" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Снимки</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Качете снимки или добавете URL адреси. Плъзнете за пренареждане. Натиснете звездата за миниатюра.
          Необходима е поне една снимка.
        </p>
      </div>

      <FormItem>
        <FormLabel>Качи снимка</FormLabel>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            <span className="ml-2">
              {uploadMutation.isPending ? 'Качване…' : 'Избери файл'}
            </span>
          </Button>
        </div>
        {uploadError && (
          <p className="text-sm text-destructive mt-1">{uploadError}</p>
        )}
      </FormItem>

      {!propertyId && pendingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            Тези файлове ще бъдат качени след запазване на имота.
          </p>
          {pendingFiles.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border p-2">
              <img
                src={p.previewUrl}
                alt={p.file.name}
                className="size-12 rounded object-cover shrink-0"
              />
              <span className="text-xs text-muted-foreground flex-1 truncate">{p.file.name}</span>
              <Badge variant="secondary" className="text-xs shrink-0">Изчакващ</Badge>
              <Button type="button" variant="ghost" size="icon" onClick={() => removePendingFile(p.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <FormItem>
        <FormLabel>Добави URL на снимка</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/photo.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addImage(); }
            }}
          />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="size-4" />
          </Button>
        </div>
        {fieldState.error && (
          <FormMessage>{fieldState.error.message}</FormMessage>
        )}
      </FormItem>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.url)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {images.map((img, index) => (
                <SortableImage
                  key={img.url}
                  item={img}
                  index={index}
                  onRemove={() => removeImage(index)}
                  onSetThumbnail={() => setThumbnail(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

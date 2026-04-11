import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoomEntry, BedEntry, RoomType, BedType } from '../types';

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: 'Спалня',
  living_room: 'Хол',
  kitchen: 'Кухня',
  bathroom: 'Баня',
  studio: 'Студио',
};

const BED_TYPE_LABELS: Record<BedType, string> = {
  single: 'Единично',
  double: 'Двойно',
  queen: 'Queen',
  king: 'King',
  sofa_bed: 'Разтегателен диван',
  bunk: 'Двуетажно',
  crib: 'Бебешко легло',
};

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS) as RoomType[];
const BED_TYPES = Object.keys(BED_TYPE_LABELS) as BedType[];

interface RoomsBuilderProps {
  value: RoomEntry[];
  onChange: (value: RoomEntry[]) => void;
}

export function RoomsBuilder({ value, onChange }: RoomsBuilderProps) {
  const addRoom = () => {
    onChange([...value, { room_type: 'bedroom', count: 1, beds: [] }]);
  };

  const removeRoom = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, patch: Partial<RoomEntry>) => {
    onChange(value.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  };

  const addBed = (roomIndex: number) => {
    const room = value[roomIndex];
    updateRoom(roomIndex, {
      beds: [...room.beds, { bed_type: 'double', count: 1 }],
    });
  };

  const removeBed = (roomIndex: number, bedIndex: number) => {
    const room = value[roomIndex];
    updateRoom(roomIndex, {
      beds: room.beds.filter((_, i) => i !== bedIndex),
    });
  };

  const updateBed = (roomIndex: number, bedIndex: number, patch: Partial<BedEntry>) => {
    const room = value[roomIndex];
    updateRoom(roomIndex, {
      beds: room.beds.map((bed, i) => (i === bedIndex ? { ...bed, ...patch } : bed)),
    });
  };

  return (
    <div className="space-y-3">
      {value.map((room, roomIndex) => (
        <div key={roomIndex} className="rounded-md border p-3 space-y-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <select
              aria-hidden="true"
              className="sr-only"
              tabIndex={-1}
              value={room.room_type}
              onChange={(e) => updateRoom(roomIndex, { room_type: e.target.value as RoomType })}
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
            <Select
              value={room.room_type}
              onValueChange={(v) => updateRoom(roomIndex, { room_type: v as RoomType })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((rt) => (
                  <SelectItem key={rt} value={rt}>
                    {ROOM_TYPE_LABELS[rt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={1}
              value={room.count}
              onChange={(e) => updateRoom(roomIndex, { count: Number(e.target.value) })}
              className="w-20"
              aria-label="Room count"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove room"
              onClick={() => removeRoom(roomIndex)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-2 pl-2">
            {room.beds.map((bed, bedIndex) => (
              <div key={bedIndex} className="flex items-center gap-2">
                <Select
                  value={bed.bed_type}
                  onValueChange={(v) => updateBed(roomIndex, bedIndex, { bed_type: v as BedType })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BED_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {BED_TYPE_LABELS[bt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={1}
                  value={bed.count}
                  onChange={(e) =>
                    updateBed(roomIndex, bedIndex, { count: Number(e.target.value) })
                  }
                  className="w-20"
                  aria-label="Bed count"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove bed"
                  onClick={() => removeBed(roomIndex, bedIndex)}
                >
                  <Trash2 className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addBed(roomIndex)}
            >
              <Plus className="size-3 mr-1" />
              Add bed
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRoom}>
        <Plus className="size-4 mr-1" />
        Add Room
      </Button>
    </div>
  );
}

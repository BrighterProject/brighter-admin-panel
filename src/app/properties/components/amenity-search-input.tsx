import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { AmenityType } from '../types';
import { ALL_AMENITIES, AMENITY_LABELS } from '../types';

interface AmenitySearchInputProps {
  value: AmenityType[];
  onChange: (value: AmenityType[]) => void;
}

export function AmenitySearchInput({ value, onChange }: AmenitySearchInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const lowerQuery = query.toLowerCase();
  const filtered = ALL_AMENITIES.filter(
    (a) =>
      !value.includes(a) &&
      (AMENITY_LABELS[a].toLowerCase().includes(lowerQuery) ||
        a.toLowerCase().includes(lowerQuery)),
  );

  const add = (amenity: AmenityType) => {
    onChange([...value, amenity]);
    setQuery('');
    inputRef.current?.focus();
  };

  const remove = (amenity: AmenityType) => {
    onChange(value.filter((a) => a !== amenity));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-10 p-2 rounded-md border bg-background">
        {value.map((amenity) => (
          <Badge key={amenity} variant="secondary" className="gap-1 pr-1 h-6">
            {AMENITY_LABELS[amenity]}
            <button
              type="button"
              aria-label={`Remove ${AMENITY_LABELS[amenity]}`}
              onClick={() => remove(amenity)}
              className="rounded-sm hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Търси удобство…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />

        {open && filtered.length > 0 && (
          <ul
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto"
            role="listbox"
          >
            {filtered.map((amenity) => (
              <li
                key={amenity}
                role="option"
                aria-selected={false}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(amenity);
                }}
              >
                {AMENITY_LABELS[amenity]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { AMENITY_CATEGORIES, AMENITY_LABELS } from "../types";
import type { AmenityType } from "../types";

interface AmenityCheckboxGroupProps {
  value: AmenityType[];
  onChange: (value: AmenityType[]) => void;
}

/**
 * Grouped amenity picker (BTR-53): checkboxes laid out by the shared category
 * taxonomy. Selection order is not significant — toggling adds/removes a slug.
 */
export function AmenityCheckboxGroup({
  value,
  onChange,
}: AmenityCheckboxGroupProps) {
  const selected = new Set(value);

  const toggle = (amenity: AmenityType) => {
    const next = new Set(selected);
    if (next.has(amenity)) next.delete(amenity);
    else next.add(amenity);
    // Preserve taxonomy order for a stable, readable payload.
    onChange(
      AMENITY_CATEGORIES.flatMap((cat) => cat.amenities).filter((a) =>
        next.has(a),
      ),
    );
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {AMENITY_CATEGORIES.map((category) => (
        <fieldset key={category.key} className="space-y-2.5">
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {category.label}
          </legend>
          {category.amenities.map((amenity) => {
            const id = `amenity-${amenity}`;
            return (
              <label
                key={amenity}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <Checkbox
                  id={id}
                  checked={selected.has(amenity)}
                  onCheckedChange={() => toggle(amenity)}
                />
                <span>{AMENITY_LABELS[amenity]}</span>
              </label>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

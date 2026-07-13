import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AmenityCheckboxGroup } from "../components/amenity-checkbox-group";
import { AMENITY_CATEGORIES, AMENITY_LABELS } from "../types";

describe("AmenityCheckboxGroup", () => {
  it("renders every category legend and every amenity label", () => {
    render(<AmenityCheckboxGroup value={[]} onChange={vi.fn()} />);
    for (const category of AMENITY_CATEGORIES) {
      expect(screen.getByText(category.label)).toBeTruthy();
      for (const amenity of category.amenities) {
        expect(screen.getByText(AMENITY_LABELS[amenity])).toBeTruthy();
      }
    }
  });

  it("reflects the selected amenities as checked", () => {
    render(<AmenityCheckboxGroup value={["wifi"]} onChange={vi.fn()} />);
    const wifi = screen.getByLabelText(AMENITY_LABELS.wifi);
    expect(wifi.getAttribute("aria-checked")).toBe("true");
  });

  it("adds a slug on toggle, preserving taxonomy order", () => {
    const onChange = vi.fn();
    render(<AmenityCheckboxGroup value={["kitchen"]} onChange={onChange} />);
    // sea_view is the first slug in the taxonomy → must sort before kitchen.
    fireEvent.click(screen.getByText(AMENITY_LABELS.sea_view));
    expect(onChange).toHaveBeenCalledWith(["sea_view", "kitchen"]);
  });

  it("removes an already-selected slug on toggle", () => {
    const onChange = vi.fn();
    render(
      <AmenityCheckboxGroup value={["wifi", "pool"]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByText(AMENITY_LABELS.wifi));
    expect(onChange).toHaveBeenCalledWith(["pool"]);
  });
});

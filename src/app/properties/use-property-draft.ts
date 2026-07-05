import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PropertyFormSchema } from "./property-form.schema";

const DRAFT_PREFIX = "property-draft:";
const AUTOSAVE_DEBOUNCE_MS = 1500;

function draftStorageKey(draftKey: string): string {
  return `${DRAFT_PREFIX}${draftKey}`;
}

export function readPropertyDraft(
  draftKey: string,
): PropertyFormSchema | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(draftKey));
    return raw ? (JSON.parse(raw) as PropertyFormSchema) : null;
  } catch {
    return null;
  }
}

export function clearPropertyDraft(draftKey: string): void {
  localStorage.removeItem(draftStorageKey(draftKey));
}

/** Debounced autosave-to-localStorage + explicit save-draft support for the property form. */
export function usePropertyDraft(
  draftKey: string,
  form: UseFormReturn<PropertyFormSchema>,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraftNow = useCallback(() => {
    try {
      localStorage.setItem(
        draftStorageKey(draftKey),
        JSON.stringify(form.getValues()),
      );
    } catch {
      // localStorage unavailable (private browsing / quota) — draft save is best-effort
    }
  }, [draftKey, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(saveDraftNow, AUTOSAVE_DEBOUNCE_MS);
    });
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [form, saveDraftNow]);

  return { saveDraftNow };
}

import { cn } from '@/lib/utils';
import type { SectionStates, SectionState } from '../use-section-completion';

export const FORM_SECTIONS = [
  { id: 'section-basic-info',        label: 'Basic Info',          key: 'basicInfo' as const },
  { id: 'section-translations',      label: 'Translations',        key: 'translations' as const },
  { id: 'section-location',          label: 'Location',            key: 'location' as const },
  { id: 'section-rooms-capacity',    label: 'Rooms & Capacity',    key: 'roomsCapacity' as const },
  { id: 'section-pricing-policies',  label: 'Pricing & Policies',  key: 'pricingPolicies' as const },
  { id: 'section-amenities',         label: 'Amenities',           key: 'amenities' as const },
  { id: 'section-photos',            label: 'Photos',              key: 'photos' as const },
] as const;

interface PropertyFormNavProps {
  sectionStates: SectionStates;
  activeSection?: string;
}

function DotIndicator({ state }: { state: SectionState }) {
  return (
    <span
      className={cn('size-2 rounded-full shrink-0', {
        'bg-muted-foreground/30': state === 'untouched',
        'bg-amber-400': state === 'incomplete',
        'bg-green-500': state === 'complete',
      })}
    />
  );
}

export function PropertyFormNav({ sectionStates, activeSection }: PropertyFormNavProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Desktop: vertical sticky list
  // Mobile: horizontal scrollable pills (hidden on desktop via CSS)
  return (
    <>
      {/* Desktop sidebar nav */}
      <nav className="hidden lg:flex flex-col gap-1 sticky top-20" aria-label="Form sections">
        {FORM_SECTIONS.map(({ id, label, key }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors',
              'hover:bg-muted',
              activeSection === id
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground',
            )}
          >
            <DotIndicator state={sectionStates[key]} />
            {label}
          </button>
        ))}
      </nav>

      {/* Mobile pill row */}
      <div
        className="lg:hidden flex gap-2 overflow-x-auto pb-1 sticky top-14 z-10 bg-background pt-2"
        aria-label="Form sections"
      >
        {FORM_SECTIONS.map(({ id, label, key }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border shrink-0',
              'transition-colors',
              activeSection === id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            <DotIndicator state={sectionStates[key]} />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

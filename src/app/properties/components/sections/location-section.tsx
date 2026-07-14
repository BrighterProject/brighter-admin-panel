import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { type UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

import { useRegions, useSettlements, useSettlementCenter } from '../../hooks';
import type { PropertyFormSchema } from '../../property-form.schema';
import { LocationPicker } from './location-picker';

interface LocationSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function LocationSection({ form }: LocationSectionProps) {
  const [regionOpen, setRegionOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  // Set only on an explicit settlement pick so editing an existing property
  // never overrides its saved coordinates with the settlement center.
  const [pendingEkatte, setPendingEkatte] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const regionCode = form.watch('region_code');
  const settlementEkatte = form.watch('settlement_ekatte');
  const latValue = form.watch('lat');
  const lngValue = form.watch('lng');

  const { data: settlementCenter } = useSettlementCenter(pendingEkatte);

  useEffect(() => {
    if (settlementCenter?.lat != null && settlementCenter.lon != null) {
      setMapCenter({ lat: settlementCenter.lat, lng: settlementCenter.lon });
    }
    if (settlementCenter) setPendingEkatte(null);
  }, [settlementCenter]);

  const parseCoord = (v: string | undefined): number | null => {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handlePinMove = (lat: number, lng: number) => {
    form.setValue('lat', String(lat), { shouldDirty: true });
    form.setValue('lng', String(lng), { shouldDirty: true });
  };

  const { data: regions = [], isLoading: regionsLoading } = useRegions('bg');
  const { data: settlements = [], isLoading: settlementsLoading } = useSettlements(
    regionCode || null,
    'bg',
  );

  const selectedRegion = regions.find((r) => r.code === regionCode);
  const selectedSettlement = settlements.find((s) => s.ekatte === settlementEkatte);

  return (
    <section id="section-location" className="space-y-4 scroll-mt-20">
      <div>
        <h3 className="text-base font-semibold">Местоположение</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Регион, населено място и незадължителни координати.
        </p>
      </div>

      {/* Region (oblast) */}
      <FormField
        control={form.control}
        name="region_code"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Регион (Област) *</FormLabel>
            <Popover open={regionOpen} onOpenChange={setRegionOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn('justify-between font-normal', !field.value && 'text-muted-foreground')}
                    disabled={regionsLoading}
                  >
                    {selectedRegion?.name ?? 'Изберете регион…'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Търсене на регион…" />
                  <CommandList>
                    <CommandEmpty>Няма намерен регион.</CommandEmpty>
                    <CommandGroup>
                      {regions.map((r) => (
                        <CommandItem
                          key={r.code}
                          value={r.name}
                          onSelect={() => {
                            field.onChange(r.code);
                            form.setValue('settlement_ekatte', '');
                            setRegionOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === r.code ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {r.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Settlement */}
      <FormField
        control={form.control}
        name="settlement_ekatte"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Населено място *</FormLabel>
            <Popover open={settlementOpen} onOpenChange={setSettlementOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn('justify-between font-normal', !field.value && 'text-muted-foreground')}
                    disabled={!regionCode || settlementsLoading}
                  >
                    {selectedSettlement
                      ? `${selectedSettlement.tvm ? `${selectedSettlement.tvm} ` : ''}${selectedSettlement.name}`
                      : regionCode
                        ? 'Изберете населено място…'
                        : 'Изберете регион първо'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Търсене на населено място…" />
                  <CommandList>
                    <CommandEmpty>Няма намерено населено място.</CommandEmpty>
                    <CommandGroup>
                      {settlements.map((s) => (
                        <CommandItem
                          key={s.ekatte}
                          value={`${s.tvm ? `${s.tvm} ` : ''}${s.name}`}
                          onSelect={() => {
                            field.onChange(s.ekatte);
                            setPendingEkatte(s.ekatte);
                            setSettlementOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === s.ekatte ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {s.tvm ? `${s.tvm} ` : ''}{s.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="translations.bg.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Адрес (Български)</FormLabel>
            <FormControl>
              <Input placeholder="ул. Витоша 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Местоположение на картата</FormLabel>
        <LocationPicker
          lat={parseCoord(latValue)}
          lng={parseCoord(lngValue)}
          center={mapCenter}
          onChange={handlePinMove}
        />
        <p className="text-xs text-muted-foreground">
          Изберете населено място, след което плъзнете маркера до точното място на
          обекта.
        </p>
      </div>

      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Въведете координати ръчно
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ширина (незадължително)</FormLabel>
                <FormControl>
                  <Input placeholder="42.6977" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дължина (незадължително)</FormLabel>
                <FormControl>
                  <Input placeholder="23.3219" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </details>

      <FormField
        control={form.control}
        name="has_parking"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="m-0 cursor-pointer">Налично паркиране</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}

import { useState } from 'react';
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

import { useRegions, useSettlements } from '../../hooks';
import type { PropertyFormSchema } from '../../property-form.schema';

interface LocationSectionProps {
  form: UseFormReturn<PropertyFormSchema>;
}

export function LocationSection({ form }: LocationSectionProps) {
  const [regionOpen, setRegionOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);

  const regionCode = form.watch('region_code');
  const settlementEkatte = form.watch('settlement_ekatte');

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
        <h3 className="text-base font-semibold">Location</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Region, settlement and optional map coordinates.
        </p>
      </div>

      {/* Region (oblast) */}
      <FormField
        control={form.control}
        name="region_code"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Region (Oblast) *</FormLabel>
            <Popover open={regionOpen} onOpenChange={setRegionOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn('justify-between font-normal', !field.value && 'text-muted-foreground')}
                    disabled={regionsLoading}
                  >
                    {selectedRegion?.name ?? 'Select region…'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Search region…" />
                  <CommandList>
                    <CommandEmpty>No region found.</CommandEmpty>
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
            <FormLabel>Settlement *</FormLabel>
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
                      ? `${selectedSettlement.tvm} ${selectedSettlement.name}`
                      : regionCode
                        ? 'Select settlement…'
                        : 'Select a region first'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                  <CommandInput placeholder="Search settlement…" />
                  <CommandList>
                    <CommandEmpty>No settlement found.</CommandEmpty>
                    <CommandGroup>
                      {settlements.map((s) => (
                        <CommandItem
                          key={s.ekatte}
                          value={`${s.tvm} ${s.name}`}
                          onSelect={() => {
                            field.onChange(s.ekatte);
                            setSettlementOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === s.ekatte ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {s.tvm} {s.name}
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
            <FormLabel>Address (Bulgarian) *</FormLabel>
            <FormControl>
              <Input placeholder="ул. Витоша 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="lat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude (optional)</FormLabel>
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
              <FormLabel>Longitude (optional)</FormLabel>
              <FormControl>
                <Input placeholder="23.3219" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Used to show your property on the map.
      </p>

      <FormField
        control={form.control}
        name="has_parking"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="m-0 cursor-pointer">Parking available</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}

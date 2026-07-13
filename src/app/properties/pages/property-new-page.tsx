import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BaseLayout } from '@/components/layouts/base-layout';
import { PropertyForm } from '../components/property-form';
import { useAddProperty } from '../hooks';
import { clearPropertyDraft } from '../use-property-draft';
import { api } from '@/lib/api';
import { DEV_PROPERTY_DEFAULTS, type PropertyFormSchema } from '../property-form.schema';
import type { PendingPriceRange } from '../components/sections/dynamic-pricing-section';

export default function PropertyNewPage() {
  const navigate = useNavigate();
  const { mutateAsync: addProperty, isPending } = useAddProperty();
  const pendingFilesRef = useRef<File[]>([]);
  const pendingPricesRef = useRef<PendingPriceRange[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PropertyFormSchema) => {
    setIsSubmitting(true);
    try {
      const property = await addProperty(data);

      const files = pendingFilesRef.current;
      const priceRanges = pendingPricesRef.current;

      await Promise.all([
        ...files.map((file) => {
          const form = new FormData();
          form.append('file', file);
          return api.post(`/properties/${property.id}/images/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }),
        ...priceRanges.map((r) =>
          api.put(`/properties/${property.id}/pricing/dates`, r),
        ),
      ]);

      clearPropertyDraft('new');
      toast.success('Обект сохранен. Чакащ одобрението на администратор.');
      navigate('/properties');
    } catch {
      toast.error('Неудачно записване на обект. Моля, опитайте отново.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseLayout
      title="Добавяне на обект"
      description="Попълнете подробностите за вашото ново обявление на обект."
    >
      <PropertyForm
        onSubmit={handleSubmit}
        isPending={isPending || isSubmitting}
        initialValues={import.meta.env.DEV ? DEV_PROPERTY_DEFAULTS : undefined}
        onPendingFilesChange={(files) => { pendingFilesRef.current = files; }}
        onPendingPricesChange={(ranges) => { pendingPricesRef.current = ranges; }}
      />
    </BaseLayout>
  );
}

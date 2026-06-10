import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BaseLayout } from '@/components/layouts/base-layout';
import { PropertyForm } from '../components/property-form';
import { useAddProperty } from '../hooks';
import { api } from '@/lib/api';
import { DEV_PROPERTY_DEFAULTS, type PropertyFormSchema } from '../property-form.schema';

interface PendingOverride {
  start_date: string;
  end_date: string;
  price: string;
}

export default function PropertyNewPage() {
  const navigate = useNavigate();
  const { mutateAsync: addProperty, isPending } = useAddProperty();
  const pendingFilesRef = useRef<File[]>([]);
  const pendingOverridesRef = useRef<PendingOverride[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PropertyFormSchema) => {
    setIsSubmitting(true);
    try {
      const property = await addProperty(data);

      const files = pendingFilesRef.current;
      const overrides = pendingOverridesRef.current;

      await Promise.all([
        ...files.map((file) => {
          const form = new FormData();
          form.append('file', file);
          return api.post(`/properties/${property.id}/images/upload`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }),
        ...overrides.map((o) =>
          api.post(`/properties/${property.id}/pricing/overrides`, o),
        ),
      ]);

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
        onPendingOverridesChange={(overrides) => { pendingOverridesRef.current = overrides; }}
      />
    </BaseLayout>
  );
}

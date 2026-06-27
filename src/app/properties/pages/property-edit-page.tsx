import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { BaseLayout } from '@/components/layouts/base-layout';
import { PropertyForm, propertyToFormValues } from '../components/property-form';
import { useProperty, useUpdateProperty } from '../hooks';
import type { PropertyFormSchema } from '../property-form.schema';

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id ?? null);
  const { mutate: updateProperty, isPending } = useUpdateProperty();

  const handleSubmit = (data: PropertyFormSchema) => {
    if (!id) return;
    updateProperty(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Обект обновен. Чакащ одобрението на администратор.');
          navigate('/properties');
        },
        onError: () => {
          toast.error('Неудачно обновление на обект. Моля, опитайте отново.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <BaseLayout title="Редактиране на обект" description="">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </BaseLayout>
    );
  }

  if (!property) {
    return (
      <BaseLayout title="Редактиране на обект" description="">
        <p className="text-center text-muted-foreground py-20">Обектът не е намерен.</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Редактиране на обект"
      description={`Редактиране: ${property.translations.find((t) => t.locale === 'bg')?.name ?? property.id}`}
    >
      <PropertyForm
        initialValues={propertyToFormValues(property)}
        onSubmit={handleSubmit}
        isPending={isPending}
        propertyId={id}
        dateOverrides={property.date_price_overrides}
      />
    </BaseLayout>
  );
}

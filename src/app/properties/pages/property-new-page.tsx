import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BaseLayout } from '@/components/layouts/base-layout';
import { PropertyForm } from '../components/property-form';
import { useAddProperty } from '../hooks';
import type { PropertyFormSchema } from '../property-form.schema';

export default function PropertyNewPage() {
  const navigate = useNavigate();
  const { mutate: addProperty, isPending } = useAddProperty();

  const handleSubmit = (data: PropertyFormSchema) => {
    addProperty(data, {
      onSuccess: () => {
        toast.success('Обект сохранен. Чакащ одобрението на администратор.');
        navigate('/properties');
      },
      onError: () => {
        toast.error('Неудачно записване на обект. Моля, опитайте отново.');
      },
    });
  };

  return (
    <BaseLayout
      title="Добавяне на обект"
      description="Попълнете подробностите за вашото ново обявление на обект."
    >
      <PropertyForm onSubmit={handleSubmit} isPending={isPending} />
    </BaseLayout>
  );
}

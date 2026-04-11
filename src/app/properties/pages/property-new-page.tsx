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
        toast.success('Property saved. Pending admin approval.');
        navigate('/properties');
      },
      onError: () => {
        toast.error('Failed to save property. Please try again.');
      },
    });
  };

  return (
    <BaseLayout
      title="Add Property"
      description="Fill in the details for your new property listing."
    >
      <PropertyForm onSubmit={handleSubmit} isPending={isPending} />
    </BaseLayout>
  );
}

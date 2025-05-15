
import React from 'react';
import { Form } from '@/components/ui/form';
import { CardContent } from '@/components/ui/card';
import ProfileFormField from './ProfileFormField';
import ProfileSubmitButton from './ProfileSubmitButton';
import { useProfileForm } from '@/hooks/useProfileForm';
import { formatPhoneNumber } from '@/utils/formatUtils';

interface ProfileSetupFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: {
    nome_oficina?: string;
    telefone?: string;
  };
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ 
  userId, 
  onSaveSuccess,
  initialValues = { nome_oficina: '', telefone: '' }
}) => {
  const { form, isLoading, saveSuccess, onSubmit } = useProfileForm({
    userId,
    onSaveSuccess,
    initialValues
  });
  
  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ProfileFormField 
            form={form}
            name="nome_oficina"
            label="Nome da Oficina"
            placeholder="Auto Center São Paulo"
            disabled={isLoading}
            isSuccess={saveSuccess}
          />
          
          <ProfileFormField 
            form={form}
            name="telefone"
            label="Telefone"
            placeholder="(11) 99999-9999"
            disabled={isLoading}
            isSuccess={saveSuccess}
            formatValue={formatPhoneNumber}
          />
          
          <ProfileSubmitButton 
            isLoading={isLoading} 
            saveSuccess={saveSuccess} 
          />
        </form>
      </Form>
    </CardContent>
  );
};

export default ProfileSetupForm;

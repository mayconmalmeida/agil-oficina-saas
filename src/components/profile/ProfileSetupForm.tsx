
import React from 'react';
import { Form } from '@/components/ui/form';
import { CardContent } from '@/components/ui/card';
import ProfileSubmitButton from './ProfileSubmitButton';
import { useProfileForm } from '@/hooks/useProfileForm';
import BasicInfoSection from './form-sections/BasicInfoSection';
import AddressSection from './form-sections/AddressSection';
import LogoUploadSection from './form-sections/LogoUploadSection';
import { Separator } from '@/components/ui/separator';

interface ProfileSetupFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: any;
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ 
  userId, 
  onSaveSuccess,
  initialValues = {}
}) => {
  const { form, isLoading, saveSuccess, onSubmit } = useProfileForm({
    userId,
    onSaveSuccess,
    initialValues
  });
  
  return (
    <CardContent className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Complete seu Perfil</h2>
        <p className="text-gray-600 text-sm">
          Preencha as informações da sua oficina para começar a usar o sistema
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoSection 
            form={form} 
            isLoading={isLoading} 
            isSuccess={saveSuccess} 
          />
          
          <Separator />
          
          <AddressSection 
            form={form} 
            isLoading={isLoading} 
            isSuccess={saveSuccess} 
          />
          
          <Separator />
          
          <LogoUploadSection 
            form={form} 
            isLoading={isLoading} 
            isSuccess={saveSuccess} 
          />
          
          <Separator />
          
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

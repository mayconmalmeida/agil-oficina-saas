
import React from 'react';
import { Form } from '@/components/ui/form';
import { useCompanyProfileForm } from '@/hooks/useCompanyProfileForm';
import BasicInfoSection from './form-sections/BasicInfoSection';
import AddressSection from './form-sections/AddressSection';
import NotesSection from './form-sections/NotesSection';
import FormSubmitButton from './FormSubmitButton';

interface CompanyProfileFormProps {
  initialData: any;
  onSave: () => void;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ initialData, onSave }) => {
  const { form, isLoading, onSubmit } = useCompanyProfileForm({
    initialData,
    onSave,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <AddressSection form={form} />
        <NotesSection form={form} />
        <FormSubmitButton isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default CompanyProfileForm;

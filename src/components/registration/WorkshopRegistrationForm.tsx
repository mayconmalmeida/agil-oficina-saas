import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { 
  workshopRegistrationSchema, 
  WorkshopRegistrationFormValues,
  formatDocument
} from './workshopRegistrationSchema';

// Import refactored components
import PlanInfoBanner from './PlanInfoBanner';
import DocumentSection from './DocumentSection';
import ContactSection from './ContactSection';
import AddressSection from './AddressSection';
import LogoSection from './LogoSection';
import PasswordSection from './PasswordSection';
import SubmitButton from './SubmitButton';
import { useWorkshopRegistration } from './useWorkshopRegistration';

const WorkshopRegistrationForm: React.FC<{ selectedPlan?: string }> = ({ selectedPlan = 'Essencial' }) => {
  const form = useForm<WorkshopRegistrationFormValues>({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      documentType: 'CNPJ',
      documentNumber: '',
      businessName: '',
      tradingName: '',
      stateRegistration: '',
      responsiblePerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      addressComplement: '',
      password: '',
      confirmPassword: '',
    }
  });

  const documentType = form.watch('documentType');

  // NOVO HOOK RESPONSÁVEL PELA LÓGICA DE SUBMISSÃO
  const { isLoading, handleSubmit } = useWorkshopRegistration();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => handleSubmit(data, selectedPlan))} className="space-y-6">
        <PlanInfoBanner plan={selectedPlan} trialDays={7} />
        <DocumentSection 
          form={form} 
          documentType={documentType as 'CPF' | 'CNPJ'} 
          isLoading={isLoading}
          formatDocument={formatDocument}
        />
        <Separator />
        <ContactSection form={form} isLoading={isLoading} />
        <Separator />
        <AddressSection form={form} isLoading={isLoading} />
        <Separator />
        <LogoSection form={form} />
        <Separator />
        <PasswordSection form={form} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default WorkshopRegistrationForm;

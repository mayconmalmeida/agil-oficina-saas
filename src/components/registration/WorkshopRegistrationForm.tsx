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
  // Novo estado para guardar o id do perfil provisório
  const [profileId, setProfileId] = useState<string | null>(null);

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
  // Adicionando watchers para submissão parcial a cada etapa
  const contactValues = form.watch(['responsiblePerson', 'email', 'phone']);
  const addressValues = form.watch(['address', 'city', 'state', 'zipCode', 'addressComplement']);
  const logoValue = form.watch('logo');

  // NOVO HOOK RESPONSÁVEL PELA LÓGICA DE SUBMISSÃO
  const { 
    isLoading, 
    handleSubmit, 
    createOrUpdatePartialProfile 
  } = useWorkshopRegistration();

  // Criação parcial assim que preencher os dados fiscais/documento
  const onPartialStep = async (stepData: Partial<WorkshopRegistrationFormValues>, patchType: "initial" | "contact" | "address" | "logo") => {
    const result = await createOrUpdatePartialProfile(stepData, profileId, patchType);
    if (!profileId && result?.id) setProfileId(result.id);
  };

  // Efeito que salva dados parciais após etapa inicial (ex: terminou documento/nome)
  React.useEffect(() => {
    // Envie perfil inicial APENAS quando (a) não há profileId ainda (b) dados mínimos pre-preenchidos
    if (
      !profileId && 
      form.getValues('businessName') && 
      form.getValues('documentNumber')
    ) {
      onPartialStep({
        businessName: form.getValues('businessName'),
        documentType: form.getValues('documentType'),
        documentNumber: form.getValues('documentNumber'),
        tradingName: form.getValues('tradingName'),
        stateRegistration: form.getValues('stateRegistration')
      }, "initial");
    }
  // eslint-disable-next-line
  }, [form.getValues('businessName'), form.getValues('documentNumber')]);

  // Efeito para etapas seguintes: contato
  React.useEffect(() => {
    if (profileId) {
      if (contactValues[0] || contactValues[1] || contactValues[2]) {
        onPartialStep({
          responsiblePerson: contactValues[0],
          email: contactValues[1],
          phone: contactValues[2]
        }, "contact");
      }
    }
    // eslint-disable-next-line
  }, [profileId, ...contactValues]);

  // Efeito: endereço
  React.useEffect(() => {
    if (profileId) {
      if (addressValues.some((v) => !!v)) {
        onPartialStep({
          address: addressValues[0],
          city: addressValues[1],
          state: addressValues[2],
          zipCode: addressValues[3],
          addressComplement: addressValues[4],
        }, "address");
      }
    }
    // eslint-disable-next-line
  }, [profileId, ...addressValues]);

  // Efeito: logo
  React.useEffect(() => {
    if (profileId && logoValue instanceof File) {
      onPartialStep({
        logo: logoValue
      }, "logo");
    }
    // eslint-disable-next-line
  }, [profileId, logoValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => handleSubmit(data, selectedPlan, profileId))} className="space-y-6">
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


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FormSection from './FormSection';
import { UseFormReturn } from 'react-hook-form';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

interface ContactSectionProps {
  form: UseFormReturn<WorkshopRegistrationFormValues>;
  isLoading: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ form, isLoading }) => {
  return (
    <FormSection title="Dados de Contato">
      <FormField
        control={form.control}
        name="responsiblePerson"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Responsável pela oficina</FormLabel>
            <FormControl>
              <Input
                placeholder="Nome completo do responsável"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="contato@oficina.com.br"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone/WhatsApp</FormLabel>
            <FormControl>
              <Input
                placeholder="(11) 99999-9999"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default ContactSection;

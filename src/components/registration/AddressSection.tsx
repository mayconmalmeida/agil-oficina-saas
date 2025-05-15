
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FormSection from './FormSection';
import { UseFormReturn } from 'react-hook-form';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

interface AddressSectionProps {
  form: UseFormReturn<WorkshopRegistrationFormValues>;
  isLoading: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({ form, isLoading }) => {
  return (
    <FormSection title="Endereço">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Endereço completo</FormLabel>
            <FormControl>
              <Input
                placeholder="Rua, número, bairro"
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
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input
                placeholder="São Paulo"
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
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <FormControl>
              <Input
                placeholder="SP"
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
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <Input
                placeholder="00000-000"
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
        name="addressComplement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento (opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Bloco, sala, etc."
                {...field}
                value={field.value || ''}
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

export default AddressSection;

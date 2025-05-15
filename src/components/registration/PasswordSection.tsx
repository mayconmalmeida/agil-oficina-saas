
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import FormSection from './FormSection';
import { UseFormReturn } from 'react-hook-form';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

interface PasswordSectionProps {
  form: UseFormReturn<WorkshopRegistrationFormValues>;
  isLoading: boolean;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ form, isLoading }) => {
  return (
    <FormSection title="Acesso">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="********"
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
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar senha</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="********"
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

export default PasswordSection;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import LogoUpload from './LogoUpload';
import { UseFormReturn } from 'react-hook-form';
import { WorkshopRegistrationFormValues } from './workshopRegistrationSchema';

interface LogoSectionProps {
  form: UseFormReturn<WorkshopRegistrationFormValues>;
}

const LogoSection: React.FC<LogoSectionProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Logo</h3>
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem da Oficina</FormLabel>
            <FormControl>
              <LogoUpload
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.logo?.message as string}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LogoSection;

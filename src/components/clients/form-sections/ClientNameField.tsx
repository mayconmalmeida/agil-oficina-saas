
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ClientNameFieldProps {
  form: UseFormReturn<any>;
  saveSuccess?: boolean;
}

const ClientNameField: React.FC<ClientNameFieldProps> = ({ form, saveSuccess = false }) => {
  const tipoValue = form.watch('tipo');

  return (
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tipoValue === 'pj' ? "Razão Social" : "Nome Completo"}</FormLabel>
          <FormControl>
            <Input 
              placeholder={tipoValue === 'pj' ? "Razão Social da Empresa" : "Nome Completo do Cliente"} 
              {...field} 
              disabled={saveSuccess}
              className={saveSuccess ? "bg-green-50 border-green-200" : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientNameField;

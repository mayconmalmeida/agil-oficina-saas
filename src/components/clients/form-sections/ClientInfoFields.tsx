
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ClientInfoFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientInfoFields: React.FC<ClientInfoFieldsProps> = ({ 
  form, 
  saveSuccess
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input 
                placeholder="João da Silva" 
                {...field}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input 
                placeholder="(11) 99999-9999" 
                {...field}
                // Removido handlePhoneFormat, passa padrão do react-hook-form
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
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
            <FormLabel>Email (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="cliente@exemplo.com" 
                type="email"
                {...field}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ClientInfoFields;


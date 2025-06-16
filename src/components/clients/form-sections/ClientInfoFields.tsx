
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { formatPhone } from '@/utils/supabaseTypes';

interface ClientInfoFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientInfoFields: React.FC<ClientInfoFieldsProps> = ({ form, saveSuccess }) => {
  const telefone = form.watch('telefone');

  // Format phone number as user types
  useEffect(() => {
    if (telefone) {
      const formattedPhone = formatPhone(telefone);
      if (formattedPhone !== telefone) {
        form.setValue('telefone', formattedPhone);
      }
    }
  }, [telefone, form]);

  return (
    <div className="space-y-4">
      {/* Nome Field */}
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Cliente *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome completo do cliente" 
                {...field} 
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Telefone Field */}
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input 
                placeholder="(11) 99999-9999" 
                {...field}
                maxLength={15}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Email Field */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                type="email"
                placeholder="email@exemplo.com" 
                {...field} 
                value={field.value || ''}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ClientInfoFields;

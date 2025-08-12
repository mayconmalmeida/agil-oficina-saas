
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';

interface ClientFieldProps {
  form: UseFormReturn<BudgetFormValues>;
  onClientChange?: (clientId: string, clientName: string) => void;
}

const ClientField: React.FC<ClientFieldProps> = ({ form, onClientChange }) => {
  return (
    <FormField
      control={form.control}
      name="cliente"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cliente</FormLabel>
          <FormControl>
            <Input 
              placeholder="Nome do cliente" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientField;

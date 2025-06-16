
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from '../profileSchema';

interface AddressSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({ form, isLoading, isSuccess }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Endereço</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Endereço completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Rua das Flores, 123, Centro" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                  className={isSuccess ? 'border-green-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input 
                  placeholder="São Paulo" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                  className={isSuccess ? 'border-green-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input 
                  placeholder="SP" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                  className={isSuccess ? 'border-green-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input 
                  placeholder="01234-567" 
                  {...field} 
                  value={field.value || ''}
                  disabled={isLoading}
                  className={isSuccess ? 'border-green-500' : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressSection;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from '../profileSchema';

interface BasicInfoSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, isLoading, isSuccess }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nome_oficina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Oficina *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Auto Center São Paulo" 
                  {...field} 
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
          name="responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input 
                  placeholder="João Silva" 
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
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(11) 99999-9999" 
                  {...field} 
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="contato@suaoficina.com.br" 
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
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input 
                  placeholder="00.000.000/0000-00" 
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
          name="whatsapp_suporte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Suporte</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(11) 99999-9999" 
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

export default BasicInfoSection;

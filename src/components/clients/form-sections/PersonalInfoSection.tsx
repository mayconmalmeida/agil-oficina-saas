
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '../EnhancedClientForm';
import { formatPhoneNumber } from '@/utils/formatUtils';
import { formatCPF } from '@/utils/validationUtils';

interface PersonalInfoSectionProps {
  form: UseFormReturn<ClientFormValues>;
  saveSuccess: boolean;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ form, saveSuccess }) => {
  const { watch, setValue } = form;
  const phoneValue = watch('telefone');
  const tipoValue = watch('tipo');
  const documentValue = watch('documento');
  
  // Format phone number
  useEffect(() => {
    if (phoneValue) {
      const formattedPhone = formatPhoneNumber(phoneValue);
      if (formattedPhone !== phoneValue) {
        setValue('telefone', formattedPhone);
      }
    }
  }, [phoneValue, setValue]);
  
  // Format CPF
  useEffect(() => {
    if (documentValue && tipoValue === 'pf') {
      const formattedCPF = formatCPF(documentValue);
      if (formattedCPF !== documentValue) {
        setValue('documento', formattedCPF);
      }
    }
  }, [documentValue, tipoValue, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="pf"
                    value="pf"
                    checked={field.value === 'pf'}
                    onChange={() => field.onChange('pf')}
                    className="mr-2"
                  />
                  <label htmlFor="pf">Pessoa Física</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="pj"
                    value="pj"
                    checked={field.value === 'pj'}
                    onChange={() => field.onChange('pj')}
                    className="mr-2"
                  />
                  <label htmlFor="pj">Pessoa Jurídica</label>
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input 
                  placeholder={tipoValue === 'pj' ? "Razão Social" : "Nome Completo"} 
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
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tipoValue === 'pj' ? "CNPJ" : "CPF"}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={tipoValue === 'pj' ? "00.000.000/0000-00" : "000.000.000-00"} 
                  {...field}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  inputMode={tipoValue === 'pf' ? "numeric" : "text"}
                  onKeyDown={(e) => {
                    // Allow only digits, backspace, tab, delete, and arrow keys
                    if (
                      tipoValue === 'pf' && 
                      !/^\d$/.test(e.key) && 
                      !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    // Allow only digits, backspace, tab, delete, and arrow keys
                    if (
                      !/^\d$/.test(e.key) && 
                      !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
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
      </div>
    </div>
  );
};

export default PersonalInfoSection;

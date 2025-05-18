
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '../EnhancedClientForm';
import { fetchAddressByCEP, formatCEP } from '@/utils/validationUtils';

interface AddressSectionProps {
  form: UseFormReturn<ClientFormValues>;
  saveSuccess: boolean;
}

const AddressSection: React.FC<AddressSectionProps> = ({ form, saveSuccess }) => {
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const { watch, setValue } = form;
  const cepValue = watch('cep');
  
  // Format CEP
  useEffect(() => {
    if (cepValue) {
      const formattedCEP = formatCEP(cepValue);
      if (formattedCEP !== cepValue) {
        setValue('cep', formattedCEP);
      }
    }
  }, [cepValue, setValue]);
  
  // Handle CEP lookup
  const handleCepLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsLoadingAddress(true);
    
    try {
      const addressData = await fetchAddressByCEP(cep);
      
      if (addressData) {
        setValue('endereco', addressData.logradouro);
        setValue('bairro', addressData.bairro);
        setValue('cidade', addressData.localidade);
        setValue('estado', addressData.uf);
        
        // Focus the number field after filling address
        setTimeout(() => {
          document.getElementById('endereco-numero')?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-md font-medium mb-4">Endereço</h3>
      
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <Input 
                placeholder="00000-000" 
                {...field}
                disabled={saveSuccess || isLoadingAddress}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                inputMode="numeric"
                onBlur={handleCepLookup}
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
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Rua, Avenida..." 
                    {...field}
                    disabled={saveSuccess || isLoadingAddress}
                    className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                    readOnly={isLoadingAddress}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input 
                  id="endereco-numero"
                  placeholder="123" 
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
      
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  disabled={saveSuccess || isLoadingAddress}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  readOnly={isLoadingAddress}
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
                  {...field}
                  disabled={saveSuccess || isLoadingAddress}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  readOnly={isLoadingAddress}
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
                  {...field}
                  disabled={saveSuccess || isLoadingAddress}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  readOnly={isLoadingAddress}
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

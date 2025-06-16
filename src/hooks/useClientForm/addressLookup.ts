
import { UseFormReturn } from 'react-hook-form';
import { useCallback } from 'react';
import { ClientFormValues } from './validation';
import { fetchAddressByCEP } from '@/utils/validationUtils';

export const useAddressLookup = (form: UseFormReturn<ClientFormValues>, cep: string) => {
  const fetchAddressData = useCallback(async () => {
    if (cep && cep.length === 9) { // Format XXXXX-XXX
      try {
        const addressData = await fetchAddressByCEP(cep);
        
        if (addressData) {
          form.setValue('endereco', addressData.logradouro);
          form.setValue('bairro', addressData.bairro);
          form.setValue('cidade', addressData.localidade);
          form.setValue('estado', addressData.uf);
          
          // Clear validation errors for these fields
          form.clearErrors(['endereco', 'bairro', 'cidade', 'estado']);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    }
  }, [cep, form]);

  return { fetchAddressData };
};


import React, { useCallback } from 'react';
import { fetchAddressByCEP } from '@/utils/validationUtils';

export const useAddressLookup = (form: any, cep: string) => {
  const fetchAddressData = useCallback(async () => {
    if (!cep || cep.length !== 9) return;
    
    try {
      const addressData = await fetchAddressByCEP(cep);
      
      if (addressData) {
        form.setValue('endereco', addressData.logradouro);
        form.setValue('bairro', addressData.bairro);
        form.setValue('cidade', addressData.localidade);
        form.setValue('estado', addressData.uf);
        
        form.clearErrors(['endereco', 'bairro', 'cidade', 'estado']);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  }, [cep, form]);

  return {
    fetchAddressData
  };
};


import { UseFormReturn } from 'react-hook-form';
import { fetchAddressByCEP } from '@/utils/validationUtils';
import { ClientFormValues } from './validation';

export const useAddressLookup = (
  form: UseFormReturn<ClientFormValues>,
  cep: string
) => {
  const fetchAddressData = async () => {
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
  };

  return { fetchAddressData };
};

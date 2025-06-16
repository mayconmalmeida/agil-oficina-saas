
import { UseFormReturn } from 'react-hook-form';
import { useCallback } from 'react';
import { ClientFormValues } from './validation';
import { formatCPF, formatCEP, formatLicensePlate } from '@/utils/formatUtils';

export const useFormatHandlers = (form: UseFormReturn<ClientFormValues>) => {
  const handleDocumentoFormat = useCallback((documento: string) => {
    if (documento) {
      const formattedCPF = formatCPF(documento);
      if (formattedCPF !== documento) {
        form.setValue('documento', formattedCPF, { shouldValidate: false });
      }
    }
  }, [form]);

  const handleCepFormat = useCallback((cep: string) => {
    if (cep) {
      const formattedCEP = formatCEP(cep);
      if (formattedCEP !== cep) {
        form.setValue('cep', formattedCEP, { shouldValidate: false });
      }
    }
  }, [form]);

  const handlePlacaFormat = useCallback((placa: string) => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('veiculo.placa', formattedPlate, { shouldValidate: false });
      }
    }
  }, [form]);

  return {
    handleDocumentoFormat,
    handleCepFormat,
    handlePlacaFormat
  };
};

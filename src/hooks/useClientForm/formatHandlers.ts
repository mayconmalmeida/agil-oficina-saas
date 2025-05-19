
import { UseFormReturn } from 'react-hook-form';
import { formatCPF, formatCEP, formatLicensePlate } from '@/utils/formatUtils';
import { ClientFormValues } from './validation';

export const useFormatHandlers = (form: UseFormReturn<ClientFormValues>) => {
  const handleDocumentoFormat = (documento: string) => {
    if (documento) {
      const formattedCPF = formatCPF(documento);
      if (formattedCPF !== documento) {
        form.setValue('documento', formattedCPF);
      }
    }
  };

  const handleCepFormat = (cep: string) => {
    if (cep) {
      const formattedCEP = formatCEP(cep);
      if (formattedCEP !== cep) {
        form.setValue('cep', formattedCEP);
      }
    }
  };

  const handlePlacaFormat = (placa: string) => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('veiculo.placa', formattedPlate);
      }
    }
  };

  return {
    handleDocumentoFormat,
    handleCepFormat,
    handlePlacaFormat
  };
};

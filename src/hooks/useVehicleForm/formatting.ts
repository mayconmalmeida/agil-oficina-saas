
import { UseFormReturn } from 'react-hook-form';
import { useCallback } from 'react';
import { formatLicensePlate as formatLicensePlateUtil } from '@/utils/formatUtils';
import { VehicleFormValues } from './validation';

export const useVehicleFormatting = (form: UseFormReturn<VehicleFormValues>) => {
  const formatLicensePlate = useCallback((placa: string) => {
    if (placa) {
      const formattedPlate = formatLicensePlateUtil(placa);
      if (formattedPlate !== placa) {
        form.setValue('placa', formattedPlate);
      }
    }
  }, [form]);

  return { formatLicensePlate };
};

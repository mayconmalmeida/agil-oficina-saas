
import { z } from 'zod';
import { validateLicensePlate } from '@/utils/validationUtils';

// Schema with enhanced validations
export const vehicleFormSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  marca: z.string().min(1, 'Marca do veículo é obrigatória'),
  modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
  placa: z.string()
    .refine(val => validateLicensePlate(val), {
      message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
    }),
  cor: z.string().optional(),
  kilometragem: z.string().optional()
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

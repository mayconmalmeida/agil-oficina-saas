
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatPhone } from '@/utils/supabaseTypes';
import { validateLicensePlate, validateCPF } from '@/utils/validationUtils';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  tipo: z.enum(['pf', 'pj']).default('pf'),
  documento: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      // For PF, validate CPF; for PJ, just check if it's not empty (CNPJ validation can be added later)
      return val.length >= 11;
    }, 'Documento inválido'),
  telefone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine((phone) => {
      // Remove all non-numeric characters for validation
      const cleanPhone = phone.replace(/\D/g, '');
      // Brazilian phone numbers should have 10 or 11 digits (with area code)
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    }, 'Telefone deve ter 10 ou 11 dígitos. Ex: (11) 99999-9999'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
    placa: z.string()
      .min(1, 'Placa é obrigatória')
      .refine((placa) => validateLicensePlate(placa), {
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      })
  })
});

export type ClientFormBasicValues = z.infer<typeof formSchema>;

export const useClientFormBasic = () => {
  const form = useForm<ClientFormBasicValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipo: 'pf',
      documento: '',
      telefone: '',
      email: '',
      veiculo: {
        marca: '',
        modelo: '',
        ano: '',
        placa: ''
      }
    },
  });
  
  const handlePhoneFormat = (value: string) => {
    return formatPhone(value);
  };
  
  return {
    form,
    handlePhoneFormat
  };
};

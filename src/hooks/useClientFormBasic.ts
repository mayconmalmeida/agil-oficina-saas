
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatPhone } from '@/utils/supabaseTypes';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
    placa: z.string().min(7, 'Placa deve ter no mínimo 7 caracteres').max(8, 'Placa deve ter no máximo 8 caracteres')
  })
});

export type ClientFormBasicValues = z.infer<typeof formSchema>;

export const useClientFormBasic = () => {
  const form = useForm<ClientFormBasicValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
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

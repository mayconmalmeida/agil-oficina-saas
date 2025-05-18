
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';
import { validateCPF, validateLicensePlate } from '@/utils/validationUtils';

// Schema with enhanced validations
export const clientFormSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  tipo: z.enum(['pf', 'pj']).default('pf'),
  documento: z.string()
    .refine(val => 
      val === '' || 
      (val.length >= 11 && validateCPF(val)), 
      {
        message: 'CPF inválido. Formato: 000.000.000-00'
      }
    ).optional().or(z.literal('')),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'Formato de CEP inválido. Use XXXXX-XXX')
    .optional().or(z.literal('')),
  endereco: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
    placa: z.string()
      .refine(val => validateLicensePlate(val), {
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      }),
    cor: z.string().optional().or(z.literal('')),
    kilometragem: z.string().optional().or(z.literal(''))
  })
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface UseClientFormProps {
  onSave: () => void;
  initialData?: Partial<ClientFormValues>;
}

export const useClientForm = ({ onSave, initialData = {} }: UseClientFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('cliente');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: initialData.nome || '',
      tipo: initialData.tipo || 'pf',
      documento: initialData.documento || '',
      telefone: initialData.telefone || '',
      email: initialData.email || '',
      cep: initialData.cep || '',
      endereco: initialData.endereco || '',
      numero: initialData.numero || '',
      bairro: initialData.bairro || '',
      cidade: initialData.cidade || '',
      estado: initialData.estado || '',
      veiculo: {
        marca: initialData.veiculo?.marca || '',
        modelo: initialData.veiculo?.modelo || '',
        ano: initialData.veiculo?.ano || '',
        placa: initialData.veiculo?.placa || '',
        cor: initialData.veiculo?.cor || '',
        kilometragem: initialData.veiculo?.kilometragem || ''
      }
    },
  });
  
  const handleNextTab = () => {
    setActiveTab('veiculo');
  };
  
  const handlePrevTab = () => {
    setActiveTab('cliente');
  };
  
  const onSubmit = async (values: ClientFormValues) => {
    try {
      setIsLoading(true);
      
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar clientes."
        });
        return;
      }

      // Format complete address
      const enderecoCompleto = values.endereco + (values.numero ? `, ${values.numero}` : '');
      
      // Prepare vehicle data
      const veiculoFormatado = `${values.veiculo.marca} ${values.veiculo.modelo} ${values.veiculo.ano}, Placa: ${values.veiculo.placa}`;
      
      // Use the safeRpc function to ensure type safety
      const { error } = await safeRpc('create_client', {
        p_user_id: session.user.id,
        p_nome: values.nome,
        p_telefone: values.telefone,
        p_email: values.email || null,
        p_veiculo: veiculoFormatado,
        p_marca: values.veiculo.marca,
        p_modelo: values.veiculo.modelo, 
        p_ano: values.veiculo.ano,
        p_placa: values.veiculo.placa,
        p_endereco: enderecoCompleto,
        p_cidade: values.cidade || null,
        p_estado: values.estado || null,
        p_cep: values.cep || null,
        p_documento: values.documento || null
      });
      
      if (error) throw error;
      
      setSaveSuccess(true);
      onSave();
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente",
        description: error.message || "Ocorreu um erro ao adicionar o cliente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    activeTab,
    setActiveTab,
    isLoading,
    saveSuccess,
    handleNextTab,
    handlePrevTab,
    onSubmit
  };
};

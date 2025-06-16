
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';
import { validateCPF, validateLicensePlate, fetchAddressByCEP } from '@/utils/validationUtils';

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
  isEditing?: boolean;
  clientId?: string;
}

export const useClientForm = ({ 
  onSave, 
  initialData = {},
  isEditing = false,
  clientId
}: UseClientFormProps) => {
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

  // Fetch client data if in edit mode
  useEffect(() => {
    if (isEditing && clientId) {
      const fetchClient = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Handle missing properties with defaults
            const clientData = {
              ...data,
              tipo: (data as any).tipo || 'pf',
              endereco: (data as any).endereco || '',
              cidade: (data as any).cidade || '',
              estado: (data as any).estado || '',
              cep: (data as any).cep || '',
              documento: (data as any).documento || '',
              cor: (data as any).cor || '',
              kilometragem: (data as any).kilometragem || '',
              bairro: (data as any).bairro || '',
              numero: (data as any).numero || ''
            };
            
            // Format data for the form
            form.reset({
              nome: clientData.nome || '',
              tipo: clientData.tipo as 'pf' | 'pj' || 'pf',
              documento: clientData.documento || '',
              telefone: clientData.telefone || '',
              email: clientData.email || '',
              cep: clientData.cep || '',
              endereco: clientData.endereco || '',
              numero: clientData.numero || '',
              bairro: clientData.bairro || '',
              cidade: clientData.cidade || '',
              estado: clientData.estado || '',
              veiculo: {
                marca: clientData.marca || '',
                modelo: clientData.modelo || '',
                ano: clientData.ano || '',
                placa: clientData.placa || '',
                cor: clientData.cor || '',
                kilometragem: clientData.kilometragem || ''
              }
            });
          }
        } catch (error: any) {
          console.error('Error fetching client:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar cliente",
            description: "Não foi possível carregar os dados do cliente."
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [isEditing, clientId, form, toast]);
  
  // Watch for CEP changes and auto-fill address
  const cep = form.watch('cep');
  
  useEffect(() => {
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
    
    fetchAddressData();
  }, [cep, form]);
  
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
      
      if (isEditing && clientId) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            nome: values.nome,
            telefone: values.telefone,
            email: values.email || null,
            endereco: enderecoCompleto,
            cidade: values.cidade || null,
            estado: values.estado || null,
            cep: values.cep || null,
            documento: values.documento || null,
            tipo: values.tipo,
            bairro: values.bairro || null,
            numero: values.numero || null
          })
          .eq('id', clientId);
          
        if (error) throw error;

        // Update vehicle in new veiculos table
        if (values.veiculo.marca && values.veiculo.modelo && values.veiculo.ano && values.veiculo.placa) {
          // Check if vehicle already exists for this client
          const { data: existingVehicle } = await supabase
            .from('veiculos')
            .select('id')
            .eq('cliente_id', clientId)
            .single();

          if (existingVehicle) {
            // Update existing vehicle
            await supabase
              .from('veiculos')
              .update({
                marca: values.veiculo.marca,
                modelo: values.veiculo.modelo,
                ano: values.veiculo.ano,
                placa: values.veiculo.placa,
                cor: values.veiculo.cor || null,
                kilometragem: values.veiculo.kilometragem || null
              })
              .eq('id', existingVehicle.id);
          } else {
            // Create new vehicle
            await supabase
              .from('veiculos')
              .insert({
                cliente_id: clientId,
                marca: values.veiculo.marca,
                modelo: values.veiculo.modelo,
                ano: values.veiculo.ano,
                placa: values.veiculo.placa,
                cor: values.veiculo.cor || null,
                kilometragem: values.veiculo.kilometragem || null,
                user_id: session.user.id
              });
          }
        }
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: session.user.id,
            nome: values.nome,
            telefone: values.telefone,
            email: values.email || null,
            veiculo: veiculoFormatado,
            endereco: enderecoCompleto,
            cidade: values.cidade || null,
            estado: values.estado || null,
            cep: values.cep || null,
            documento: values.documento || null,
            tipo: values.tipo,
            bairro: values.bairro || null,
            numero: values.numero || null
          })
          .select()
          .single();
        
        if (clientError) throw clientError;

        // Create vehicle in new veiculos table
        if (values.veiculo.marca && values.veiculo.modelo && values.veiculo.ano && values.veiculo.placa) {
          const { error: vehicleError } = await supabase
            .from('veiculos')
            .insert({
              cliente_id: newClient.id,
              marca: values.veiculo.marca,
              modelo: values.veiculo.modelo,
              ano: values.veiculo.ano,
              placa: values.veiculo.placa,
              cor: values.veiculo.cor || null,
              kilometragem: values.veiculo.kilometragem || null,
              user_id: session.user.id
            });

          if (vehicleError) throw vehicleError;
        }
      }
      
      setSaveSuccess(true);
      toast({
        title: isEditing ? "Cliente atualizado" : "Cliente adicionado",
        description: isEditing 
          ? "Cliente atualizado com sucesso!"
          : "Cliente adicionado com sucesso!"
      });
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar cliente" : "Erro ao adicionar cliente",
        description: error.message || `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'adicionar'} o cliente.`
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


import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { ClientFormValues } from './validation';
import { safeRpc } from '@/utils/supabaseTypes';

export const useClientData = (
  form: UseFormReturn<ClientFormValues>,
  clientId?: string,
  isEditing: boolean = false
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load client data for editing
  const loadClientData = async () => {
    if (!isEditing || !clientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Handle missing properties with defaults using type assertion
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

  // Save client data
  const saveClientData = async (values: ClientFormValues) => {
    try {
      setIsLoading(true);
      
      // Verify authentication
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
            veiculo: veiculoFormatado,
            marca: values.veiculo.marca,
            modelo: values.veiculo.modelo,
            ano: values.veiculo.ano,
            placa: values.veiculo.placa,
            endereco: enderecoCompleto,
            cidade: values.cidade || null,
            estado: values.estado || null,
            cep: values.cep || null,
            documento: values.documento || null,
            tipo: values.tipo,
            cor: values.veiculo.cor || null,
            kilometragem: values.veiculo.kilometragem || null,
            bairro: values.bairro || null,
            numero: values.numero || null
          })
          .eq('id', clientId);
          
        if (error) throw error;
      } else {
        // Create new client
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
          p_documento: values.documento || null,
          p_cor: values.veiculo.cor || null,
          p_kilometragem: values.veiculo.kilometragem || null,
          p_bairro: values.bairro || null,
          p_numero: values.numero || null,
          p_tipo: values.tipo
        });
        
        if (error) throw error;
      }
      
      setSaveSuccess(true);
      toast({
        title: isEditing ? "Cliente atualizado" : "Cliente adicionado",
        description: isEditing 
          ? "Cliente atualizado com sucesso!"
          : "Cliente adicionado com sucesso!"
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar cliente" : "Erro ao adicionar cliente",
        description: error.message || `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'adicionar'} o cliente.`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveSuccess,
    setSaveSuccess,
    loadClientData,
    saveClientData
  };
};

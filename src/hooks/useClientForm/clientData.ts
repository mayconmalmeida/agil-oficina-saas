
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ClientFormValues } from './validation';

export const useClientData = (form: any, clientId?: string, isEditing = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const loadClientData = async () => {
    if (!clientId || !isEditing) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        form.reset({
          nome: data.nome || '',
          tipo: data.tipo || 'pf',
          documento: data.documento || '',
          telefone: data.telefone || '',
          email: data.email || '',
          cep: data.cep || '',
          endereco: data.endereco || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          veiculo: {
            marca: data.marca || '',
            modelo: data.modelo || '',
            ano: data.ano || '',
            placa: data.placa || '',
            cor: data.cor || '',
            kilometragem: data.kilometragem || ''
          }
        });
      }
    } catch (error: any) {
      console.error('Error loading client:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar cliente",
        description: "Não foi possível carregar os dados do cliente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveClientData = async (values: ClientFormValues) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      const enderecoCompleto = values.endereco + (values.numero ? `, ${values.numero}` : '');
      const veiculoFormatado = `${values.veiculo.marca} ${values.veiculo.modelo} ${values.veiculo.ano}, Placa: ${values.veiculo.placa}`;
      
      if (isEditing && clientId) {
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
            numero: values.numero || null,
            marca: values.veiculo.marca,
            modelo: values.veiculo.modelo,
            ano: values.veiculo.ano,
            placa: values.veiculo.placa,
            cor: values.veiculo.cor || null,
            kilometragem: values.veiculo.kilometragem || null,
            veiculo: veiculoFormatado
          })
          .eq('id', clientId);
          
        if (error) throw error;
      } else {
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
            numero: values.numero || null,
            marca: values.veiculo.marca,
            modelo: values.veiculo.modelo,
            ano: values.veiculo.ano,
            placa: values.veiculo.placa,
            cor: values.veiculo.cor || null,
            kilometragem: values.veiculo.kilometragem || null
          })
          .select()
          .single();
        
        if (clientError) throw clientError;

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
      
      return true;
    } catch (error: any) {
      console.error('Error saving client:', error);
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

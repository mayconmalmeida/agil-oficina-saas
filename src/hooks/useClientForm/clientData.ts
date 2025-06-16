
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { ClientFormValues } from './validation';

export const useClientData = (
  form: UseFormReturn<ClientFormValues>,
  clientId?: string,
  isEditing: boolean = false
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load client data for editing
  const loadClientData = useCallback(async () => {
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
        console.log('Dados do cliente carregados:', data);
        
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
        
        // Processar dados do veículo - priorizar dados estruturados
        let vehicleData = {
          marca: '',
          modelo: '',
          ano: '',
          placa: '',
          cor: '',
          kilometragem: ''
        };

        // Se há dados estruturados do veículo
        if (clientData.marca && clientData.modelo) {
          vehicleData = {
            marca: clientData.marca || '',
            modelo: clientData.modelo || '',
            ano: clientData.ano || '',
            placa: clientData.placa || '',
            cor: clientData.cor || '',
            kilometragem: clientData.kilometragem || ''
          };
          console.log('Usando dados estruturados do veículo:', vehicleData);
        } 
        // Fallback para campo veiculo antigo
        else if (clientData.veiculo) {
          const vehicleText = clientData.veiculo;
          console.log('Processando campo veiculo legado:', vehicleText);
          
          // Tentar extrair informações do campo veiculo
          const parts = vehicleText.split(',').map(part => part.trim());
          const mainPart = parts[0] || '';
          
          // Procurar por placa no texto
          const plateMatch = vehicleText.match(/Placa:\s*([A-Z0-9-]+)/i);
          const extractedPlate = plateMatch ? plateMatch[1] : clientData.placa || '';
          
          // Tentar separar marca e modelo do texto principal
          const vehicleParts = mainPart.split(' ');
          if (vehicleParts.length >= 2) {
            vehicleData = {
              marca: vehicleParts[0] || '',
              modelo: vehicleParts.slice(1).join(' ') || '',
              ano: '',
              placa: extractedPlate,
              cor: clientData.cor || '',
              kilometragem: clientData.kilometragem || ''
            };
          } else {
            vehicleData = {
              marca: mainPart,
              modelo: '',
              ano: '',
              placa: extractedPlate,
              cor: clientData.cor || '',
              kilometragem: clientData.kilometragem || ''
            };
          }
          console.log('Dados do veículo extraídos:', vehicleData);
        }
        
        // Format data for the form
        const formData = {
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
          veiculo: vehicleData
        };

        console.log('Dados formatados para o formulário:', formData);
        form.reset(formData);
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
  }, [isEditing, clientId, form, toast]);

  // Save client data
  const saveClientData = useCallback(async (values: ClientFormValues) => {
    try {
      setIsLoading(true);
      console.log('Iniciando salvamento do cliente:', values);
      
      // Verify authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar clientes."
        });
        return false;
      }

      // Format complete address
      const enderecoCompleto = values.endereco + (values.numero ? `, ${values.numero}` : '');
      
      // Prepare vehicle data
      const veiculoFormatado = `${values.veiculo.marca} ${values.veiculo.modelo} ${values.veiculo.ano}, Placa: ${values.veiculo.placa}`;
      
      if (isEditing && clientId) {
        console.log('Atualizando cliente existente:', clientId);
        
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
            numero: values.numero || null,
            // Campos do veículo
            marca: values.veiculo.marca,
            modelo: values.veiculo.modelo,
            ano: values.veiculo.ano,
            placa: values.veiculo.placa,
            cor: values.veiculo.cor || null,
            kilometragem: values.veiculo.kilometragem || null,
            veiculo: veiculoFormatado
          })
          .eq('id', clientId);
          
        if (error) {
          console.error('Erro ao atualizar cliente:', error);
          throw error;
        }

        console.log('Cliente atualizado com sucesso');

        // Update vehicle in new veiculos table
        if (values.veiculo.marca && values.veiculo.modelo && values.veiculo.ano && values.veiculo.placa) {
          // Check if vehicle already exists for this client
          const { data: existingVehicle } = await supabase
            .from('veiculos')
            .select('id')
            .eq('cliente_id', clientId)
            .maybeSingle();

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
        console.log('Criando novo cliente');
        
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
            numero: values.numero || null,
            // Campos do veículo
            marca: values.veiculo.marca,
            modelo: values.veiculo.modelo,
            ano: values.veiculo.ano,
            placa: values.veiculo.placa,
            cor: values.veiculo.cor || null,
            kilometragem: values.veiculo.kilometragem || null
          })
          .select()
          .single();
        
        if (clientError) {
          console.error('Erro ao criar cliente:', clientError);
          throw clientError;
        }

        console.log('Cliente criado com sucesso:', newClient);

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

          if (vehicleError) {
            console.error('Erro ao criar veículo:', vehicleError);
            throw vehicleError;
          }
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
  }, [isEditing, clientId, toast]);

  return {
    isLoading,
    saveSuccess,
    setSaveSuccess,
    loadClientData,
    saveClientData
  };
};

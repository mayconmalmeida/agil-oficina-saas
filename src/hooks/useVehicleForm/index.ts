
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatLicensePlate } from '@/utils/formatUtils';
import { Client } from '@/utils/supabaseTypes';
import { vehicleFormSchema, VehicleFormValues } from './validation';
import { useLookupService } from './lookupService';

interface UseVehicleFormProps {
  onSave: () => void;
  initialData?: Partial<VehicleFormValues>;
  isEditing?: boolean;
  vehicleId?: string;
  defaultClientId?: string;
}

export const useVehicleForm = ({
  onSave,
  initialData = {},
  isEditing = false,
  vehicleId,
  defaultClientId
}: UseVehicleFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientSelector, setShowClientSelector] = useState<boolean>(!isEditing || !defaultClientId);
  const { fetchClientById } = useLookupService();
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      clienteId: defaultClientId || initialData.clienteId || '',
      marca: initialData.marca || '',
      modelo: initialData.modelo || '',
      ano: initialData.ano || '',
      placa: initialData.placa || '',
      cor: initialData.cor || '',
      kilometragem: initialData.kilometragem || ''
    },
  });

  // Fetch vehicle data if in edit mode
  useEffect(() => {
    if (isEditing && vehicleId) {
      const fetchVehicle = async () => {
        setIsLoading(true);
        try {
          // Get vehicle data
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', vehicleId)
            .single();
            
          if (vehicleError) throw vehicleError;
          
          if (vehicleData) {
            // Create complete client data with default values for missing fields
            const clientData: Client = {
              ...vehicleData,
              cor: (vehicleData as any).cor || '',
              kilometragem: (vehicleData as any).kilometragem || '',
              tipo: (vehicleData as any).tipo || 'pf'
            };
            
            // Format data for the form
            form.reset({
              clienteId: clientData.id, // Using the client id
              marca: clientData.marca || '',
              modelo: clientData.modelo || '',
              ano: clientData.ano || '',
              placa: clientData.placa || '',
              cor: clientData.cor || '',
              kilometragem: clientData.kilometragem || ''
            });
            
            setSelectedClient(clientData);
          }
        } catch (error: any) {
          console.error('Error fetching vehicle:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar veículo",
            description: "Não foi possível carregar os dados do veículo."
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchVehicle();
    }
  }, [isEditing, vehicleId, form, toast]);
  
  // Fetch client data when clientId changes
  const clienteId = form.watch('clienteId');
  
  useEffect(() => {
    const loadClient = async () => {
      if (clienteId) {
        const client = await fetchClientById(clienteId);
        setSelectedClient(client);
      } else {
        setSelectedClient(null);
      }
    };
    
    loadClient();
  }, [clienteId, fetchClientById]);
  
  // Format license plate
  const placa = form.watch('placa');
  
  useEffect(() => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('placa', formattedPlate);
      }
    }
  }, [placa, form]);
  
  const onSubmit = async (values: VehicleFormValues) => {
    try {
      setIsLoading(true);
      
      // Verify authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar veículos."
        });
        return;
      }
      
      if (isEditing && vehicleId) {
        // Update existing vehicle in clients table
        const { error } = await supabase
          .from('clients')
          .update({
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            placa: values.placa,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null
          })
          .eq('id', vehicleId);
          
        if (error) throw error;
      } else {
        // Create new vehicle by updating client
        const { error } = await supabase
          .from('clients')
          .update({
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            placa: values.placa,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null
          })
          .eq('id', values.clienteId);
        
        if (error) throw error;
      }
      
      setSaveSuccess(true);
      toast({
        title: isEditing ? "Veículo atualizado" : "Veículo adicionado",
        description: isEditing 
          ? "Veículo atualizado com sucesso!"
          : "Veículo adicionado com sucesso!"
      });
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar veículo" : "Erro ao adicionar veículo",
        description: error.message || `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'adicionar'} o veículo.`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    saveSuccess,
    selectedClient,
    onSubmit,
    showClientSelector
  };
};

export * from './validation';

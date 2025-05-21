
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/utils/supabaseTypes';
import { vehicleFormSchema, VehicleFormValues } from './validation';
import { useLookupService } from './lookupService';
import { useVehicleSubmit } from './submitHandler';
import { useVehicleFormatting } from './formatting';

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

  const { fetchClientById } = useLookupService();
  const { handleSubmit } = useVehicleSubmit({
    form,
    isEditing,
    vehicleId,
    setIsLoading,
    setSaveSuccess,
    toast,
    onSave
  });
  
  const { formatLicensePlate } = useVehicleFormatting(form);

  // Fetch vehicle data if in edit mode
  useEffect(() => {
    if (isEditing && vehicleId) {
      fetchVehicleData();
    }
  }, [isEditing, vehicleId]);
  
  const fetchVehicleData = async () => {
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
          clienteId: clientData.id, 
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
    formatLicensePlate(placa);
  }, [placa, formatLicensePlate]);
  
  return {
    form,
    isLoading,
    saveSuccess,
    selectedClient,
    onSubmit: handleSubmit,
    showClientSelector
  };
};

export * from './validation';

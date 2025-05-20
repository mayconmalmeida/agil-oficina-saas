
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateLicensePlate } from '@/utils/validationUtils';
import { formatLicensePlate } from '@/utils/formatUtils';
import { Vehicle, Client } from '@/utils/supabaseTypes';

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
            .from('clients')  // We'll fetch from clients since vehicles table may not exist
            .select('*')
            .eq('id', vehicleId)
            .single();
            
          if (vehicleError) throw vehicleError;
          
          if (vehicleData) {
            // Format data for the form
            form.reset({
              clienteId: vehicleData.id, // Using the client id
              marca: vehicleData.marca || '',
              modelo: vehicleData.modelo || '',
              ano: vehicleData.ano || '',
              placa: vehicleData.placa || '',
              cor: vehicleData.cor || '',
              kilometragem: vehicleData.kilometragem || ''
            });
            
            setSelectedClient(vehicleData as Client);
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
    if (clienteId) {
      const fetchClient = async () => {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clienteId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setSelectedClient(data as Client);
          }
        } catch (error) {
          console.error('Error fetching client:', error);
          setSelectedClient(null);
        }
      };
      
      fetchClient();
    } else {
      setSelectedClient(null);
    }
  }, [clienteId]);
  
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
    onSubmit
  };
};

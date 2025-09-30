
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateLicensePlate } from '@/utils/validationUtils';
import { formatLicensePlate } from '@/utils/formatUtils';

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
  kilometragem: z.string().optional(),
  tipo_combustivel: z.string().optional()
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
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
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
      kilometragem: initialData.kilometragem || '',
      tipo_combustivel: initialData.tipo_combustivel || ''
    },
  });

  // Fetch vehicle data if in edit mode
  useEffect(() => {
    if (isEditing && vehicleId) {
      const fetchVehicle = async () => {
        setIsLoading(true);
        try {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('veiculos')
            .select(`
              *,
              cliente:clients (*)
            `)
            .eq('id', vehicleId)
            .single();
            
          if (vehicleError) throw vehicleError;
          
          if (vehicleData) {
            form.reset({
              clienteId: vehicleData.cliente_id,
              marca: vehicleData.marca || '',
              modelo: vehicleData.modelo || '',
              ano: vehicleData.ano || '',
              placa: vehicleData.placa || '',
              cor: vehicleData.cor || '',
              kilometragem: vehicleData.kilometragem || '',
              tipo_combustivel: vehicleData.tipo_combustivel || ''
            });
            
            setSelectedClient(vehicleData.cliente);
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
            setSelectedClient(data);
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

      // Check if plate already exists (excluding current vehicle if editing)
      let plateQuery = supabase
        .from('veiculos')
        .select('id')
        .eq('placa', values.placa)
        .eq('user_id', session.user.id);

      if (isEditing && vehicleId) {
        plateQuery = plateQuery.neq('id', vehicleId);
      }

      const { data: existingPlate, error: plateError } = await plateQuery;
      
      if (plateError) throw plateError;
      
      if (existingPlate && existingPlate.length > 0) {
        toast({
          variant: "destructive",
          title: "Placa já cadastrada",
          description: "Já existe um veículo cadastrado com esta placa."
        });
        return;
      }
      
      if (isEditing && vehicleId) {
        // Update existing vehicle
        const { error } = await supabase
          .from('veiculos')
          .update({
            cliente_id: values.clienteId,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            placa: values.placa,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            tipo_combustivel: values.tipo_combustivel || null
          })
          .eq('id', vehicleId);
          
        if (error) throw error;
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('veiculos')
          .insert({
            cliente_id: values.clienteId,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            placa: values.placa,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            tipo_combustivel: values.tipo_combustivel || null,
            user_id: session.user.id
          });
        
        if (error) throw error;
      }
      
      setSaveSuccess(true);
      toast({
        title: isEditing ? "Veículo atualizado" : "Veículo cadastrado",
        description: isEditing 
          ? "Veículo atualizado com sucesso!"
          : "Veículo cadastrado com sucesso!"
      });
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
        description: error.message || `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'cadastrar'} o veículo.`
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

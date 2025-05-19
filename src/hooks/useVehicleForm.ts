
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { validateLicensePlate } from '@/utils/validationUtils';

// Define schema with validations
const vehicleSchema = z.object({
  placa: z.string()
    .refine(val => validateLicensePlate(val), {
      message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
    }),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
  cor: z.string().optional().or(z.literal('')),
  kilometragem: z.string().optional().or(z.literal('')),
  cliente_id: z.string().min(1, 'Cliente é obrigatório')
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface UseVehicleFormProps {
  onSaved: () => void;
  vehicleId?: string;
  isEditing?: boolean;
  clientId?: string;
}

export const useVehicleForm = ({
  onSaved,
  vehicleId,
  isEditing = false,
  clientId
}: UseVehicleFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const showClientSelector = (!isEditing && !clientId);
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      cor: '',
      kilometragem: '',
      cliente_id: clientId || ''
    }
  });
  
  // Fetch vehicle data if editing
  useEffect(() => {
    if (isEditing && vehicleId) {
      const fetchVehicle = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', vehicleId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            form.reset({
              placa: data.placa || '',
              marca: data.marca || '',
              modelo: data.modelo || '',
              ano: data.ano || '',
              cor: data.cor || '',
              kilometragem: data.kilometragem || '',
              cliente_id: data.id
            });
          }
        } catch (error: any) {
          console.error('Error fetching vehicle:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar veículo",
            description: error.message || "Não foi possível carregar os dados do veículo."
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchVehicle();
    }
  }, [isEditing, vehicleId, form, toast]);
  
  const onSubmit = async (values: VehicleFormValues) => {
    setIsLoading(true);
    
    try {
      // Update the client record with vehicle information
      if (isEditing) {
        const { error } = await supabase
          .from('clients')
          .update({
            placa: values.placa,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            veiculo: `${values.marca} ${values.modelo} ${values.ano}, Placa: ${values.placa}`
          })
          .eq('id', vehicleId);
          
        if (error) throw error;
      } else {
        // For new vehicles, we update the client record
        const { error } = await supabase
          .from('clients')
          .update({
            placa: values.placa,
            marca: values.marca,
            modelo: values.modelo,
            ano: values.ano,
            cor: values.cor || null,
            kilometragem: values.kilometragem || null,
            veiculo: `${values.marca} ${values.modelo} ${values.ano}, Placa: ${values.placa}`
          })
          .eq('id', values.cliente_id);
          
        if (error) throw error;
      }
      
      toast({
        title: isEditing ? "Veículo atualizado" : "Veículo cadastrado",
        description: isEditing 
          ? "Veículo atualizado com sucesso!"
          : "Veículo cadastrado com sucesso!",
      });
      
      // Reset form
      form.reset();
      
      // Call onSaved callback
      onSaved();
      
    } catch (error: any) {
      console.error('Error saving vehicle:', error.message);
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
        description: error.message || "Ocorreu um erro ao tentar salvar o veículo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    showClientSelector,
    onSubmit
  };
};

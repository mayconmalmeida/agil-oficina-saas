
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { VehicleFormValues } from './validation';

interface UseVehicleSubmitProps {
  form: UseFormReturn<VehicleFormValues>;
  isEditing: boolean;
  vehicleId?: string;
  setIsLoading: (loading: boolean) => void;
  setSaveSuccess: (success: boolean) => void;
  toast: any;
  onSave: () => void;
}

export const useVehicleSubmit = ({
  form,
  isEditing,
  vehicleId,
  setIsLoading,
  setSaveSuccess,
  toast,
  onSave
}: UseVehicleSubmitProps) => {
  const handleSubmit = async (values: VehicleFormValues) => {
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

  return { handleSubmit };
};

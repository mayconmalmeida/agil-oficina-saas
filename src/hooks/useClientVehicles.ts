
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
}

export const useClientVehicles = (clientId?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🚗 useClientVehicles - clientId mudou:', clientId);
    if (clientId) {
      loadClientVehicles(clientId);
    } else {
      console.log('🚗 useClientVehicles - Sem clientId, limpando veículos');
      setVehicles([]);
    }
  }, [clientId]);

  const loadClientVehicles = async (clientId: string) => {
    console.log('🚗 useClientVehicles - Carregando veículos para cliente:', clientId);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ useClientVehicles - Usuário não autenticado');
        return;
      }

      console.log('🚗 useClientVehicles - Fazendo query na tabela veiculos');
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useClientVehicles - Erro ao carregar veículos:', error);
        throw error;
      }
      
      console.log('✅ useClientVehicles - Veículos encontrados:', data?.length || 0, data);
      setVehicles(data || []);
    } catch (error) {
      console.error('💥 useClientVehicles - Erro ao carregar veículos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: "Não foi possível carregar os veículos do cliente.",
      });
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVehicleDisplay = (vehicle: Vehicle) => {
    const kmText = vehicle.kilometragem ? ` - ${vehicle.kilometragem} km` : '';
    const corText = vehicle.cor ? ` - ${vehicle.cor}` : '';
    return `${vehicle.marca} ${vehicle.modelo} (${vehicle.ano}) - ${vehicle.placa}${corText}${kmText}`;
  };

  return {
    vehicles,
    isLoading,
    formatVehicleDisplay,
    loadClientVehicles
  };
};

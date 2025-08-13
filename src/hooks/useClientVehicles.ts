
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
    if (clientId) {
      loadClientVehicles(clientId);
    } else {
      setVehicles([]);
    }
  }, [clientId]);

  const loadClientVehicles = async (clientId: string) => {
    console.log('🚗 Carregando veículos para cliente:', clientId);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar veículos:', error);
        throw error;
      }
      
      console.log('✅ Veículos carregados:', data?.length || 0, data);
      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
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

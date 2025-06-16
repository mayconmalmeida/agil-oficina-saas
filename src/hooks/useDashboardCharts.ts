
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ChartData {
  monthlyRevenue: { month: string; value: number; services: number }[];
  topClients: { name: string; value: number }[];
  topServices: { name: string; value: number }[];
  serviceTypes: { name: string; value: number }[];
  criticalStock: { name: string; quantity: number; minimum: number }[];
}

export const useDashboardCharts = () => {
  const [chartData, setChartData] = useState<ChartData>({
    monthlyRevenue: [],
    topClients: [],
    topServices: [],
    serviceTypes: [],
    criticalStock: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Dados simulados para demonstração
        const monthlyRevenue = [
          { month: 'Jan', value: 12500, services: 15 },
          { month: 'Fev', value: 15800, services: 18 },
          { month: 'Mar', value: 18200, services: 22 },
          { month: 'Abr', value: 16900, services: 20 },
          { month: 'Mai', value: 21300, services: 25 },
          { month: 'Jun', value: 19800, services: 23 }
        ];

        const topClients = [
          { name: 'João Silva', value: 5200 },
          { name: 'Maria Santos', value: 4800 },
          { name: 'Pedro Costa', value: 3900 },
          { name: 'Ana Oliveira', value: 3200 },
          { name: 'Carlos Lima', value: 2800 }
        ];

        const topServices = [
          { name: 'Troca de Óleo', value: 4500 },
          { name: 'Alinhamento', value: 3200 },
          { name: 'Freios', value: 2800 },
          { name: 'Suspensão', value: 2100 },
          { name: 'Revisão', value: 1900 }
        ];

        const serviceTypes = [
          { name: 'Manutenção Preventiva', value: 45 },
          { name: 'Reparos Gerais', value: 30 },
          { name: 'Troca de Peças', value: 15 },
          { name: 'Diagnóstico', value: 10 }
        ];

        const criticalStock = [
          { name: 'Óleo Motor 5W30', quantity: 3, minimum: 10 },
          { name: 'Filtro de Ar', quantity: 2, minimum: 8 },
          { name: 'Pastilha de Freio', quantity: 1, minimum: 5 },
          { name: 'Vela de Ignição', quantity: 4, minimum: 12 }
        ];

        setChartData({
          monthlyRevenue,
          topClients,
          topServices,
          serviceTypes,
          criticalStock
        });
      } catch (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return { chartData, isLoading };
};

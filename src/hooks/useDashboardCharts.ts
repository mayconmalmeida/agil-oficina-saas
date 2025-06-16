
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
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Buscar faturamento mensal dos últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: budgets } = await supabase
          .from('orcamentos')
          .select('valor_total, created_at, cliente')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true });

        // Agrupar faturamento por mês
        const monthlyRevenue: { [key: string]: { value: number; services: number } } = {};
        const clientRevenue: { [key: string]: number } = {};

        if (budgets) {
          budgets.forEach(budget => {
            const date = new Date(budget.created_at);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'short' });
            
            if (!monthlyRevenue[monthYear]) {
              monthlyRevenue[monthYear] = { value: 0, services: 0 };
            }
            
            monthlyRevenue[monthYear].value += Number(budget.valor_total);
            monthlyRevenue[monthYear].services += 1;

            // Agrupar por cliente para top clientes
            clientRevenue[budget.cliente] = (clientRevenue[budget.cliente] || 0) + Number(budget.valor_total);
          });
        }

        // Buscar serviços mais realizados
        const { data: services } = await supabase
          .from('services')
          .select('nome, tipo')
          .eq('user_id', user.id);

        const serviceTypes: { [key: string]: number } = {};
        const topServices: { [key: string]: number } = {};

        if (services) {
          services.forEach(service => {
            serviceTypes[service.tipo] = (serviceTypes[service.tipo] || 0) + 1;
            topServices[service.nome] = (topServices[service.nome] || 0) + 1;
          });
        }

        // Converter para formato do gráfico
        const monthlyRevenueData = Object.entries(monthlyRevenue).map(([month, data]) => ({
          month,
          value: data.value,
          services: data.services
        }));

        const topClientsData = Object.entries(clientRevenue)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        const topServicesData = Object.entries(topServices)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        const serviceTypesData = Object.entries(serviceTypes)
          .map(([name, value]) => ({ name, value }));

        // Estoque crítico - dados simulados por enquanto (tabela de produtos não existe)
        const criticalStock = [
          { name: 'Óleo Motor 5W30', quantity: 3, minimum: 10 },
          { name: 'Filtro de Ar', quantity: 2, minimum: 8 },
          { name: 'Pastilha de Freio', quantity: 1, minimum: 5 }
        ];

        setChartData({
          monthlyRevenue: monthlyRevenueData,
          topClients: topClientsData,
          topServices: topServicesData,
          serviceTypes: serviceTypesData,
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


import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ChartData {
  name: string;
  value: number;
}

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar dados reais dos últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Buscar orçamentos por mês
        const { data: budgets } = await supabase
          .from('orcamentos')
          .select('valor_total, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString());

        // Agrupar por mês
        const monthlyData: { [key: string]: number } = {};
        
        if (budgets) {
          budgets.forEach(budget => {
            const date = new Date(budget.created_at);
            const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += Number(budget.valor_total) || 0;
          });
        }

        // Converter para formato do gráfico
        const formattedData: ChartData[] = Object.entries(monthlyData).map(([month, value]) => ({
          name: month,
          value
        }));

        // Se não houver dados, retornar array vazio
        setChartData(formattedData);
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return { chartData, isLoading };
};

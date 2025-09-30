
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useChartData = () => {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Buscar dados de orçamentos dos últimos 6 meses para o gráfico
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: budgets } = await supabase
          .from('orcamentos')
          .select('valor_total, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: true });

        // Agrupar por mês
        const monthlyData: { [key: string]: number } = {};
        
        if (budgets) {
          budgets.forEach(budget => {
            const date = new Date(budget.created_at);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(budget.valor_total);
          });
        }

        // Converter para formato do gráfico
        const chartData = Object.entries(monthlyData).map(([month, value]) => ({
          name: month,
          value
        }));

        setChartData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  return { chartData, isLoading };
};

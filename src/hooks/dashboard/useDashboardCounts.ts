
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardCounts {
  clientsCount: number;
  budgetsCount: number;
  servicesCount: number;
  appointmentsCount: number;
}

export const useDashboardCounts = () => {
  const [counts, setCounts] = useState<DashboardCounts>({
    clientsCount: 0,
    budgetsCount: 0,
    servicesCount: 0,
    appointmentsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar contagens reais do banco de dados
        const [clientsResult, budgetsResult, servicesResult, appointmentsResult] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('orcamentos').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('services').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('agendamentos').select('id', { count: 'exact' }).eq('user_id', user.id)
        ]);

        setCounts({
          clientsCount: clientsResult.count || 0,
          budgetsCount: budgetsResult.count || 0,
          servicesCount: servicesResult.count || 0,
          appointmentsCount: appointmentsResult.count || 0
        });
      } catch (error) {
        console.error('Erro ao buscar contadores:', error);
        // Em caso de erro, manter zeros (dados reais)
        setCounts({
          clientsCount: 0,
          budgetsCount: 0,
          servicesCount: 0,
          appointmentsCount: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, isLoading };
};

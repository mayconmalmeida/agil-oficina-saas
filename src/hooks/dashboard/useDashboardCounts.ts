
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDashboardCounts = () => {
  const [counts, setCounts] = useState({
    clientsCount: 0,
    servicesCount: 0,
    budgetsCount: 0,
    appointmentsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Buscar contagem de clientes
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Buscar contagem de serviços
        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Buscar contagem de orçamentos
        const { count: budgetsCount } = await supabase
          .from('orcamentos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Para agendamentos, vamos assumir 0 por enquanto (tabela não existe ainda)
        const appointmentsCount = 0;

        setCounts({
          clientsCount: clientsCount || 0,
          servicesCount: servicesCount || 0,
          budgetsCount: budgetsCount || 0,
          appointmentsCount
        });
      } catch (error) {
        console.error('Error fetching dashboard counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, isLoading };
};

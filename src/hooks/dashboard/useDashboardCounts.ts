
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type DashboardCounts = {
  totalClients: number;
  totalServices: number;
  totalBudgets: number;
  openServices: number;
  scheduledServices: number;
};

export const useDashboardCounts = (userId?: string) => {
  const [counts, setCounts] = useState<DashboardCounts>({
    totalClients: 0,
    totalServices: 0,
    totalBudgets: 0,
    openServices: 5, // Sample data - would come from actual query in real implementation
    scheduledServices: 3, // Sample data - would come from actual query in real implementation
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCounts = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch counts from different tables
        const [
          { count: clientsCount, error: clientsError },
          { count: servicesCount, error: servicesError },
          { count: budgetsCount, error: budgetsError },
        ] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('services').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('orcamentos').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        ]);

        if (clientsError || servicesError || budgetsError) {
          console.error("Error fetching counts:", { clientsError, servicesError, budgetsError });
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do dashboard.",
          });
          return;
        }

        setCounts({
          totalClients: clientsCount || 0,
          totalServices: servicesCount || 0,
          totalBudgets: budgetsCount || 0,
          openServices: 5, // Sample data - would come from actual query in real implementation
          scheduledServices: 3, // Sample data - would come from actual query in real implementation
        });
      } catch (error) {
        console.error("Error in fetchCounts:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [userId, toast]);

  return { counts, isLoading };
};

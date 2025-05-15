
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/components/dashboard/RecentActivities';

export const useRecentActivities = (userId?: string) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        const recentActivities: Activity[] = [];
        
        // Get recent clients
        const { data: recentClients, error: clientsActivityError } = await supabase
          .from('clients')
          .select('id, nome, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentClients && !clientsActivityError) {
          recentClients.forEach(client => {
            recentActivities.push({
              id: client.id,
              type: 'client',
              title: `Cliente adicionado: ${client.nome}`,
              description: `Novo cliente registrado no sistema`,
              createdAt: client.created_at,
            });
          });
        }
        
        // Get recent budgets
        const { data: recentBudgets, error: budgetsActivityError } = await supabase
          .from('orcamentos')
          .select('id, cliente, valor_total, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentBudgets && !budgetsActivityError) {
          recentBudgets.forEach(budget => {
            recentActivities.push({
              id: budget.id,
              type: 'budget',
              title: `Orçamento para ${budget.cliente}`,
              description: `Valor: R$ ${budget.valor_total.toFixed(2)}`,
              createdAt: budget.created_at,
            });
          });
        }
        
        // Sort by created_at date
        const sortedActivities = recentActivities.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 5); // Get only the 5 most recent activities

        setActivities(sortedActivities);
      } catch (error) {
        console.error("Error in fetchRecentActivities:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar as atividades recentes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivities();
  }, [userId, toast]);

  return { activities, isLoading };
};

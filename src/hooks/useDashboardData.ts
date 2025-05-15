
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/components/dashboard/RecentActivities';

export type WorkshopStatus = 'active' | 'trial' | 'expired';

export type DashboardData = {
  totalClients: number;
  totalServices: number;
  totalBudgets: number;
  recentActivities: Activity[];
  workshopStatus: WorkshopStatus;
  daysRemaining: number;
  planType: string;
};

export const useDashboardData = (userId?: string) => {
  const [data, setData] = useState<DashboardData>({
    totalClients: 0,
    totalServices: 0,
    totalBudgets: 0,
    recentActivities: [],
    workshopStatus: 'trial',
    daysRemaining: 7,
    planType: 'basic'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch counts from different tables
        const [
          { count: clientsCount, error: clientsError },
          { count: servicesCount, error: servicesError },
          { count: budgetsCount, error: budgetsError },
          { data: profileData, error: profileError },
        ] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('services').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('orcamentos').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('profiles').select('plano, trial_ends_at').eq('id', userId).single(),
        ]);

        if (clientsError || servicesError || budgetsError || profileError) {
          console.error("Error fetching counts:", { clientsError, servicesError, budgetsError, profileError });
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do dashboard.",
          });
          return;
        }

        // Fetch recent activities (combining recent clients, services, and budgets)
        const fetchRecentItems = async () => {
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
          return recentActivities.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          }).slice(0, 5); // Get only the 5 most recent activities
        };

        const recentActivities = await fetchRecentItems();
        
        // Calculate trial status and days remaining
        let workshopStatus: WorkshopStatus = 'trial';
        let daysRemaining = 7;
        
        if (profileData) {
          const planType = profileData.plano || 'basic';
          const trialEndsAt = profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null;
          
          if (planType === 'premium') {
            workshopStatus = 'active';
          } else if (trialEndsAt) {
            const now = new Date();
            if (trialEndsAt > now) {
              const diffTime = trialEndsAt.getTime() - now.getTime();
              daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              workshopStatus = 'trial';
            } else {
              workshopStatus = 'expired';
              daysRemaining = 0;
            }
          }
          
          setData({
            totalClients: clientsCount || 0,
            totalServices: servicesCount || 0,
            totalBudgets: budgetsCount || 0,
            recentActivities,
            workshopStatus,
            daysRemaining,
            planType
          });
        }
        
      } catch (error) {
        console.error("Error in fetchDashboardData:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados do dashboard.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, toast]);

  return { data, isLoading };
};

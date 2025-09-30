
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RecentActivity {
  id: string;
  type: 'client' | 'budget' | 'service' | 'appointment';
  title: string;
  description: string;
  createdAt: string;
  timestamp: string;
}

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar atividades reais recentes do banco
        const recentActivities: RecentActivity[] = [];

        // Buscar clientes recentes
        const { data: recentClients } = await supabase
          .from('clients')
          .select('id, nome, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentClients) {
          recentClients.forEach(client => {
            recentActivities.push({
              id: client.id,
              type: 'client',
              title: `Cliente ${client.nome}`,
              description: `Cliente ${client.nome} foi adicionado`,
              timestamp: new Date(client.created_at).toLocaleString(),
              createdAt: client.created_at
            });
          });
        }

        // Buscar orçamentos recentes
        const { data: recentBudgets } = await supabase
          .from('orcamentos')
          .select('id, cliente, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentBudgets) {
          recentBudgets.forEach(budget => {
            recentActivities.push({
              id: budget.id,
              type: 'budget',
              title: `Orçamento para ${budget.cliente}`,
              description: `Orçamento criado para ${budget.cliente}`,
              timestamp: new Date(budget.created_at).toLocaleString(),
              createdAt: budget.created_at
            });
          });
        }

        // Buscar serviços recentes
        const { data: recentServices } = await supabase
          .from('services')
          .select('id, nome, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        if (recentServices) {
          recentServices.forEach(service => {
            recentActivities.push({
              id: service.id,
              type: 'service',
              title: `Serviço ${service.nome}`,
              description: `Serviço ${service.nome} foi criado`,
              timestamp: new Date(service.created_at).toLocaleString(),
              createdAt: service.created_at
            });
          });
        }

        // Ordenar por data de criação (mais recente primeiro) e limitar a 10
        const sortedActivities = recentActivities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return { activities, isLoading };
};

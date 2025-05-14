
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";

type UserStats = {
  totalUsers: number;
  totalQuotes: number;
  activeUsers: number;
  activeSubscriptions: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalQuotes: 0,
    activeUsers: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário é um administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (!adminData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
      } else {
        // Carregar estatísticas
        fetchStats();
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const fetchStats = async () => {
    try {
      // Obter número total de usuários
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Obter número total de orçamentos
      const { count: quoteCount } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true });

      // Obter usuários ativos (que logaram nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('last_login', thirtyDaysAgo.toISOString());

      // Obter assinaturas ativas
      const { count: activeSubscriptionsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: userCount || 0,
        totalQuotes: quoteCount || 0,
        activeUsers: activeUsersCount || 0,
        activeSubscriptions: activeSubscriptionsCount || 0,
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do sistema.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Painel Administrativo - OficinaÁgil" 
        onLogout={handleLogout} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsOverview stats={stats} />

        <SectionLink 
          title="Gerenciar Usuários"
          buttonText="Ver Todos os Usuários"
          onNavigate={() => navigate('/admin/users')}
        />

        <SectionLink 
          title="Gerenciar Assinaturas"
          buttonText="Ver Todas as Assinaturas"
          onNavigate={() => navigate('/admin/subscriptions')}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;

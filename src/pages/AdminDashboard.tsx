
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import { useAdminData } from '@/hooks/admin/useAdminData';

const AdminDashboard = () => {
  const { stats, isLoadingStats, fetchStats } = useAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'superadmin')) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
      } else {
        fetchStats();
      }
    };

    checkAdminStatus();
  }, [navigate, toast, fetchStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isLoadingStats) {
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

        <SectionLink 
          title="Gerenciar Planos"
          buttonText="Editar Planos e Preços"
          onNavigate={() => navigate('/admin/plans')}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;

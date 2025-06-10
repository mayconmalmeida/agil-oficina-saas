
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import { useAdminData } from '@/hooks/admin/useAdminData';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { stats, isLoadingStats, fetchStats } = useAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Apenas buscar estatísticas, pois a autenticação já é verificada pelo AdminGuard
    console.log('AdminDashboard: Carregando estatísticas...');
    fetchStats();
  }, [fetchStats]);

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Visão geral do sistema OficinaÁgil</p>
        </div>

        <StatsOverview stats={stats} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useAdminContext } from '@/contexts/AdminContext';
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import Loading from '@/components/ui/loading';

const OptimizedAdminDashboard = () => {
  const { stats, isLoading, error, refetch } = useOptimizedAdminData();
  const { user } = useAdminContext();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading fullscreen text="Carregando painel administrativo..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.email} - Visão geral do sistema OficinaÁgil
          </p>
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

        <div className="mt-8 flex justify-end">
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Atualizar Dados
          </button>
        </div>
      </main>
    </div>
  );
};

export default OptimizedAdminDashboard;

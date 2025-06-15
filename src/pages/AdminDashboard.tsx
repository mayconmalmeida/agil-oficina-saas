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

  // Fallback para erro ou stats inválido/vazio
  const isStatsEmpty =
    !stats ||
    Object.keys(stats).every((k) => stats[k] === 0 || stats[k] == null);

  if (isStatsEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900">
          Nenhum dado encontrado para o painel administrativo.
        </h2>
        <p className="mt-2 text-gray-500">
          Não foi possível carregar as estatísticas. Isso pode indicar ausência de dados ou erro de comunicação.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={fetchStats}
        >
          Tentar Novamente
        </button>
        {/* Bloco debug */}
        <div className="mt-6 bg-gray-100 rounded p-4 text-xs max-w-xl overflow-x-auto">
          <strong>[DEBUG] stats retornado:</strong>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
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

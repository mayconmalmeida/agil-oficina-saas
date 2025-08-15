
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useAdminContext } from '@/contexts/AdminContext';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import AdminDashboardActions from '@/components/admin/AdminDashboardActions';
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Calcular receita mensal estimada
  const monthlyRevenue = (stats.activeSubscriptions * 49.90) + (stats.trialingUsers * 0); // Trial não gera receita

  const dashboardStats = {
    totalUsers: stats.totalUsers,
    totalOficinas: stats.totalUsers, // Assumindo que cada usuário tem uma oficina
    activeSubscriptions: stats.activeSubscriptions,
    trialingUsers: stats.trialingUsers,
    newUsersThisMonth: stats.newUsersThisMonth,
    monthlyRevenue
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Painel Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bem-vindo, {user?.email?.split('@')[0]} - Visão geral do sistema OficinaÁgil
          </p>
        </div>

        {/* Estatísticas */}
        <AdminDashboardStats stats={dashboardStats} isLoading={isLoading} />

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Ações Rápidas
          </h2>
          <AdminDashboardActions />
        </div>

        {/* Resumo do Sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumo do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Taxa de Conversão
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers > 0 ? 
                  `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receita Média por Usuário
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                R$ {stats.totalUsers > 0 ? (monthlyRevenue / stats.totalUsers).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Usuários Ativos
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.activeSubscriptions + stats.trialingUsers}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Crescimento Mensal
              </div>
              <div className="text-xl font-bold text-green-600">
                +{stats.newUsersThisMonth}
              </div>
            </div>
          </div>
        </div>

        {/* Botão de atualização */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Atualizar Dados
          </button>
        </div>
      </main>
    </div>
  );
};

export default OptimizedAdminDashboard;

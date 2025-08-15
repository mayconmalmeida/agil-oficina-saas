
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useAdminContext } from '@/contexts/AdminContext';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import AdminDashboardActions from '@/components/admin/AdminDashboardActions';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Calcular receita mensal estimada (valores padrão dos planos)
  const monthlyRevenue = (stats.activeSubscriptions * 49.90);

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
        {/* Header com informações do admin */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Bem-vindo, {user?.email?.split('@')[0]} - Visão geral do sistema OficinaÁgil
            </p>
          </div>
          <Button
            onClick={refetch}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas Principais */}
        <AdminDashboardStats stats={dashboardStats} isLoading={isLoading} />

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Ações Rápidas
          </h2>
          <AdminDashboardActions />
        </div>

        {/* Cards de Resumo do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumo Financeiro */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumo Financeiro
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Receita Mensal Estimada:</span>
                <span className="font-semibold text-green-600">
                  R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Receita Média por Usuário:</span>
                <span className="font-semibold">
                  R$ {stats.totalUsers > 0 ? (monthlyRevenue / stats.totalUsers).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Taxa de Conversão:</span>
                <span className="font-semibold text-blue-600">
                  {stats.totalUsers > 0 ? 
                    `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Métricas de Crescimento */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Métricas de Crescimento
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Usuários Ativos:</span>
                <span className="font-semibold text-green-600">
                  {stats.activeSubscriptions + stats.trialingUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Novos Usuários (Mês):</span>
                <span className="font-semibold text-blue-600">
                  +{stats.newUsersThisMonth}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Usuários em Trial:</span>
                <span className="font-semibold text-yellow-600">
                  {stats.trialingUsers}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas e Notificações */}
        {stats.trialingUsers > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Atenção: {stats.trialingUsers} usuários em período de teste
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Acompanhe estes usuários para converter para assinaturas pagas.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OptimizedAdminDashboard;

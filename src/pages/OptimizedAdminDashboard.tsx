
import React, { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OptimizedAdminDashboard = () => {
  const { stats, isLoading, error, refetch } = useOptimizedAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error('Erro no dashboard admin:', error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Carregando painel administrativo...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Aguarde enquanto buscamos os dados...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={refetch} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
              <p className="text-gray-600 dark:text-gray-400">Visão geral do sistema OficinaÁgil</p>
            </div>
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
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

          <SectionLink 
            title="Gerenciar Oficinas"
            buttonText="Ver Todas as Oficinas"
            onNavigate={() => navigate('/admin/oficinas')}
          />

          <SectionLink 
            title="Configurações"
            buttonText="Configurações do Sistema"
            onNavigate={() => navigate('/admin/settings')}
          />
        </div>
      </main>
    </div>
  );
};

export default OptimizedAdminDashboard;

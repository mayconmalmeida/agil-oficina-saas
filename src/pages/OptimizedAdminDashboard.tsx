
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import SectionLink from "@/components/admin/SectionLink";
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OptimizedAdminDashboard = () => {
  const { stats, isLoading, error, refetch } = useOptimizedAdminData();
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (error) {
      console.error('Erro no dashboard admin:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error,
      });
    }
  }, [error, toast]);

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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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

  // Verificar se há dados zerados (possível problema)
  const hasNoData = stats.totalUsers === 0 && stats.activeSubscriptions === 0;

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

        {/* Alerta se não há dados */}
        {hasNoData && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Nenhum dado encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                Não foi possível encontrar dados no sistema. Isso pode indicar:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                <li>Sistema ainda não possui usuários cadastrados</li>
                <li>Problema nas políticas de segurança do banco de dados</li>
                <li>Erro de comunicação com o banco de dados</li>
              </ul>
              <div className="mt-4">
                <Button 
                  onClick={refetch} 
                  size="sm" 
                  variant="outline"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Debug info apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Debug - Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default OptimizedAdminDashboard;

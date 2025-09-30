
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import StatsOverview from "@/components/admin/StatsOverview";
import { useOptimizedAdminData } from '@/hooks/admin/useOptimizedAdminData';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, AlertTriangle, TrendingUp, Users, Building, CreditCard, Activity, Calendar, DollarSign } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando painel administrativo...</p>
        <p className="text-sm text-gray-500 mt-2">
          Aguarde enquanto buscamos os dados...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 mb-4">
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
  const hasNoData = stats.totalOficinas === 0 && stats.activeSubscriptions === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral completa do sistema OficinaÁgil</p>
        </div>
        <Button 
          onClick={refetch} 
          variant="outline" 
          size="sm"
          className="flex items-center w-fit"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Alerta se não há dados */}
      {hasNoData && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Nenhum dado encontrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Não foi possível encontrar dados no sistema. Isso pode indicar:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
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

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Oficinas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOficinas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Oficinas cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Planos ativos no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários em Teste</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialingUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários no período de teste
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cadastros neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <StatsOverview stats={stats} />

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/oficinas')}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Building className="mr-2 h-5 w-5 text-blue-600" />
              Gerenciar Oficinas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualize, edite dados e gerencie status das oficinas cadastradas no sistema.
            </p>
            <Button variant="outline" className="w-full">
              Ver Todas as Oficinas
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/plans')}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="mr-2 h-5 w-5 text-green-600" />
              Gerenciar Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Configure valores, nomes e links de checkout para planos mensais e anuais.
            </p>
            <Button variant="outline" className="w-full">
              Editar Planos e Preços
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/subscriptions')}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
              Gerenciar Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Controle status das assinaturas: ativa, cancelada, vencida e renovações.
            </p>
            <Button variant="outline" className="w-full">
              Ver Todas as Assinaturas
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/configuracoes')}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="mr-2 h-5 w-5 text-orange-600" />
              Configurações Globais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Configure links de checkout, WhatsApp e mensagens automáticas do sistema.
            </p>
            <Button variant="outline" className="w-full">
              Acessar Configurações
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/monitoring')}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="mr-2 h-5 w-5 text-red-600" />
              Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Acompanhe métricas gerais, performance e saúde do sistema em tempo real.
            </p>
            <Button variant="outline" className="w-full">
              Ver Métricas do Sistema
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime do Sistema:</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Última Atualização:</span>
                <span className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Versão do Sistema:</span>
                <span className="text-sm font-medium">v2.1.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              Debug - Estatísticas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-gray-600 overflow-auto bg-gray-100 p-2 rounded">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedAdminDashboard;

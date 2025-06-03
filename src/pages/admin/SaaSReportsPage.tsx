
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { useAdminData } from '@/hooks/admin/useAdminData';

const SaaSReportsPage: React.FC = () => {
  const { stats, isLoadingStats, fetchStats } = useAdminData();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Cálculos baseados nos dados reais
  const mrr = stats.activeSubscriptions * 49.90; // Estimativa baseada no preço médio
  const churnRate = stats.totalUsers > 0 ? ((stats.totalUsers - stats.activeSubscriptions) / stats.totalUsers * 100) : 0;
  const conversionRate = stats.totalUsers > 0 ? (stats.activeSubscriptions / stats.totalUsers * 100) : 0;

  if (isLoadingStats) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carregando relatórios...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Relatórios do SaaS
        </h1>
        <p className="text-gray-600 mt-2">
          Análises e métricas detalhadas sobre o desempenho da plataforma.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Recorrente)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600">
              Baseado em {stats.activeSubscriptions} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              Usuários sem assinatura ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              De cadastros para assinaturas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
            <p className="text-xs text-gray-600">
              Cadastros neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders para gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                <p>Gráfico de receita será implementado aqui</p>
                <p className="text-sm mt-2">MRR atual: R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-3" />
                <p>Gráfico de distribuição será implementado aqui</p>
                <div className="text-sm mt-2 space-y-1">
                  <p>Total de usuários: {stats.totalUsers}</p>
                  <p>Assinaturas ativas: {stats.activeSubscriptions}</p>
                  <p>Em período de teste: {stats.trialingUsers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3" />
                <p>Funil de conversão será implementado aqui</p>
                <div className="text-sm mt-2 space-y-1">
                  <p>Cadastros: {stats.totalUsers}</p>
                  <p>Testes iniciados: {stats.trialingUsers}</p>
                  <p>Conversões: {stats.activeSubscriptions}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Conversão</span>
                <span className="text-sm text-gray-600">{conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usuários Ativos</span>
                <span className="text-sm text-gray-600">{stats.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Novos Usuários (Mês)</span>
                <span className="text-sm text-gray-600">{stats.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total de Usuários</span>
                <span className="text-sm text-gray-600">{stats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaaSReportsPage;


import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminData } from '@/hooks/admin/useAdminData';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoadingStats, fetchStats } = useAdminData();

  useEffect(() => {
    console.log('AdminDashboard: Montando componente...');
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    console.log('AdminDashboard: Stats atualizadas:', stats);
  }, [stats]);

  if (isLoadingStats) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carregando dashboard...
          </h1>
        </div>
      </div>
    );
  }

  // Cálculo da receita mensal estimada (baseado nas assinaturas ativas)
  const estimatedMonthlyRevenue = stats.activeSubscriptions * 49.90;

  const metrics = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toString(),
      icon: Users,
      change: `+${stats.newUsersThisMonth}`,
      changeType: 'positive' as const,
      description: `${stats.totalUsers} usuários registrados no sistema`
    },
    {
      title: 'Assinaturas Ativas',
      value: stats.activeSubscriptions.toString(),
      icon: CreditCard,
      change: `${stats.trialingUsers} em teste`,
      changeType: 'neutral' as const,
      description: `${stats.activeSubscriptions} assinaturas pagas ativas`
    },
    {
      title: 'Receita Mensal Estimada',
      value: `R$ ${estimatedMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: 'Baseado em assinaturas ativas',
      changeType: 'positive' as const,
      description: `Estimativa: R$ 49,90 × ${stats.activeSubscriptions} assinaturas`
    },
    {
      title: 'Novos Usuários (Este Mês)',
      value: stats.newUsersThisMonth.toString(),
      icon: TrendingUp,
      change: 'Desde o início do mês',
      changeType: 'positive' as const,
      description: `${stats.newUsersThisMonth} novos registros este mês`
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo ao Painel Administrativo do Oficina Ágil, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie usuários, assinaturas e monitore o desempenho da plataforma.
        </p>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Debug - Estatísticas Carregadas:</h3>
        <pre className="text-xs text-gray-600">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <p className={`text-xs flex items-center mt-1 ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
              }`}>
                <span>{metric.change}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Gerenciar Usuários</h4>
              <p className="text-sm text-blue-700">Visualize e edite informações de usuários</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">Relatórios</h4>
              <p className="text-sm text-green-700">Acesse relatórios detalhados do sistema</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900">Campanhas</h4>
              <p className="text-sm text-purple-700">Crie e gerencie campanhas de marketing</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Usuários com Assinatura Ativa</span>
                <span className="text-xs text-gray-500">{stats.activeSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Usuários em Período de Teste</span>
                <span className="text-xs text-gray-500">{stats.trialingUsers}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Total de Usuários Registrados</span>
                <span className="text-xs text-gray-500">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Taxa de Conversão</span>
                <span className="text-xs text-gray-500">
                  {stats.totalUsers > 0 ? 
                    ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) + '%' : 
                    '0%'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

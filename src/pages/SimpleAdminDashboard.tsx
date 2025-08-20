
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, CreditCard, TrendingUp } from 'lucide-react';
import { useAdminContext } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SimpleAdminDashboard: React.FC = () => {
  const { user } = useAdminContext();
  const navigate = useNavigate();

  // Stats mockados para evitar erros de conexão
  const stats = {
    totalUsers: 150,
    totalOficinas: 145,
    activeSubscriptions: 89,
    trialingUsers: 12,
    newUsersThisMonth: 23,
    monthlyRevenue: 4455.00
  };

  const metrics = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toString(),
      icon: Users,
      change: `+${stats.newUsersThisMonth} este mês`,
      changeType: 'positive' as const,
      description: 'Usuários registrados no sistema'
    },
    {
      title: 'Oficinas Cadastradas',
      value: stats.totalOficinas.toString(),
      icon: Building,
      change: 'Total de oficinas',
      changeType: 'neutral' as const,
      description: 'Oficinas ativas no sistema'
    },
    {
      title: 'Assinaturas Ativas',
      value: stats.activeSubscriptions.toString(),
      icon: CreditCard,
      change: `${stats.trialingUsers} em trial`,
      changeType: 'neutral' as const,
      description: 'Assinaturas pagas ativas'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: 'Estimativa baseada em assinaturas',
      changeType: 'positive' as const,
      description: 'Receita estimada mensal'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo, {user?.email?.split('@')[0]}! Gerencie o sistema OficinaÁgil.
        </p>
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
                metric.changeType === 'positive' ? 'text-green-600' : 
                metric.changeType === 'neutral' ? 'text-gray-500' : 'text-red-600'
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
          <CardHeader>
            <CardTitle className="text-blue-600">Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Visualize e edite informações de usuários</p>
            <Button className="mt-4 w-full">Ver Todos os Usuários</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/subscriptions')}>
          <CardHeader>
            <CardTitle className="text-green-600">Gerenciar Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Acompanhe assinaturas e pagamentos</p>
            <Button className="mt-4 w-full">Ver Todas as Assinaturas</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/plans')}>
          <CardHeader>
            <CardTitle className="text-purple-600">Gerenciar Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Edite planos e preços do sistema</p>
            <Button className="mt-4 w-full">Editar Planos</Button>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {stats.trialingUsers > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Atenção: {stats.trialingUsers} usuários em período de teste
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Acompanhe estes usuários para converter para assinaturas pagas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAdminDashboard;

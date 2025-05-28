
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Dados placeholder para as métricas
  const metrics = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Assinaturas Ativas',
      value: '856',
      icon: CreditCard,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.680',
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Taxa de Crescimento',
      value: '18.2%',
      icon: TrendingUp,
      change: '+3%',
      changeType: 'positive' as const
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
              <p className="text-xs text-green-600 flex items-center mt-1">
                <span>{metric.change}</span>
                <span className="text-gray-500 ml-1">vs. mês anterior</span>
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
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Novo usuário registrado</span>
                <span className="text-xs text-gray-500">há 5 min</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Assinatura renovada</span>
                <span className="text-xs text-gray-500">há 15 min</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Pagamento processado</span>
                <span className="text-xs text-gray-500">há 1h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

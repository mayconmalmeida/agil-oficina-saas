
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, CreditCard, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalOficinas: number;
  activeSubscriptions: number;
  trialingUsers: number;
  newUsersThisMonth: number;
  monthlyRevenue: number;
}

interface AdminDashboardStatsProps {
  stats: AdminStats;
  isLoading: boolean;
}

const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ stats, isLoading }) => {
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
      icon: DollarSign,
      change: 'Estimativa baseada em assinaturas',
      changeType: 'positive' as const,
      description: 'Receita estimada mensal'
    },
    {
      title: 'Novos Usuários',
      value: stats.newUsersThisMonth.toString(),
      icon: TrendingUp,
      change: 'Este mês',
      changeType: 'positive' as const,
      description: 'Novos registros este mês'
    },
    {
      title: 'Taxa de Conversão',
      value: stats.totalUsers > 0 ? `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%` : '0%',
      icon: UserCheck,
      change: 'De trial para pago',
      changeType: 'neutral' as const,
      description: 'Conversão de usuários para assinantes'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
  );
};

export default AdminDashboardStats;

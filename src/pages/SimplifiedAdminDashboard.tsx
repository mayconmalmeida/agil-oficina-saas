
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface SimpleStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialingUsers: number;
  newUsersThisMonth: number;
}

const SimplifiedAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SimpleStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    newUsersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando estatísticas simplificadas...');

      // Buscar estatísticas básicas sem retry complexo
      const [usersResult, activeSubsResult, trialUsersResult] = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
      ]);

      const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0;
      const activeSubscriptions = activeSubsResult.status === 'fulfilled' ? (activeSubsResult.value.count || 0) : 0;
      const trialingUsers = trialUsersResult.status === 'fulfilled' ? (trialUsersResult.value.count || 0) : 0;

      setStats({
        totalUsers,
        activeSubscriptions,
        trialingUsers,
        newUsersThisMonth: 0, // Simplificado por enquanto
      });

      console.log('✅ Estatísticas carregadas:', { totalUsers, activeSubscriptions, trialingUsers });
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as estatísticas do dashboard.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const estimatedMonthlyRevenue = stats.activeSubscriptions * 49.90;

  const metrics = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toString(),
      icon: Users,
      change: 'usuários registrados',
      changeType: 'neutral' as const,
      description: `${stats.totalUsers} usuários no sistema`
    },
    {
      title: 'Assinaturas Ativas',
      value: stats.activeSubscriptions.toString(),
      icon: CreditCard,
      change: `${stats.trialingUsers} em teste`,
      changeType: 'positive' as const,
      description: `${stats.activeSubscriptions} assinaturas pagas`
    },
    {
      title: 'Receita Mensal Estimada',
      value: `R$ ${estimatedMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: 'baseado em assinaturas ativas',
      changeType: 'positive' as const,
      description: `R$ 49,90 × ${stats.activeSubscriptions} assinaturas`
    },
    {
      title: 'Usuários em Trial',
      value: stats.trialingUsers.toString(),
      icon: TrendingUp,
      change: 'período de teste',
      changeType: 'neutral' as const,
      description: `${stats.trialingUsers} usuários testando`
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carregando dashboard...
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-2">
            Painel de controle do sistema OficinaÁgil
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
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

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/users')}>
          <CardHeader>
            <CardTitle className="text-blue-900">Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700">Visualizar e editar usuários do sistema</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/subscriptions')}>
          <CardHeader>
            <CardTitle className="text-green-900">Gerenciar Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">Controlar assinaturas e pagamentos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/plans')}>
          <CardHeader>
            <CardTitle className="text-purple-900">Gerenciar Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">Configurar planos e preços</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimplifiedAdminDashboard;

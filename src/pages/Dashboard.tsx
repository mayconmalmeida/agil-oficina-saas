
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Car, 
  Settings, 
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { title: 'Clientes', value: '24', icon: Users, color: 'text-blue-600' },
    { title: 'Orçamentos', value: '12', icon: FileText, color: 'text-green-600' },
    { title: 'Veículos', value: '18', icon: Car, color: 'text-purple-600' },
    { title: 'Agendamentos', value: '8', icon: Calendar, color: 'text-orange-600' },
  ];

  const quickActions = [
    { title: 'Novo Cliente', href: '/dashboard/clientes', icon: Users },
    { title: 'Criar Orçamento', href: '/dashboard/orcamentos', icon: FileText },
    { title: 'Agendar Serviço', href: '/dashboard/agendamentos', icon: Calendar },
    { title: 'Gerenciar Produtos', href: '/dashboard/produtos', icon: Package },
    { title: 'Ver Fornecedores', href: '/dashboard/fornecedores', icon: Building2 },
    { title: 'Configurações', href: '/dashboard/servicos', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Plano Essencial
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  +2 em relação ao mês passado
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full h-16 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{action.title}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">João Silva</p>
                  <p className="text-sm text-gray-600">Troca de óleo - Honda Civic</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ 250,00</p>
                  <Badge variant="secondary" className="text-xs">Pendente</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maria Santos</p>
                  <p className="text-sm text-gray-600">Revisão - Toyota Corolla</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ 450,00</p>
                  <Badge variant="default" className="text-xs">Aprovado</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pedro Costa</p>
                  <p className="text-sm text-gray-600">Freios - Ford Ka</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ 320,00</p>
                  <Badge variant="secondary" className="text-xs">Pendente</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ana Oliveira</p>
                  <p className="text-sm text-gray-600">09:00 - Alinhamento</p>
                </div>
                <Badge variant="default" className="text-xs">Confirmado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Carlos Lima</p>
                  <p className="text-sm text-gray-600">14:00 - Revisão</p>
                </div>
                <Badge variant="secondary" className="text-xs">Aguardando</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lucia Ferreira</p>
                  <p className="text-sm text-gray-600">16:30 - Diagnóstico</p>
                </div>
                <Badge variant="default" className="text-xs">Confirmado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

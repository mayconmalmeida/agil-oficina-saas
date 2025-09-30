
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Building, CreditCard, Settings, FileText, BarChart3, Cog, Activity } from 'lucide-react';

const AdminDashboardActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Gerenciar Oficinas',
      description: 'Visualizar e editar informações de oficinas',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      onClick: () => navigate('/admin/oficinas')
    },
    {
      title: 'Gerenciar Oficinas',
      description: 'Visualizar todas as oficinas cadastradas',
      icon: Building,
      color: 'bg-green-50 border-green-200 text-green-900',
      onClick: () => navigate('/admin/oficinas')
    },
    {
      title: 'Gerenciar Assinaturas',
      description: 'Controlar assinaturas e planos',
      icon: CreditCard,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      onClick: () => navigate('/admin/subscriptions')
    },
    {
      title: 'Gerenciar Planos',
      description: 'Configurar planos e preços',
      icon: BarChart3,
      color: 'bg-orange-50 border-orange-200 text-orange-900',
      onClick: () => navigate('/admin/plans')
    },
    {
      title: 'Configurações Globais',
      description: 'Configurar links de checkout, WhatsApp e mensagens',
      icon: Cog,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      onClick: () => navigate('/admin/configuracoes')
    },
    {
      title: 'Monitoramento do Sistema',
      description: 'Métricas em tempo real e saúde do sistema',
      icon: Activity,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      onClick: () => navigate('/admin/monitoring')
    },
    {
      title: 'Configurações do Sistema',
      description: 'Configurações gerais do sistema',
      icon: Settings,
      color: 'bg-gray-50 border-gray-200 text-gray-900',
      onClick: () => navigate('/admin/settings')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              {action.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{action.description}</p>
            <Button 
              onClick={action.onClick}
              variant="outline" 
              className="w-full"
            >
              Acessar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboardActions;

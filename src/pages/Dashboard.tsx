
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import Loading from '@/components/ui/loading';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import WorkshopStatusCard from '@/components/dashboard/WorkshopStatusCard';
import PlanNotice from '@/components/dashboard/PlanNotice';
import { Button } from '@/components/ui/button';
import { Package, FileText, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading: profileLoading, userId, handleLogout } = useUserProfile();
  const { data, isLoading: dataLoading } = useDashboardData(userId);
  
  // Get premium features access
  const { handlePremiumFeature } = usePremiumFeatures(
    data.planType, 
    data.daysRemaining
  );
  
  const isLoading = profileLoading || dataLoading;
  
  if (isLoading) {
    return <Loading fullscreen text="Carregando seu painel..." />;
  }
  
  // Quick actions links
  const quickActions = [
    {
      title: "Novo Orçamento",
      icon: <FileText className="h-5 w-5" />,
      href: "/orcamentos/novo",
      color: "bg-amber-100 hover:bg-amber-200 text-amber-700"
    },
    {
      title: "Adicionar Cliente",
      icon: <Users className="h-5 w-5" />,
      href: "/clientes",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700"
    },
    {
      title: "Novo Serviço",
      icon: <Package className="h-5 w-5" />,
      href: "/produtos-servicos",
      color: "bg-green-100 hover:bg-green-200 text-green-700"
    }
  ];
  
  // Add premium feature actions
  const premiumActions = [
    {
      title: "Relatórios",
      onClick: () => {
        if (handlePremiumFeature('reports')) {
          navigate('/relatorios');
        }
      },
      isPremium: true
    },
    {
      title: "Marketing",
      onClick: () => {
        if (handlePremiumFeature('marketing_tools')) {
          navigate('/marketing');
        }
      },
      isPremium: true
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {userProfile?.full_name || 'Usuário'}!
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a) ao painel da {userProfile?.nome_oficina || 'sua oficina'}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          {quickActions.map((action) => (
            <Button 
              key={action.title}
              variant="outline"
              className={`flex items-center gap-2 ${action.color} border-0`}
              onClick={() => navigate(action.href)}
            >
              {action.icon}
              {action.title}
            </Button>
          ))}
        </div>
        
        {/* Stats Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Resumo Geral</h2>
          <DashboardStats 
            totalClients={data.totalClients}
            totalServices={data.totalServices}
            totalBudgets={data.totalBudgets}
            isLoading={isLoading}
          />
        </section>
        
        {/* Status & Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <RecentActivities 
              activities={data.recentActivities}
              isLoading={isLoading}
            />
          </div>
          <div className="space-y-6">
            <WorkshopStatusCard 
              status={data.workshopStatus} 
              daysRemaining={data.daysRemaining}
              isLoading={isLoading}
            />
            <PlanNotice 
              daysRemaining={data.daysRemaining}
              planType={data.planType}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Logout */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="text-oficina-gray"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

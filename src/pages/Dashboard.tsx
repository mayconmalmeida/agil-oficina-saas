
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
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarClock, Users, FileText, Package, Settings, Car } from 'lucide-react';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading: profileLoading, userId, handleLogout } = useUserProfile();
  const { data, isLoading: dataLoading } = useDashboardData(userId);
  
  // Get premium features access
  const { handlePremiumFeature, isPremium } = usePremiumFeatures(
    data?.planType || 'essencial', 
    data?.daysRemaining || 0
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
      title: "Novo Agendamento",
      icon: <CalendarClock className="h-5 w-5" />,
      href: "/agendamentos/novo",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
      isPremium: true
    },
    {
      title: "Novo Cliente",
      icon: <Users className="h-5 w-5" />,
      href: "/clientes/novo",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700"
    },
    {
      title: "Novo Produto",
      icon: <Package className="h-5 w-5" />,
      href: "/produtos/novo",
      color: "bg-green-100 hover:bg-green-200 text-green-700"
    },
    {
      title: "Novo Veículo",
      icon: <Car className="h-5 w-5" />,
      href: "/veiculos/novo",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700"
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/configuracoes",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700"
    }
  ];
  
  const handleQuickAction = (action: any) => {
    if (action.isPremium && !isPremium) {
      handlePremiumFeature('advanced_scheduling');
      return;
    }
    navigate(action.href);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <WelcomeHeader 
          name={userProfile?.full_name || 'Usuário'}
          workshopName={userProfile?.nome_oficina || 'sua oficina'}
          logoUrl={userProfile?.logo_url || null}
        />
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          {quickActions.map((action) => (
            <Button 
              key={action.title}
              variant="outline"
              className={`flex items-center gap-2 ${action.color} border-0`}
              onClick={() => handleQuickAction(action)}
            >
              {action.icon}
              {action.title}
            </Button>
          ))}
        </div>
        
        {/* Stats Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Visão Geral</h2>
          <DashboardStats 
            totalClients={data.totalClients}
            totalServices={data.totalServices}
            totalBudgets={data.totalBudgets}
            openServices={data.openServices}
            scheduledServices={data.scheduledServices}
            isLoading={isLoading}
          />
        </section>
        
        {/* Premium Charts Section */}
        {(isPremium || data.daysRemaining > 0) && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Relatórios Mensais</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePremiumFeature('reports') && navigate('/relatorios')}
                className="text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver todos relatórios
              </Button>
            </div>
            <DashboardCharts 
              monthlyRevenue={data.monthlyRevenue}
              topServices={data.topServices}
              topProducts={data.topProducts}
              isLoading={isLoading}
            />
          </section>
        )}
        
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

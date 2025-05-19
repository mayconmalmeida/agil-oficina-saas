
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import DashboardLoading from '@/components/dashboard/Loading';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import WorkshopStatusCard from '@/components/dashboard/WorkshopStatusCard';
import PlanNotice from '@/components/dashboard/PlanNotice';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { Button } from '@/components/ui/button';

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
    return <DashboardLoading />;
  }
  
  const handleUpgradePlan = () => {
    handlePremiumFeature('reports'); // Using a valid PremiumFeature value
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Workshop name and logo */}
        <WelcomeHeader 
          workshopName={userProfile?.nome_oficina || 'Oficina'}
          logoUrl={userProfile?.logo_url || null}
        />
        
        {/* Acesso Rápido */}
        <QuickActions />
        
        {/* Cards com estatísticas */}
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
        
        {/* Gráficos (disponíveis apenas no plano premium) */}
        <DashboardCharts 
          monthlyRevenue={data.monthlyRevenue}
          topServices={data.topServices}
          topProducts={data.topProducts}
          isPremium={isPremium || data.daysRemaining > 0}
          isLoading={isLoading}
          onUpgradePlan={handleUpgradePlan}
        />
        
        {/* Status da Oficina e Atividades Recentes */}
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


import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentActivities from '@/components/dashboard/RecentActivities';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import PlanInfoCard from '@/components/dashboard/PlanInfoCard';
import OnboardingCard from '@/components/dashboard/OnboardingCard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { allStepsCompleted, getCompletedSteps } from '@/utils/onboardingUtils';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { userProfile, loading, userId } = useUserProfile();
  const { isPremium, handlePremiumFeature } = usePremiumFeatures('premium', 30);
  const { chartData, isLoading: chartsLoading } = useDashboardCharts();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData(userId);
  const { status: onboardingStatus } = useOnboardingProgress(userId);
  const navigate = useNavigate();

  const handleUpgradePlan = () => {
    navigate('/dashboard/assinatura');
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-oficina"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <WelcomeHeader 
        workshopName={userProfile?.nome_oficina}
        logoUrl={userProfile?.logo_url}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <DashboardStats 
            totalClients={dashboardData?.totalClients || 0}
            totalServices={dashboardData?.totalServices || 0}
            totalBudgets={dashboardData?.totalBudgets || 0}
            openServices={dashboardData?.openServices || 0}
            scheduledServices={dashboardData?.scheduledServices || 0}
            isLoading={dashboardLoading}
          />
          <QuickActions />
          
          {/* Gráficos e Relatórios */}
          <DashboardCharts
            monthlyRevenue={chartData.monthlyRevenue}
            topServices={chartData.topServices}
            topClients={chartData.topClients}
            serviceTypes={chartData.serviceTypes}
            criticalStock={chartData.criticalStock}
            isPremium={isPremium}
            isLoading={chartsLoading}
            onUpgradePlan={handleUpgradePlan}
          />
          
          <RecentActivities 
            activities={dashboardData?.recentActivities || []}
            isLoading={dashboardLoading}
          />
        </div>
        
        <div className="space-y-6">
          <PlanInfoCard />
          <OnboardingCard 
            onboardingStatus={onboardingStatus}
            getCompletedSteps={getCompletedSteps}
            allStepsCompleted={allStepsCompleted}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

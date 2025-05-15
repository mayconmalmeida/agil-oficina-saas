
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useUserProfile } from '@/hooks/useUserProfile';
import { allStepsCompleted, getCompletedSteps } from '@/utils/onboardingUtils';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import PlanInfoCard from '@/components/dashboard/PlanInfoCard';
import OnboardingCard from '@/components/dashboard/OnboardingCard';
import SupportCard from '@/components/dashboard/SupportCard';
import Loading from '@/components/ui/loading';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, userId, handleLogout } = useUserProfile();
  const { 
    status: onboardingStatus, 
    loading: onboardingLoading, 
    redirectToNextStepAndNavigate 
  } = useOnboardingProgress(userId || undefined);
  
  // Redirect to next onboarding step if not all steps are completed
  useEffect(() => {
    if (!onboardingLoading && onboardingStatus && !allStepsCompleted(onboardingStatus)) {
      redirectToNextStepAndNavigate();
    }
  }, [onboardingStatus, onboardingLoading, redirectToNextStepAndNavigate]);
  
  if (loading || onboardingLoading) {
    return <Loading fullscreen text="Carregando seu dashboard..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <WelcomeHeader 
          officeName={userProfile?.nome_oficina} 
          fullName={userProfile?.full_name} 
        />
        
        <div className="grid gap-6 md:grid-cols-3">
          <PlanInfoCard planType={userProfile?.plano} />
          <OnboardingCard 
            onboardingStatus={onboardingStatus} 
            getCompletedSteps={getCompletedSteps}
            allStepsCompleted={allStepsCompleted}
          />
          <SupportCard />
        </div>
        
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

export default UserDashboard;

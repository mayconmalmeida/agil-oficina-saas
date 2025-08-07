
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { allStepsCompleted, getCompletedSteps } from '@/utils/onboardingUtils';
import Loading from '@/components/ui/loading';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, userId, handleLogout } = useUserProfile();
  const { plan, planActive } = useAuth();
  const { 
    status: onboardingStatus, 
    loading: onboardingLoading
  } = useOnboardingProgress(userId || undefined);
  
  // Debug do plano
  console.log('UserDashboard: Plano atual:', { plan, planActive, userProfilePlan: userProfile?.plano });
  
  // Removido o redirecionamento automático para evitar loops
  // O usuário pode navegar manualmente para completar o onboarding
  
  if (loading || onboardingLoading) {
    return <Loading fullscreen text="Carregando seu dashboard..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard - {userProfile?.nome_oficina || 'Oficina'}
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900">Status do Onboarding</h2>
              <p className="text-blue-700">
                {onboardingStatus ? 
                  `Passos completados: ${getCompletedSteps(onboardingStatus)}/4` : 
                  'Carregando status...'
                }
              </p>
              {onboardingStatus && !allStepsCompleted(onboardingStatus) && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('UserDashboard: Navegando para completar onboarding');
                      navigate('/dashboard/orcamentos/novo');
                    }}
                    className="text-blue-700"
                  >
                    Completar Onboarding
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900">Informações do Plano</h2>
              <p className="text-green-700">
                Plano: {plan || 'Não definido'} {planActive ? '(Ativo)' : '(Inativo)'}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900">Dados do Usuário</h2>
              <p className="text-yellow-700">
                ID: {userId || 'Não disponível'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="text-gray-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

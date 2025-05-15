
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';

type OnboardingCardProps = {
  onboardingStatus: OnboardingStatus | null;
  getCompletedSteps: (status: OnboardingStatus | null) => number;
  allStepsCompleted: (status: OnboardingStatus) => boolean;
};

const OnboardingCard: React.FC<OnboardingCardProps> = ({ 
  onboardingStatus, 
  getCompletedSteps, 
  allStepsCompleted 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Início Rápido</CardTitle>
        <CardDescription>
          {onboardingStatus && allStepsCompleted(onboardingStatus) 
            ? 'Você completou todas as etapas!' 
            : `${getCompletedSteps(onboardingStatus)}/4 etapas concluídas`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className={`flex items-center ${onboardingStatus?.profile_completed ? 'text-green-600' : ''}`}>
            {onboardingStatus?.profile_completed ? '✅' : '▢'} 
            <span className="ml-2">Configurar perfil da oficina</span>
            {!onboardingStatus?.profile_completed && (
              <Button 
                variant="link" 
                className="ml-auto text-xs" 
                onClick={() => navigate('/perfil-oficina')}
              >
                Fazer agora
              </Button>
            )}
          </li>
          <li className={`flex items-center ${onboardingStatus?.clients_added ? 'text-green-600' : ''}`}>
            {onboardingStatus?.clients_added ? '✅' : '▢'} 
            <span className="ml-2">Adicionar seus primeiros clientes</span>
            {!onboardingStatus?.clients_added && (
              <Button 
                variant="link" 
                className="ml-auto text-xs" 
                onClick={() => navigate('/clientes')}
              >
                Fazer agora
              </Button>
            )}
          </li>
          <li className={`flex items-center ${onboardingStatus?.services_added ? 'text-green-600' : ''}`}>
            {onboardingStatus?.services_added ? '✅' : '▢'} 
            <span className="ml-2">Cadastrar produtos e serviços</span>
            {!onboardingStatus?.services_added && (
              <Button 
                variant="link" 
                className="ml-auto text-xs" 
                onClick={() => navigate('/produtos-servicos')}
              >
                Fazer agora
              </Button>
            )}
          </li>
          <li className={`flex items-center ${onboardingStatus?.budget_created ? 'text-green-600' : ''}`}>
            {onboardingStatus?.budget_created ? '✅' : '▢'} 
            <span className="ml-2">Criar seu primeiro orçamento</span>
            {!onboardingStatus?.budget_created && (
              <Button 
                variant="link" 
                className="ml-auto text-xs" 
                onClick={() => navigate('/orcamentos/novo')}
              >
                Fazer agora
              </Button>
            )}
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default OnboardingCard;

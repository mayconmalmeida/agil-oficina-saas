
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
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
  const completedSteps = getCompletedSteps(onboardingStatus);
  const totalSteps = 4;
  const progressPercentage = onboardingStatus ? (completedSteps / totalSteps) * 100 : 0;
  
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Início Rápido</CardTitle>
            <CardDescription>
              {onboardingStatus && allStepsCompleted(onboardingStatus) 
                ? 'Você completou todas as etapas!' 
                : `${completedSteps}/${totalSteps} etapas concluídas`}
            </CardDescription>
          </div>
          {onboardingStatus && allStepsCompleted(onboardingStatus) && (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className={`flex items-center p-2 rounded-md transition-colors ${onboardingStatus?.profile_completed ? 'bg-green-50' : ''}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
              onboardingStatus?.profile_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              {onboardingStatus?.profile_completed ? '✓' : '1'} 
            </div>
            <span className={onboardingStatus?.profile_completed ? 'text-green-600 font-medium' : ''}>
              Configurar perfil da oficina
            </span>
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
          
          <li className={`flex items-center p-2 rounded-md transition-colors ${onboardingStatus?.clients_added ? 'bg-green-50' : ''}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
              onboardingStatus?.clients_added ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              {onboardingStatus?.clients_added ? '✓' : '2'} 
            </div>
            <span className={onboardingStatus?.clients_added ? 'text-green-600 font-medium' : ''}>
              Adicionar seus primeiros clientes
            </span>
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
          
          <li className={`flex items-center p-2 rounded-md transition-colors ${onboardingStatus?.services_added ? 'bg-green-50' : ''}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
              onboardingStatus?.services_added ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              {onboardingStatus?.services_added ? '✓' : '3'} 
            </div>
            <span className={onboardingStatus?.services_added ? 'text-green-600 font-medium' : ''}>
              Cadastrar produtos e serviços
            </span>
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
          
          <li className={`flex items-center p-2 rounded-md transition-colors ${onboardingStatus?.budget_created ? 'bg-green-50' : ''}`}>
            <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
              onboardingStatus?.budget_created ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              {onboardingStatus?.budget_created ? '✓' : '4'} 
            </div>
            <span className={onboardingStatus?.budget_created ? 'text-green-600 font-medium' : ''}>
              Criar seu primeiro orçamento
            </span>
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


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';
import { getCompletedSteps, getProgressPercentage } from '@/utils/onboardingUtils';
import { CheckCircle, ArrowRight } from "lucide-react";

type OnboardingProgressProps = {
  status: OnboardingStatus | null;
  loading?: boolean;
};

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ status, loading = false }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg p-5 shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded mb-6"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }
  
  if (!status) return null;
  
  const completedSteps = getCompletedSteps(status);
  const progressPercentage = getProgressPercentage(status);
  
  const steps = [
    {
      key: 'profile_completed',
      title: 'Perfil da Oficina',
      description: 'Informações básicas e endereço',
      route: '/perfil-oficina',
      completed: status.profile_completed
    },
    {
      key: 'clients_added',
      title: 'Clientes',
      description: 'Cadastre seus primeiros clientes',
      route: '/clientes',
      completed: status.clients_added
    },
    {
      key: 'services_added',
      title: 'Produtos & Serviços',
      description: 'Adicione o que você oferece',
      route: '/produtos-servicos',
      completed: status.services_added
    },
    {
      key: 'budget_created',
      title: 'Primeiro Orçamento',
      description: 'Crie um orçamento completo',
      route: '/orcamentos/novo',
      completed: status.budget_created
    }
  ];
  
  // Encontrar o próximo passo não concluído
  const nextIncompleteStep = steps.find(step => !step.completed);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Progresso de Configuração</h3>
        <span className="text-sm text-gray-500 font-medium">{completedSteps}/4</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2 mb-6" />
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`p-3 rounded-md border flex items-start gap-3 transition-all ${
              step.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className={`flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full ${
              step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-medium ${step.completed ? 'text-green-700' : ''}`}>
                {step.title}
              </h4>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            
            {!step.completed && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(step.route)}
                className={nextIncompleteStep?.key === step.key ? 'border-oficina text-oficina' : ''}
              >
                {nextIncompleteStep?.key === step.key ? (
                  <>
                    Continuar <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                ) : 'Fazer'}
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {completedSteps === 4 && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          <div>
            <h4 className="font-medium">Configuração completa!</h4>
            <p className="text-xs">Sua oficina está pronta para usar o sistema.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;

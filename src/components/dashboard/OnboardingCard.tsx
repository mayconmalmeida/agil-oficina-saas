
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { OnboardingStatus } from '@/hooks/useOnboardingProgress';
import OnboardingProgress from '../onboarding/OnboardingProgress';

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
        {/* Using the new OnboardingProgress component */}
        <OnboardingProgress status={onboardingStatus} />
      </CardContent>
    </Card>
  );
};

export default OnboardingCard;

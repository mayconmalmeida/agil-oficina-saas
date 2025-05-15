
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

type PlanNoticeProps = {
  daysRemaining?: number;
  planType: string;
  isLoading?: boolean;
};

const PlanNotice = ({ daysRemaining = 0, planType, isLoading = false }: PlanNoticeProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPremium = planType === 'premium';
  const isTrial = daysRemaining > 0;

  return (
    <Card className={`border ${isPremium ? 'border-purple-200 bg-purple-50/50' : ''}`}>
      <CardHeader>
        <CardTitle>{isPremium ? 'Plano Premium' : 'Plano Essencial'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {isPremium ? (
            <>
              <div className="bg-purple-100 text-purple-800 py-2 px-4 rounded-md inline-flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Plano Premium Ativo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Aproveite todos os recursos premium do OficinaÁgil.
              </p>
            </>
          ) : isTrial ? (
            <>
              <p className="font-medium">
                Período de teste: {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
              </p>
              <p className="text-sm text-muted-foreground">
                Aproveite para testar todos os recursos antes de escolher seu plano!
              </p>
              <Button className="mt-4">
                Conhecer planos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium text-amber-700">
                Seu período de teste acabou
              </p>
              <p className="text-sm text-muted-foreground">
                Faça upgrade agora para continuar utilizando todos os recursos.
              </p>
              <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                Fazer upgrade <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanNotice;

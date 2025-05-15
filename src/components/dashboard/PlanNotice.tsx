
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PlanUpgradeModal from './PlanUpgradeModal';

type PlanNoticeProps = {
  daysRemaining?: number;
  planType: string;
  isLoading?: boolean;
};

const PlanNotice = ({ daysRemaining = 0, planType, isLoading = false }: PlanNoticeProps) => {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const openUpgradeModal = () => {
    setUpgradeModalOpen(true);
  };
  
  const handleContactSupport = () => {
    toast({
      title: "Suporte",
      description: "Nossa equipe entrará em contato em breve!",
    });
  };
  
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
  
  // Determine urgency level for trial expiration
  const getTrialBadgeColor = () => {
    if (daysRemaining > 3) return "bg-blue-100 text-blue-800";
    if (daysRemaining > 1) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <>
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
                <Button 
                  variant="outline" 
                  className="border-purple-200 text-purple-700 hover:bg-purple-100"
                  onClick={handleContactSupport}
                >
                  Precisa de ajuda? Fale conosco
                </Button>
              </>
            ) : isTrial ? (
              <>
                <div className={`py-2 px-4 rounded-md inline-flex items-center ${getTrialBadgeColor()}`}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {daysRemaining === 1 ? 'Último dia de teste!' : `${daysRemaining} dias restantes no teste`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining <= 3 
                    ? 'Seu período de teste está acabando! Atualize agora para não perder o acesso aos recursos.' 
                    : 'Aproveite para testar todos os recursos antes de escolher seu plano!'}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={openUpgradeModal}
                >
                  Atualizar plano <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="bg-red-100 text-red-800 py-2 px-4 rounded-md inline-flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    Seu período de teste acabou
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Atualize agora para continuar utilizando todos os recursos.
                </p>
                <Button 
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={openUpgradeModal}
                >
                  Fazer upgrade <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <PlanUpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen} 
      />
    </>
  );
};

export default PlanNotice;

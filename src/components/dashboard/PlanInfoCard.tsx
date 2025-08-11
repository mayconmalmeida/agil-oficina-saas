
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validatePlanAccess, PlanStatus } from "@/services/planValidationCentralized";
import { useAuth } from "@/contexts/AuthContext";

const PlanInfoCard: React.FC = () => {
  const { user } = useAuth();
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlanStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await validatePlanAccess(user.id);
        setPlanStatus(status);
      } catch (error) {
        console.error('Erro ao carregar status do plano:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanStatus();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Seu Plano</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planStatus) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Seu Plano</CardTitle>
          <CardDescription>Informações não disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erro ao carregar informações do plano.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (planStatus.isAdmin) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Administrador</Badge>;
    }
    
    if (planStatus.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    
    return <Badge variant="destructive">Inativo</Badge>;
  };

  const getDaysText = () => {
    if (planStatus.isAdmin || planStatus.daysRemaining >= 999) {
      return "Sem expiração";
    }
    
    if (planStatus.daysRemaining > 0) {
      return `${planStatus.daysRemaining} ${planStatus.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`;
    }
    
    return "Expirado";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Seu Plano
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>Detalhes da sua assinatura</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="font-semibold text-lg">{planStatus.planName}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Tempo restante</p>
            <p className={`font-medium ${
              planStatus.daysRemaining <= 3 && planStatus.daysRemaining > 0 
                ? 'text-orange-600' 
                : planStatus.daysRemaining === 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
            }`}>
              {getDaysText()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Recursos disponíveis</p>
            <p className="font-medium">{planStatus.permissions.length} funcionalidades</p>
          </div>

          {planStatus.source !== 'admin' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Fonte: {
                  planStatus.source === 'user_subscriptions' ? 'Assinatura' :
                  planStatus.source === 'oficinas' ? 'Configuração da oficina' :
                  planStatus.source === 'profiles' ? 'Perfil do usuário' :
                  'Plano gratuito'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanInfoCard;

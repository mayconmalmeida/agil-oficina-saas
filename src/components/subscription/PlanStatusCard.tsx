
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanStatusCardProps {
  subscriptionData: any;
  plan: string | null;
  planActive: boolean;
}

const PlanStatusCard: React.FC<PlanStatusCardProps> = ({ subscriptionData, plan, planActive }) => {
  console.log('PlanStatusCard: Renderizando com dados:', {
    subscriptionData: !!subscriptionData,
    plan,
    planActive,
    subscriptionStatus: subscriptionData?.status,
    subscriptionPlanType: subscriptionData?.plan_type
  });

  if (!subscriptionData) {
    return (
      <Card className="mb-6 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-medium">Nenhuma assinatura ativa</h3>
              <p className="text-sm text-gray-600">
                Inicie um trial gratuito ou assine um plano para acessar os recursos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const isTrialing = subscriptionData.status === 'trialing';
  const isActive = subscriptionData.status === 'active';
  
  let statusText = '';
  let statusColor = '';
  let expiryDate = null;
  let displayPlan = plan;

  // ✅ Lógica corrigida de exibição do plano
  if (isTrialing && subscriptionData.trial_ends_at) {
    expiryDate = new Date(subscriptionData.trial_ends_at);
    const isExpired = expiryDate <= now;
    statusText = isExpired ? 'Trial Expirado' : 'Trial Premium Ativo';
    statusColor = isExpired ? 'text-red-600' : 'text-blue-600';
    displayPlan = 'Premium (Trial)'; // ✅ Trial sempre mostra Premium
  } else if (isActive) {
    if (subscriptionData.ends_at) {
      expiryDate = new Date(subscriptionData.ends_at);
      const isExpired = expiryDate <= now;
      statusText = isExpired ? 'Plano Expirado' : 'Plano Ativo';
      statusColor = isExpired ? 'text-red-600' : 'text-green-600';
    } else {
      statusText = 'Plano Ativo';
      statusColor = 'text-green-600';
    }
    
    // ✅ Garantir que o plano seja exibido corretamente baseado no plan_type
    const planTypeLower = subscriptionData.plan_type?.toLowerCase() || '';
    if (planTypeLower.includes('premium')) {
      displayPlan = 'Premium';
    } else if (planTypeLower.includes('essencial')) {
      displayPlan = 'Essencial';
    }
  }

  console.log('PlanStatusCard: Status calculado:', {
    isTrialing,
    isActive,
    statusText,
    displayPlan,
    expiryDate: expiryDate?.toISOString()
  });

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium flex items-center gap-2">
                Assinatura Atual
                <Badge variant="outline" className={statusColor}>
                  {statusText}
                </Badge>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Plano: <span className="font-medium">{displayPlan}</span>
                {isTrialing && (
                  <span className="text-xs text-blue-600 ml-2">
                    (Acesso completo ao Premium por 7 dias)
                  </span>
                )}
                {expiryDate && (
                  <>
                    <br />
                    {isTrialing ? 'Trial expira' : 'Renova'} em:{' '}
                    <span className="font-medium">
                      {format(expiryDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    {' '}({formatDistanceToNow(expiryDate, { locale: ptBR, addSuffix: true })})
                  </>
                )}
              </p>
            </div>
          </div>
          {subscriptionData.is_manual && (
            <Badge variant="secondary" className="text-xs">
              Manual
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanStatusCard;

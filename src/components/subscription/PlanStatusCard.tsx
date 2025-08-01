
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PlanStatusCardProps {
  subscriptionData: any;
  plan: string;
  planActive: boolean;
}

const PlanStatusCard: React.FC<PlanStatusCardProps> = ({ 
  subscriptionData, 
  plan, 
  planActive 
}) => {
  const getStatusIcon = () => {
    if (planActive) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (planActive) {
      return 'Ativo';
    }
    return 'Inativo';
  };

  const getStatusColor = () => {
    if (planActive) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (date: string) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Plano Atual:</span>
          <Badge variant="outline" className="font-medium">
            {plan}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {subscriptionData && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Início:</span>
              <span className="text-sm text-gray-600">
                {formatDate(subscriptionData.starts_at)}
              </span>
            </div>

            {subscriptionData.ends_at && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Fim:</span>
                <span className="text-sm text-gray-600">
                  {formatDate(subscriptionData.ends_at)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Tipo:</span>
              <span className="text-sm text-gray-600">
                {subscriptionData.is_manual ? 'Manual' : 'Automática'}
              </span>
            </div>
          </>
        )}

        {!planActive && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Seu plano está inativo. Entre em contato com o administrador para reativar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanStatusCard;

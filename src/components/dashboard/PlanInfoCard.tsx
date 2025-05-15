
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlanInfoCardProps = {
  planType: string | null;
};

const PlanInfoCard: React.FC<PlanInfoCardProps> = ({ planType }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Seu Plano</CardTitle>
        <CardDescription>Detalhes da sua assinatura</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Plano:</strong> {planType === 'premium' ? 'Premium' : 'Essencial'}</p>
          <p><strong>Status:</strong> Período de teste (7 dias)</p>
          <p className="text-green-600 font-medium">Sua assinatura está ativa!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanInfoCard;

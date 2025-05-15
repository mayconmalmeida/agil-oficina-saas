
import React from 'react';

interface PlanInfoBannerProps {
  plan: string;
  trialDays: number;
}

const PlanInfoBanner: React.FC<PlanInfoBannerProps> = ({ plan, trialDays }) => {
  return (
    <div className="p-4 bg-blue-50 rounded-md mb-4">
      <h3 className="text-lg font-medium text-blue-800">Plano Selecionado: {plan}</h3>
      <p className="text-sm text-blue-600">Você terá acesso a todos os recursos por {trialDays} dias grátis.</p>
    </div>
  );
};

export default PlanInfoBanner;


import React from 'react';

interface PlanInfoBannerProps {
  plan: string;
  trialDays: number;
}

const PlanInfoBanner: React.FC<PlanInfoBannerProps> = ({ plan, trialDays }) => {
  const monthlyPrice = plan === 'Premium' ? 'R$ 179,90' : 'R$ 89,90';
  const yearlyPrice = plan === 'Premium' ? 'R$ 1.799,00' : 'R$ 899,00';
  
  return (
    <div className="p-4 bg-blue-50 rounded-md mb-4">
      <h3 className="text-lg font-medium text-blue-800">Plano Selecionado: {plan}</h3>
      <p className="text-sm text-blue-600">Você terá acesso a todos os recursos por {trialDays} dias grátis.</p>
      <p className="text-sm text-blue-600 mt-1">
        Após o período de teste: {monthlyPrice}/mês ou {yearlyPrice}/ano (com 2 meses grátis).
      </p>
    </div>
  );
};

export default PlanInfoBanner;

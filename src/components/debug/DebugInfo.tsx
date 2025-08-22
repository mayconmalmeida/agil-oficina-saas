
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

const DebugInfo: React.FC = () => {
  const {
    hasPermission,
    isPremium,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  } = usePermissions();

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <p>Plano: {plan}</p>
        <p>Ativo: {planActive ? 'Sim' : 'Não'}</p>
        <p>É Premium: {isPremium ? 'Sim' : 'Não'}</p>
        <p>Pode acessar Premium: {canAccessPremiumFeatures ? 'Sim' : 'Não'}</p>
        <div>
          <p>Permissões: [{permissions.join(', ')}]</p>
        </div>
        <div>
          <p>Features disponíveis:</p>
          <ul className="ml-2">
            {getAvailableFeatures.map(feature => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <p>Features do plano:</p>
          <ul className="ml-2">
            {getPlanFeatures.map(feature => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;

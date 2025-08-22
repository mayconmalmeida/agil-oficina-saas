
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

const DebugInfo: React.FC = () => {
  const { user, plan, planActive, permissions } = useAuth();
  const { 
    hasPermission, 
    isPremium, 
    canAccessPremiumFeatures, 
    getAvailableFeatures, 
    getPlanFeatures 
  } = usePermissions();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs font-mono max-w-xs z-50">
      <div className="space-y-1">
        <p>Usuário: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
      <hr className="my-2 border-gray-600" />
      <div className="space-y-1">
        <p>Plano: {plan}</p>
        <p>Ativo: {planActive ? 'Sim' : 'Não'}</p>
        <p>É Premium: {isPremium() ? 'Sim' : 'Não'}</p>
        <p>Pode acessar Premium: {canAccessPremiumFeatures() ? 'Sim' : 'Não'}</p>
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
        <div>
          <p>Testes:</p>
          <p>IA: {hasPermission('diagnostico_ia') ? '✅' : '❌'}</p>
          <p>Marketing: {hasPermission('marketing_automatico') ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;

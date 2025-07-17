
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

const DebugInfo: React.FC = () => {
  const { user, plan, planActive, permissions, loading, isAdmin } = useAuth();
  const { isPremium, isEssencial, canAccessPremiumFeatures } = usePermissions();
  
  // Só mostra se tiver ?debug=true na URL
  if (!window.location.search.includes('debug=true')) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <div className="font-bold mb-2">🐛 Debug Auth Info</div>
      <div className="space-y-1">
        <div><strong>Email:</strong> {user?.email || 'Não logado'}</div>
        <div><strong>Loading:</strong> {loading ? '⏳' : '✅'}</div>
        <div><strong>Admin:</strong> {isAdmin ? '✅' : '❌'}</div>
        <div><strong>Plano:</strong> {plan || 'N/A'}</div>
        <div><strong>Ativo:</strong> {planActive ? '✅' : '❌'}</div>
        <div><strong>Premium:</strong> {isPremium() ? '✅' : '❌'}</div>
        <div><strong>Essencial:</strong> {isEssencial() ? '✅' : '❌'}</div>
        <div><strong>Acesso Premium:</strong> {canAccessPremiumFeatures() ? '✅' : '❌'}</div>
        <div><strong>Permissões ({permissions.length}):</strong></div>
        <div className="text-xs text-gray-300 max-h-20 overflow-y-auto">
          {permissions.length > 0 ? permissions.join(', ') : 'Nenhuma'}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;

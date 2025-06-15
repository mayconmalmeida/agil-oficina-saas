import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubscription } from '@/hooks/useSubscription';
import UserMenu from './UserMenu';
import NavigationLinks from './NavigationLinks';
import SubscriptionInfoCard from './SubscriptionInfoCard';

interface SidebarNavigationProps {
  onLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const { subscriptionStatus } = useSubscription();

  const handleNavigation = (href: string, isPremium?: boolean) => {
    if (isPremium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive) {
      return;
    }
    navigate(href);
  };

  return (
    <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200 h-full">
      <div className="flex items-center flex-shrink-0 px-4">
        <Link to="/" className="text-xl font-bold text-oficina-dark">
          Oficina<span className="text-oficina-accent">Ágil</span>
        </Link>
      </div>
      {/* Status da assinatura */}
      <div className="mt-4 px-4">
        <SubscriptionInfoCard subscriptionStatus={subscriptionStatus} />
      </div>
      {/* Navegação */}
      <NavigationLinks 
        subscriptionStatus={subscriptionStatus}
        onNavigate={handleNavigation}
      />
      {/* Usuário e logout */}
      <UserMenu 
        userProfile={userProfile}
        onLogout={onLogout}
      />
    </div>
  );
};

export default SidebarNavigation;

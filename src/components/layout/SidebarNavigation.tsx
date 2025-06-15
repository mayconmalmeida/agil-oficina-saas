
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Car, 
  Package, 
  Wrench, 
  Calendar, 
  FileText, 
  Settings,
  LogOut,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubscription } from '@/hooks/useSubscription';

interface SidebarNavigationProps {
  onLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const { subscriptionStatus } = useSubscription();
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Veículos', href: '/veiculos', icon: Car },
    { name: 'Produtos', href: '/produtos', icon: Package },
    { name: 'Serviços', href: '/servicos', icon: Wrench },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar, premium: true },
    { name: 'Orçamentos', href: '/orcamentos', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];
  const isActive = (path: string) => location.pathname === path;
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  {subscriptionStatus.planDetails?.name || 'Sem plano'}
                </div>
                {subscriptionStatus.isTrialActive && (
                  <div className="text-xs text-blue-600">
                    {subscriptionStatus.daysRemaining} dias restantes
                  </div>
                )}
              </div>
              {subscriptionStatus.isPremium && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Premium
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Navegação */}
      <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
        {navigation.map((item) => {
          const isItemActive = isActive(item.href);
          const isPremiumLocked = item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href, item.premium)}
              disabled={isPremiumLocked}
              className={`${
                isItemActive
                  ? 'bg-blue-100 text-blue-900'
                  : isPremiumLocked
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
            >
              <item.icon
                className={`${
                  isItemActive ? 'text-blue-500' : isPremiumLocked ? 'text-gray-300' : 'text-gray-400'
                } mr-3 flex-shrink-0 h-5 w-5`}
              />
              {item.name}
              {item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Premium
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
      {/* Usuário e logout */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4 mt-auto">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                {userProfile?.nome_oficina || 'Oficina'}
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 truncate">
                {userProfile?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="ml-2 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

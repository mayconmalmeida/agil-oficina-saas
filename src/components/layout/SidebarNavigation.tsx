
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  BarChart3,
  Building,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubscription } from '@/hooks/useSubscription';

interface SidebarNavigationProps {
  onLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const { userProfile } = useUserProfile();
  const { subscriptionStatus } = useSubscription();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Clientes', href: '/dashboard/clientes', icon: Users, current: location.pathname.startsWith('/dashboard/clientes') },
    { name: 'Veículos', href: '/dashboard/veiculos', icon: Car, current: location.pathname.startsWith('/dashboard/veiculos') },
    { name: 'Produtos', href: '/dashboard/produtos', icon: Package, current: location.pathname.startsWith('/dashboard/produtos') },
    { name: 'Serviços', href: '/dashboard/servicos', icon: Wrench, current: location.pathname.startsWith('/dashboard/servicos') },
    { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: Calendar, current: location.pathname.startsWith('/dashboard/agendamentos') },
    { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone, current: location.pathname.startsWith('/dashboard/marketing'), isPremium: true },
    { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText, current: location.pathname.startsWith('/dashboard/orcamento') },
    { name: 'Relatórios', href: '/dashboard/relatorios-basicos', icon: BarChart3, current: location.pathname.startsWith('/dashboard/relatorios') },
    { name: 'Empresa', href: '/dashboard/empresa', icon: Building, current: location.pathname.startsWith('/dashboard/empresa') },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings, current: location.pathname.startsWith('/dashboard/configuracoes') },
  ];

  const handleNavigation = (href: string, isPremium?: boolean) => {
    // Se é premium e usuário não tem plano premium, bloquear
    if (isPremium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive) {
      return;
    }
    window.location.href = href;
  };

  // Determinar o nome do plano atual
  const getCurrentPlanName = () => {
    if (subscriptionStatus.isPremium) return 'Premium';
    if (subscriptionStatus.isEssencial) return 'Essencial';
    return 'Gratuito';
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm">
      <div className="flex items-center justify-center h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">AutoGestão</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const isBlocked = item.isPremium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive;
          
          return (
            <Link
              key={item.name}
              to={isBlocked ? '#' : item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150
                ${item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : isBlocked 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              onClick={(e) => {
                if (isBlocked) {
                  e.preventDefault();
                }
              }}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${item.current ? 'text-blue-500' : isBlocked ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              <span className="flex-1">{item.name}</span>
              {item.isPremium && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4 border-t">
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-900 mb-1">
            {userProfile?.nome_oficina || 'Oficina'}
          </div>
          <div className="text-xs text-blue-700">
            Plano: {getCurrentPlanName()}
          </div>
          {subscriptionStatus.isTrialActive && (
            <div className="text-xs text-orange-600 mt-1">
              Trial: {subscriptionStatus.daysRemaining} dias restantes
            </div>
          )}
        </div>
        
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;

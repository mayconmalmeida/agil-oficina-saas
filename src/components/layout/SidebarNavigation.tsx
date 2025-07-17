
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
  Bot,
  BarChart3,
  CreditCard,
  MessageCircle,
  Shield,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Badge } from '@/components/ui/badge';

interface SidebarNavigationProps {
  onLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const { hasPermission, canAccessPremiumFeatures, isPremium } = usePermissions();

  const navigationItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      permission: null
    },
    {
      href: '/dashboard/clientes',
      icon: Users,
      label: 'Clientes',
      permission: 'clientes'
    },
    {
      href: '/dashboard/orcamentos',
      icon: FileText,
      label: 'Orçamentos',
      permission: 'orcamentos'
    },
    {
      href: '/dashboard/servicos',
      icon: Wrench,
      label: 'Serviços',
      permission: 'servicos'
    },
    {
      href: '/dashboard/produtos',
      icon: Package,
      label: 'Produtos',
      permission: 'produtos'
    },
    {
      href: '/dashboard/veiculos',
      icon: Car,
      label: 'Veículos',
      permission: 'veiculos'
    },
    {
      href: '/dashboard/agendamentos',
      icon: Calendar,
      label: 'Agendamentos',
      permission: 'agendamentos',
      isPremium: true
    },
    {
      href: '/dashboard/ia-diagnostico',
      icon: Bot,
      label: 'IA Diagnóstico',
      permission: 'diagnostico_ia',
      isPremium: true
    },
    {
      href: '/dashboard/ia-suporte-inteligente',
      icon: MessageCircle,
      label: 'IA Suporte',
      permission: 'suporte_prioritario',
      isPremium: true
    },
    {
      href: '/dashboard/relatorios',
      icon: BarChart3,
      label: 'Relatórios',
      permission: 'relatorios_avancados',
      isPremium: true
    },
    {
      href: '/dashboard/integracao-contabil',
      icon: Database,
      label: 'Integração Contábil',
      permission: 'integracao_contabil',
      isPremium: true
    },
    {
      href: '/dashboard/backup',
      icon: Shield,
      label: 'Backup',
      permission: 'backup',
      isPremium: true
    },
    {
      href: '/dashboard/assinatura',
      icon: CreditCard,
      label: 'Assinatura',
      permission: null
    },
    {
      href: '/dashboard/configuracoes',
      icon: Settings,
      label: 'Configurações',
      permission: 'configuracoes'
    }
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const canAccessItem = (item: any) => {
    if (!item.permission) return true;
    if (item.isPremium && !canAccessPremiumFeatures()) return false;
    return hasPermission(item.permission);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="hidden lg:block text-xl font-bold text-gray-900">Oficina Go</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = isCurrentPath(item.href);
          const canAccess = canAccessItem(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : canAccess
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed opacity-60'
                }
                ${!canAccess ? 'pointer-events-none' : ''}
              `}
            >
              <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700' : ''}`} />
              <span className="truncate">{item.label}</span>
              {item.isPremium && !isPremium() && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Premium
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;

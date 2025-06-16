
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
  BarChart3,
  Building2,
  Crown,
  Shield,
  Megaphone,
  Calculator,
  Archive,
  Mail,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { Badge } from '@/components/ui/badge';

interface SidebarNavigationProps {
  onLogout: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diasRestantes, isPremiumTrial, isExpired } = useDaysRemaining();
  
  // Verificar se tem acesso premium (admin ou trial ativo)
  const hasPremiumAccess = user?.role === 'admin' || user?.role === 'superadmin' || (isPremiumTrial && diasRestantes > 0);

  const essentialMenuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      current: location.pathname === '/dashboard',
      premium: false
    },
    { 
      name: 'Clientes', 
      href: '/dashboard/clientes', 
      icon: Users, 
      current: location.pathname.startsWith('/dashboard/clientes'),
      premium: false
    },
    { 
      name: 'Veículos', 
      href: '/dashboard/veiculos', 
      icon: Car, 
      current: location.pathname.startsWith('/dashboard/veiculos'),
      premium: false
    },
    { 
      name: 'Produtos', 
      href: '/dashboard/produtos', 
      icon: Package, 
      current: location.pathname.startsWith('/dashboard/produtos'),
      premium: false
    },
    { 
      name: 'Serviços', 
      href: '/dashboard/servicos', 
      icon: Wrench, 
      current: location.pathname.startsWith('/dashboard/servicos'),
      premium: false
    },
    { 
      name: 'Orçamentos', 
      href: '/dashboard/orcamentos', 
      icon: FileText, 
      current: location.pathname.startsWith('/dashboard/orcamentos'),
      premium: false
    },
    { 
      name: 'Categorias', 
      href: '/dashboard/categorias', 
      icon: Archive, 
      current: location.pathname.startsWith('/dashboard/categorias'),
      premium: false
    },
    { 
      name: 'Fornecedores', 
      href: '/dashboard/fornecedores', 
      icon: Building2, 
      current: location.pathname.startsWith('/dashboard/fornecedores'),
      premium: false
    },
    { 
      name: 'Relatórios Básicos', 
      href: '/dashboard/relatorios-basicos', 
      icon: BarChart3, 
      current: location.pathname.startsWith('/dashboard/relatorios-basicos'),
      premium: false
    }
  ];

  const premiumMenuItems = [
    { 
      name: 'Agendamentos', 
      href: '/dashboard/agendamentos', 
      icon: Calendar, 
      current: location.pathname.startsWith('/dashboard/agendamentos'),
      premium: true
    },
    { 
      name: 'Marketing', 
      href: '/dashboard/marketing', 
      icon: Megaphone, 
      current: location.pathname.startsWith('/dashboard/marketing'),
      premium: true
    },
    { 
      name: 'Contabilidade', 
      href: '/dashboard/contabilidade', 
      icon: Calculator, 
      current: location.pathname.startsWith('/dashboard/contabilidade'),
      premium: true
    },
    { 
      name: 'Relatórios Avançados', 
      href: '/dashboard/relatorios-avancados', 
      icon: BarChart3, 
      current: location.pathname.startsWith('/dashboard/relatorios-avancados'),
      premium: true
    },
    { 
      name: 'IA Suporte', 
      href: '/dashboard/ia-suporte', 
      icon: Shield, 
      current: location.pathname.startsWith('/dashboard/ia-suporte'),
      premium: true
    },
    { 
      name: 'Backup', 
      href: '/dashboard/backup', 
      icon: Archive, 
      current: location.pathname.startsWith('/dashboard/backup'),
      premium: true
    }
  ];

  const configMenuItems = [
    { 
      name: 'Empresa', 
      href: '/dashboard/empresa', 
      icon: Building2, 
      current: location.pathname.startsWith('/dashboard/empresa'),
      premium: false
    },
    { 
      name: 'Configurações', 
      href: '/dashboard/configuracoes', 
      icon: Settings, 
      current: location.pathname.startsWith('/dashboard/configuracoes'),
      premium: false
    }
  ];

  const handleMenuClick = (href: string, isPremium: boolean) => {
    if (isPremium && !hasPremiumAccess) {
      // Não navegar se for premium e usuário não tem acesso
      return;
    }
    navigate(href);
  };

  const renderMenuItem = (item: any) => {
    const canAccess = !item.premium || hasPremiumAccess;
    
    return (
      <li key={item.name}>
        <button
          onClick={() => handleMenuClick(item.href, item.premium)}
          disabled={item.premium && !hasPremiumAccess}
          className={`
            group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-left
            ${item.current 
              ? 'bg-gray-100 text-gray-900' 
              : canAccess 
                ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                : 'text-gray-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          <item.icon
            className={`mr-3 h-5 w-5 flex-shrink-0 ${
              item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
            }`}
          />
          <span className="flex-1">{item.name}</span>
          {item.premium && !hasPremiumAccess && (
            <Crown className="h-4 w-4 text-yellow-600 ml-2" />
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AutoFlow</h1>
      </div>

      {/* Plan Status */}
      <div className="p-4 border-b border-gray-200">
        {user?.role === 'admin' || user?.role === 'superadmin' ? (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Admin</span>
          </div>
        ) : isPremiumTrial && diasRestantes > 0 ? (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Crown className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-blue-800">Trial Premium</span>
              <p className="text-xs text-blue-600">{diasRestantes} dias restantes</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Plano Essencial</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-6">
          {/* Essential Features */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recursos Essenciais
            </h3>
            <ul className="space-y-1">
              {essentialMenuItems.map(renderMenuItem)}
            </ul>
          </div>

          {/* Premium Features */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              Recursos Premium
              {!hasPremiumAccess && <Crown className="h-3 w-3 text-yellow-600" />}
            </h3>
            <ul className="space-y-1">
              {premiumMenuItems.map(renderMenuItem)}
            </ul>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Configurações
            </h3>
            <ul className="space-y-1">
              {configMenuItems.map(renderMenuItem)}
            </ul>
          </div>
        </nav>
      </div>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

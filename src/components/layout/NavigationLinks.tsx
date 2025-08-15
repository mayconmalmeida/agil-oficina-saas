
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Users,
  FileText,
  Wrench,
  Package,
  BarChart3,
  Settings,
  Building2,
  Layers,
  UserPlus,
  Bot,
  HardDrive,
  LifeBuoy,
  FileX,
  TrendingUp,
  Car
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';

interface NavigationLinksProps {
  subscriptionStatus: any;
  onNavigate: (href: string, isPremium?: boolean) => void;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ 
  subscriptionStatus, 
  onNavigate 
}) => {
  const location = useLocation();
  const { isPremiumTrial, diasRestantes } = useDaysRemaining();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
    { name: 'Veículos', href: '/dashboard/veiculos', icon: Car },
    { name: 'Serviços', href: '/dashboard/servicos', icon: Wrench },
    { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText },
    { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: Calendar },
    { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
    { name: 'Categorias', href: '/dashboard/categorias', icon: Layers },
    { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: UserPlus },
    { name: 'Empresa', href: '/dashboard/empresa', icon: Building2 },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ];

  const premiumFeatures = [
    { 
      name: 'Relatórios Avançados', 
      href: '/dashboard/relatorios-avancados', 
      icon: TrendingUp,
      isPremium: true 
    },
    { 
      name: 'Integração Contábil', 
      href: '/dashboard/integracao-contabil', 
      icon: FileX,
      isPremium: true 
    },
    { 
      name: 'IA Diagnóstico', 
      href: '/dashboard/ia-diagnostico', 
      icon: Bot,
      isPremium: true 
    },
    { 
      name: 'IA Suporte Inteligente', 
      href: '/dashboard/ia-suporte-inteligente', 
      icon: Bot,
      isPremium: true 
    },
    { 
      name: 'Backup Automático', 
      href: '/dashboard/backup', 
      icon: HardDrive,
      isPremium: true 
    },
    { 
      name: 'Suporte Premium', 
      href: '/dashboard/suporte', 
      icon: LifeBuoy,
      isPremium: true 
    },
  ];

  const renderNavigationItem = (item: any) => {
    const isActive = location.pathname === item.href;
    
    // NOVA LÓGICA: Durante trial de 7 dias, usuário tem acesso premium
    const isAccessible = !item.isPremium || 
                        subscriptionStatus.isPremium || 
                        (isPremiumTrial && diasRestantes > 0);

    console.log('NavigationLinks: Item:', item.name, {
      isPremium: item.isPremium,
      hasSubscriptionPremium: subscriptionStatus.isPremium,
      isPremiumTrial,
      diasRestantes,
      isAccessible
    });

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={(e) => {
          if (!isAccessible) {
            e.preventDefault();
            onNavigate(item.href, item.isPremium);
          }
        }}
        className={cn(
          'group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-oficina text-white'
            : isAccessible
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
        )}
      >
        <item.icon
          className={cn(
            'mr-3 flex-shrink-0 h-5 w-5',
            isActive
              ? 'text-white'
              : isAccessible
                ? 'text-gray-500 group-hover:text-gray-700'
                : 'text-gray-300'
          )}
          aria-hidden="true"
        />
        <span className="flex-1">{item.name}</span>
        {item.isPremium && !isAccessible && (
          <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            Premium
          </Badge>
        )}
        {item.isPremium && isAccessible && isPremiumTrial && (
          <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-300">
            Trial
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {/* Navegação Principal */}
      <div className="space-y-1">
        {navigation.map(renderNavigationItem)}
      </div>

      {/* Recursos Premium */}
      <div className="pt-6">
        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recursos Premium
            {isPremiumTrial && diasRestantes > 0 && (
              <span className="ml-2 text-green-600">(Trial Ativo)</span>
            )}
          </h3>
        </div>
        <div className="space-y-1">
          {premiumFeatures.map(renderNavigationItem)}
        </div>
      </div>
    </nav>
  );
};

export default NavigationLinks;

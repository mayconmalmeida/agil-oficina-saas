
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Wrench,
  Package,
  Layers,
  Calendar,
  ClipboardList,
  Truck,
  Building2,
  Brain,
  MessageCircle,
  Headphones,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mainNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Visão geral do sistema'
  },
];

const businessNavigation = [
  { 
    name: 'Clientes', 
    href: '/dashboard/clientes', 
    icon: Users,
    description: 'Gerenciar clientes'
  },
  { 
    name: 'Veículos', 
    href: '/dashboard/veiculos', 
    icon: Car,
    description: 'Cadastro de veículos'
  },
  { 
    name: 'Orçamentos', 
    href: '/dashboard/orcamentos', 
    icon: FileText,
    description: 'Criar e gerenciar orçamentos'
  },
  { 
    name: 'Serviços', 
    href: '/dashboard/servicos', 
    icon: Wrench,
    description: 'Catálogo de serviços'
  },
  { 
    name: 'Produtos', 
    href: '/dashboard/produtos', 
    icon: Package,
    description: 'Estoque e produtos'
  },
  { 
    name: 'Categorias', 
    href: '/dashboard/categorias', 
    icon: Layers,
    description: 'Organizar por categorias'
  },
];

const operationalNavigation = [
  { 
    name: 'Agendamentos', 
    href: '/dashboard/agendamentos', 
    icon: Calendar,
    description: 'Agenda de serviços'
  },
  { 
    name: 'Ordem de Serviço', 
    href: '/dashboard/ordem-servico', 
    icon: ClipboardList,
    description: 'Controle de OS'
  },
  { 
    name: 'Fornecedores', 
    href: '/dashboard/fornecedores', 
    icon: Truck,
    description: 'Rede de fornecedores'
  },
];

const intelligenceNavigation = [
  { 
    name: 'IA Diagnóstico', 
    href: '/dashboard/ia-diagnostico', 
    icon: Brain,
    description: 'Diagnóstico inteligente',
    isPremium: true
  },
  { 
    name: 'IA Suporte', 
    href: '/dashboard/ia-suporte-inteligente', 
    icon: MessageCircle,
    description: 'Assistente inteligente',
    isPremium: true
  },
];

const managementNavigation = [
  { 
    name: 'Empresa', 
    href: '/dashboard/empresa', 
    icon: Building2,
    description: 'Dados da empresa'
  },
  { 
    name: 'Relatórios', 
    href: '/dashboard/relatorios', 
    icon: BarChart3,
    description: 'Análises e relatórios'
  },
  { 
    name: 'Suporte', 
    href: '/dashboard/suporte', 
    icon: Headphones,
    description: 'Central de ajuda'
  },
  { 
    name: 'Configurações', 
    href: '/dashboard/configuracoes', 
    icon: Settings,
    description: 'Ajustes do sistema'
  },
];

interface DashboardSidebarProps {
  onLogout: () => void;
  onNavigate?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onLogout, onNavigate }) => {
  const location = useLocation();

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const renderNavigationSection = (title: string, items: any[], showPremiumBadge = false) => (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
          {showPremiumBadge && (
            <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none">
              Premium
            </Badge>
          )}
        </h3>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || 
                         (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
        
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={handleNavClick}
            className={cn(
              'group flex items-center justify-between w-full px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <div className="flex items-center space-x-3">
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              )} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.name}</span>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.description}
                </span>
              </div>
            </div>
            {item.isPremium && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                Pro
              </Badge>
            )}
            {isActive && (
              <ChevronRight className="h-4 w-4 text-white" />
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Oficina Go</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {renderNavigationSection('Principal', mainNavigation)}
        
        <Separator className="my-4" />
        {renderNavigationSection('Negócio', businessNavigation)}
        
        <Separator className="my-4" />
        {renderNavigationSection('Operacional', operationalNavigation)}
        
        <Separator className="my-4" />
        {renderNavigationSection('Inteligência', intelligenceNavigation, true)}
        
        <Separator className="my-4" />
        {renderNavigationSection('Gestão', managementNavigation)}
      </nav>

      {/* Subscription info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <NavLink
          to="/dashboard/assinatura"
          onClick={handleNavClick}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-600"
        >
          <CreditCard className="h-5 w-5" />
          <div>
            <span className="font-medium">Minha Assinatura</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciar plano</p>
          </div>
        </NavLink>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <div className="text-left">
            <span className="font-medium">Sair</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Encerrar sessão</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;

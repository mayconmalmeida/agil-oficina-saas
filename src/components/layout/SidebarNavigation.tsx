import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Car,
  Calendar,
  Brain,
  MessageCircle,
  BarChart3,
  Package,
  Building2,
  LogOut,
  CreditCard,
  ClipboardList,
  Truck,
  Layers,
  Headphones,
  Wrench,
  TrendingUp,
  FileX,
  HardDrive,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const mainNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
];

const clientsAndVehiclesItems = [
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car },
];

const servicesAndBudgetsItems = [
  { name: 'Serviços', href: '/dashboard/servicos', icon: Wrench },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText },
  { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: Calendar },
  { name: 'Ordem de Serviço', href: '/dashboard/ordem-servico', icon: ClipboardList },
];

const financialItems = [
  { name: 'Financeiro', href: '/dashboard/financeiro', icon: TrendingUp },
];

const inventoryItems = [
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Categorias', href: '/dashboard/categorias', icon: Layers },
  { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Truck },
];

const reportsItems = [
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { name: 'Relatórios Avançados', href: '/dashboard/relatorios-avancados', icon: TrendingUp, isPremium: true },
];

const businessItems = [
  { name: 'Empresa', href: '/dashboard/empresa', icon: Building2 },
  { name: 'Integração Contábil', href: '/dashboard/integracao-contabil', icon: FileX, isPremium: true },
];

const aiItems = [
  { name: 'IA Diagnóstico', href: '/dashboard/ia-diagnostico', icon: Brain, isPremium: true },
  { name: 'IA Suporte', href: '/dashboard/ia-suporte-inteligente', icon: MessageCircle, isPremium: true },
];

const supportItems = [
  { name: 'Suporte', href: '/dashboard/suporte', icon: Headphones },
  { name: 'Backup Automático', href: '/dashboard/backup', icon: HardDrive, isPremium: true },
];

const configItems = [
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

interface SidebarNavigationProps {
  onLogout: () => void;
  onNavigate?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout, onNavigate }) => {
  const location = useLocation();
  const { subscriptionStatus } = useSubscription();
  
  const [isClientsOpen, setIsClientsOpen] = useState(true);
  const [isServicesOpen, setIsServicesOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(true);

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const renderNavigationItem = (item: any) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href || 
                   (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
    
    return (
      <NavLink
        key={item.name}
        to={item.href}
        onClick={handleNavClick}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive 
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        )}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span>{item.name}</span>
        </div>
        {item.isPremium && (
          <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600">
            Premium
          </Badge>
        )}
      </NavLink>
    );
  };

  const renderCollapsibleSection = (title: string, items: any[], isOpen: boolean, setIsOpen: (open: boolean) => void) => (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <span>{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 ml-2">
        {items.map(renderNavigationItem)}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">Oficina Go</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Main Dashboard */}
        <div className="space-y-1">
          {mainNavigationItems.map(renderNavigationItem)}
        </div>

        {/* Clients & Vehicles */}
        {renderCollapsibleSection('Clientes & Veículos', clientsAndVehiclesItems, isClientsOpen, setIsClientsOpen)}

        {/* Services & Budgets */}
        {renderCollapsibleSection('Serviços & Orçamentos', servicesAndBudgetsItems, isServicesOpen, setIsServicesOpen)}

        {/* Financial */}
        {renderCollapsibleSection('Financeiro', financialItems, true, () => {})}

        {/* Inventory */}
        {renderCollapsibleSection('Estoque & Fornecedores', inventoryItems, isInventoryOpen, setIsInventoryOpen)}

        {/* Reports */}
        {renderCollapsibleSection('Relatórios', reportsItems, isReportsOpen, setIsReportsOpen)}

        {/* Business */}
        {renderCollapsibleSection('Empresa & Integração', businessItems, isBusinessOpen, setIsBusinessOpen)}

        {/* AI Features */}
        {renderCollapsibleSection('Inteligência Artificial', aiItems, isAiOpen, setIsAiOpen)}

        {/* Support */}
        {renderCollapsibleSection('Suporte & Backup', supportItems, isSupportOpen, setIsSupportOpen)}

        {/* Configuration */}
        <div className="space-y-1">
          {configItems.map(renderNavigationItem)}
        </div>
      </nav>

      {/* Subscription info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to="/dashboard/assinatura"
          onClick={handleNavClick}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          <CreditCard className="h-5 w-5" />
          <span>Assinatura</span>
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
          Sair
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;

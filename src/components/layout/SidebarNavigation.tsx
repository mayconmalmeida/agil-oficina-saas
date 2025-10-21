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
  ChevronRight,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';

const mainNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Gerar Etiqueta', href: '/dashboard/gerar-etiqueta', icon: QrCode },
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
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton asChild isActive={isActive}>
          <NavLink
            to={item.href}
            onClick={handleNavClick}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.isPremium && (
              <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                Premium
              </Badge>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderCollapsibleSection = (title: string, items: any[], isOpen: boolean, setIsOpen: (open: boolean) => void) => (
    <SidebarGroup>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 cursor-pointer">
            <span>{title}</span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );

  return (
    <>
      {/* Logo */}
      <SidebarHeader>
        <div className="flex items-center space-x-2 p-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg text-gray-900 group-data-[collapsible=icon]:hidden">Oficina Go</span>
        </div>
      </SidebarHeader>
      
      {/* Navigation */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Main Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>

      {/* Footer with Subscription and Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard/assinatura"
                onClick={handleNavClick}
                className="flex items-center space-x-3"
              >
                <CreditCard className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Assinatura</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
};

export default SidebarNavigation;

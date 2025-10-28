
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Package, 
  Wrench, 
  ClipboardList, 
  DollarSign,
  BarChart3,
  Settings,
  Building2,
  Truck,
  Brain,
  Stethoscope,
  UserPlus,
  QrCode,
  Database,
  CreditCard,
  LifeBuoy
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Agenda',
      href: '/agenda',
      icon: Calendar,
    },
    {
      name: 'Clientes',
      href: '/clientes',
      icon: Users,
    },
    {
      name: 'Produtos',
      href: '/produtos',
      icon: Package,
    },
    {
      name: 'Serviços',
      href: '/servicos',
      icon: Wrench,
    },
    {
      name: 'Orçamentos',
      href: '/orcamentos',
      icon: FileText,
    },
    {
      name: 'Ordens de Serviço',
      href: '/ordens-servico',
      icon: ClipboardList,
    },
    {
      name: 'Gerar Etiqueta',
      href: '/dashboard/gerar-etiqueta',
      icon: QrCode,
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign,
    },
    // Integração Contábil abaixo de Financeiro
    {
      name: 'Integração Contábil',
      href: '/dashboard/integracao-contabil',
      icon: Database,
    },
    {
      name: 'Fornecedores',
      href: '/dashboard/fornecedores',
      icon: Truck,
    },

    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3,
    },
    {
      name: 'IA Diagnóstico',
      href: '/dashboard/ia-diagnostico',
      icon: Stethoscope,
    },
    {
      name: 'IA Suporte',
      href: '/dashboard/ia-suporte-inteligente',
      icon: Brain,
    },
    {
      name: 'Empresa',
      href: '/dashboard/empresa',
      icon: Building2,
    },
    {
      name: 'Planos',
      href: '/dashboard/assinatura',
      icon: CreditCard,
    },
    {
      name: 'Ajuda',
      href: '/dashboard/ajuda',
      icon: LifeBuoy,
    },
    {
      name: 'Perfil & Configurações',
      href: '/dashboard/perfil',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <img src="/oficinago-logo-backup.png" alt="OficinaGO" className="h-8 w-auto" />
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
        <nav>
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                               (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive: navActive }) => `
                      flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 
                      ${navActive || isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={(e) => {
                      // Prevent any event bubbling that might cause issues
                      e.stopPropagation();
                    }}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;

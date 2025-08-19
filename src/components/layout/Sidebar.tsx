
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
  FolderOpen,
  Brain,
  Stethoscope,
  UserPlus,
  Factory
} from 'lucide-react';

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
      name: 'Estoque',
      href: '/estoque',
      icon: Factory,
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign,
    },
    {
      name: 'Fornecedores',
      href: '/dashboard/fornecedores',
      icon: Truck,
    },
    {
      name: 'Colaboradores',
      href: '/colaboradores',
      icon: UserPlus,
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
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">OficinaGO</h1>
      </div>
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

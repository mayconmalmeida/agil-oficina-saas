import React from 'react';
import {
  Home,
  Calendar,
  Users,
  Wrench,
  FileText,
  ClipboardList,
  Package,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const Sidebar: React.FC = () => {
  const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Serviços', href: '/servicos', icon: Wrench },
    { name: 'Orçamentos', href: '/orcamentos', icon: FileText },
    { name: 'Ordens de Serviço', href: '/ordens-servico', icon: ClipboardList },
    { name: 'Estoque', href: '/estoque', icon: Package },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Colaboradores', href: '/colaboradores', icon: Users },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-lg font-semibold">Logo</span>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900',
                    isActive ? 'bg-gray-200 text-gray-900' : ''
                  )
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;


import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  Settings,
  Package,
  BarChart3,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clientes',
    },
    {
      icon: UserCheck,
      label: 'Colaboradores',
      path: '/colaboradores',
    },
    {
      icon: FileText,
      label: 'Ordens de Serviço',
      path: '/ordens-servico',
    },
    {
      icon: Package,
      label: 'Estoque',
      path: '/estoque',
    },
    {
      icon: Calendar,
      label: 'Agendamentos',
      path: '/agendamentos',
    },
    {
      icon: DollarSign,
      label: 'Financeiro',
      path: '/financeiro',
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      path: '/relatorios',
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">OficinaÁgil</h1>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

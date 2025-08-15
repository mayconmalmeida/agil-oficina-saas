import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Calendar,
  Bot,
  MessageCircle,
  CreditCard,
  Settings,
  ClipboardList,
  Headphones
} from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Wrench, label: 'Serviços', path: '/dashboard/services' },
    { icon: FileText, label: 'Orçamentos', path: '/dashboard/budgets' },
    { icon: Calendar, label: 'Agendamentos', path: '/dashboard/scheduling' },
    { icon: ClipboardList, label: 'Ordem de Serviço', path: '/dashboard/ordem-servico' },
    { icon: Bot, label: 'IA Diagnóstico', path: '/dashboard/ia-diagnostico' },
    { icon: MessageCircle, label: 'IA Suporte', path: '/dashboard/ia-suporte' },
    { icon: Headphones, label: 'IA Suporte Inteligente', path: '/dashboard/ia-suporte-inteligente' },
    { icon: CreditCard, label: 'Assinatura', path: '/dashboard/assinatura' },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-lg font-semibold">Oficina Ágil</span>
      </div>
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 hover:text-gray-900',
                location.pathname === item.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-700'
              )}
            >
              <item.icon
                className={cn(
                  'mr-2 h-4 w-4',
                  location.pathname === item.path ? 'text-gray-900' : 'text-gray-500'
                )}
              />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {user && (
        <div className="p-4 border-t border-gray-200">
          <Link to="/dashboard/settings" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 hover:text-gray-900 text-gray-700">
            <Settings className="mr-2 h-4 w-4 text-gray-500" />
            Configurações
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

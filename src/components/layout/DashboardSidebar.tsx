
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Building2,
  BarChart3,
  Package,
  Car,
  Truck
} from 'lucide-react';

const DashboardSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clientes' },
    { icon: FileText, label: 'Orçamentos', path: '/dashboard/orcamentos' },
    { icon: Wrench, label: 'Serviços', path: '/dashboard/servicos' },
    { icon: Package, label: 'Produtos', path: '/dashboard/produtos' },
    { icon: Car, label: 'Veículos', path: '/dashboard/veiculos' },
    { icon: Calendar, label: 'Agendamentos', path: '/dashboard/agendamentos' },
    { icon: ClipboardList, label: 'Ordem de Serviço', path: '/dashboard/ordem-servico' },
    { icon: Truck, label: 'Fornecedores', path: '/dashboard/fornecedores' },
    { icon: Bot, label: 'IA Diagnóstico', path: '/dashboard/ia-diagnostico' },
    { icon: MessageCircle, label: 'IA Suporte', path: '/dashboard/ia-suporte-inteligente' },
    { icon: BarChart3, label: 'Relatórios', path: '/dashboard/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/configuracoes' },
    { icon: CreditCard, label: 'Assinatura', path: '/dashboard/assinatura' },
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-lg font-semibold text-blue-600">Oficina Ágil</span>
      </div>
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900',
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  location.pathname === item.path ? 'text-blue-700' : 'text-gray-500'
                )}
              />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;

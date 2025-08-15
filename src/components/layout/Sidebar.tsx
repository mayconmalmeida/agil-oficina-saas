
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
  ClipboardList,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Settings },
  { name: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { name: 'Veículos', href: '/dashboard/veiculos', icon: Car },
  { name: 'Agendamentos', href: '/dashboard/agendamentos', icon: Calendar },
  { name: 'Ordem de Serviço', href: '/dashboard/ordem-servico', icon: ClipboardList },
  { name: 'Fornecedores', href: '/dashboard/fornecedores', icon: Building2 },
  { name: 'IA Diagnóstico', href: '/dashboard/ia-diagnostico', icon: Brain },
  { name: 'IA Suporte', href: '/dashboard/ia-suporte-inteligente', icon: MessageCircle },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { name: 'Assinatura', href: '/dashboard/assinatura', icon: CreditCard },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg">Oficina Go</span>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

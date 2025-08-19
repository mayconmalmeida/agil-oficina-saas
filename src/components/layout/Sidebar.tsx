
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FileText, 
  Wrench, 
  Settings, 
  Package, 
  BarChart3,
  Calendar,
  DollarSign,
  UserPlus,
  Warehouse
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      title: 'Clientes',
      href: '/clientes',
      icon: Users
    },
    {
      title: 'Orçamentos',
      href: '/orcamentos',
      icon: FileText
    },
    {
      title: 'Ordens de Serviço',
      href: '/ordens-servico',
      icon: Wrench
    },
    {
      title: 'Produtos/Serviços',
      href: '/products',
      icon: Package
    },
    {
      title: 'Estoque',
      href: '/estoque',
      icon: Warehouse
    },
    {
      title: 'Colaboradores',
      href: '/colaboradores',
      icon: UserPlus
    },
    {
      title: 'Agendamentos',
      href: '/agendamentos',
      icon: Calendar
    },
    {
      title: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign
    },
    {
      title: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3
    },
    {
      title: 'Configurações',
      href: '/settings',
      icon: Settings
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  Car, 
  Package, 
  Wrench, 
  CalendarDays, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, isActive }) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 mb-1",
          isActive && "bg-accent text-accent-foreground"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: Car, label: "Veículos", href: "/veiculos" },
    { icon: Package, label: "Produtos", href: "/produtos" },
    { icon: Wrench, label: "Serviços", href: "/servicos" },
    { icon: CalendarDays, label: "Agendamentos", href: "/agendamentos" },
    { icon: FileText, label: "Orçamentos", href: "/orcamentos" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0" // Always show on large screens
      )}>
        <div className="p-4">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-oficina-dark">
              Oficina<span className="text-oficina-accent">Ágil</span>
            </h2>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive(item.href)}
              />
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
      
      {/* Background overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <Toaster />
    </div>
  );
};

export default DashboardLayout;

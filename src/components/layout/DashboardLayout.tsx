
import React, { useState, useEffect } from 'react';
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

interface DashboardLayoutProps {
  children: React.ReactNode;
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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Use localStorage to remember sidebar state between page refreshes
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const location = useLocation();
  
  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: Car, label: "Veículos", href: "/veiculos" },
    { icon: Package, label: "Produtos", href: "/produtos" },
    { icon: Wrench, label: "Serviços", href: "/servicos" },
    { icon: CalendarDays, label: "Agendamentos", href: "/agendamentos" },
    { icon: FileText, label: "Orçamentos", href: "/orcamentos" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label="Toggle menu">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0" // Always show on large screens
      )}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">
              Oficina<span className="text-oficina-accent">Ágil</span>
            </h2>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto">
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
        "lg:ml-64" // Always offset content on large screens
      )}>
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </div>
      </div>
      
      {/* Background overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <Toaster />
    </div>
  );
};

export default DashboardLayout;

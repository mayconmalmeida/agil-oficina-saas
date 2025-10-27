
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Building,
  Cog,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tema global para o painel admin
function useAdminThemeSync() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("admin-theme") as "light" | "dark") || "light"
  );

  // Aplicar tema ao <html> quando o componente for montado ou o tema mudar
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  // Sincronizar mudanças de tema entre abas
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "admin-theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue as "light" | "dark");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("admin-theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}

const OptimizedAdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.nome_oficina || user?.email || 'Admin';

  // Aplicar o tema global do admin
  const { theme } = useAdminThemeSync();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Gerenciar Oficinas',
      href: '/admin/oficinas',
      icon: Building,
    },
    {
      name: 'Gerenciar Planos',
      href: '/admin/plans',
      icon: BarChart3,
    },
    {
      name: 'Gerenciar Assinaturas',
      href: '/admin/subscriptions',
      icon: CreditCard,
    },
    {
      name: 'Gerenciar Clientes',
      href: '/admin/clients',
      icon: Users,
    },
    {
      name: 'Configurações Globais',
      href: '/admin/configuracoes',
      icon: Cog,
    },
    {
      name: 'Monitoramento do Sistema',
      href: '/admin/monitoring',
      icon: Activity,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 🔥 SIDEBAR FIXA À ESQUERDA - Desktop */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg border-r border-gray-200">
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <img src="/oficinago-logo-backup.png" alt="OficinaGO" className="h-10 w-auto" />
          </div>
          
          {/* 🔥 BOTÕES VERTICAIS NA SIDEBAR */}
          <nav className="mt-6 px-4 flex-1">
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer da Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {displayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.nome_oficina || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 RESPONSIVIDADE - Mobile/Tablet: Sidebar no topo */}
      <div className="lg:hidden w-full flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <img src="/oficinago-logo-backup.png" alt="OficinaGO" className="h-8 w-auto" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 🔥 GRID RESPONSIVO: Mobile (1 coluna), Tablet (2 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 🔥 CONTEÚDO PRINCIPAL - Mobile/Tablet */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* 🔥 CONTEÚDO PRINCIPAL - Desktop (flex-1) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OptimizedAdminLayout;

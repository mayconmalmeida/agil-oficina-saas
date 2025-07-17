
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminContext } from '@/contexts/AdminContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard
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
  const { user, signOut } = useAdminContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Aplicar o tema global do admin
  const { theme } = useAdminThemeSync();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      title: 'Oficinas',
      href: '/admin/users',
      icon: Users
    },
    {
      title: 'Assinaturas',
      href: '/admin/subscriptions',
      icon: BarChart3
    },
    {
      title: 'Planos',
      href: '/admin/plans',
      icon: CreditCard
    },
    {
      title: 'Configurações',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Oficina Ágil</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Painel Admin</p>
          </div>
          
          <nav className="mt-6 px-4 flex-1">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.title}
                </Link>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="dark:text-gray-300 dark:hover:text-white">
                <LogOut className="h-4 w-4" />
                <span className="ml-1 hidden lg:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Oficina Ágil</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="ml-2 dark:text-gray-300 dark:hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-1">Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 md:hidden sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">Painel Admin</h1>
            </div>
            
            <Button variant="ghost" size="sm" onClick={signOut} className="dark:text-gray-300 dark:hover:text-white">
              <LogOut className="h-4 w-4" />
              <span className="ml-1">Sair</span>
            </Button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OptimizedAdminLayout;

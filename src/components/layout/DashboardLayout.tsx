
import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Car, 
  Package, 
  Wrench, 
  Calendar, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, handleLogout } = useUserProfile();
  const { subscriptionStatus } = useSubscription();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Veículos', href: '/veiculos', icon: Car },
    { name: 'Produtos', href: '/produtos', icon: Package },
    { name: 'Serviços', href: '/servicos', icon: Wrench },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar, premium: true },
    { name: 'Orçamentos', href: '/orcamentos', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (href: string, isPremium?: boolean) => {
    // Se é premium e usuário não tem plano premium, bloquear
    if (isPremium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive) {
      return;
    }
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <SubscriptionGuard>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar para desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="text-xl font-bold text-oficina-dark">
                Oficina<span className="text-oficina-accent">Ágil</span>
              </Link>
            </div>
            
            {/* Status da assinatura */}
            <div className="mt-4 px-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {subscriptionStatus.planDetails?.name || 'Sem plano'}
                      </div>
                      {subscriptionStatus.isTrialActive && (
                        <div className="text-xs text-blue-600">
                          {subscriptionStatus.daysRemaining} dias restantes
                        </div>
                      )}
                    </div>
                    {subscriptionStatus.isPremium && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isItemActive = isActive(item.href);
                const isPremiumLocked = item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href, item.premium)}
                    disabled={isPremiumLocked}
                    className={`${
                      isItemActive
                        ? 'bg-blue-100 text-blue-900'
                        : isPremiumLocked
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                  >
                    <item.icon
                      className={`${
                        isItemActive ? 'text-blue-500' : isPremiumLocked ? 'text-gray-300' : 'text-gray-400'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                    {item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        Premium
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Informações do usuário e logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {userProfile?.nome_oficina || 'Oficina'}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {userProfile?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="ml-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar para mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
                  <Link to="/" className="text-xl font-bold text-oficina-dark">
                    Oficina<span className="text-oficina-accent">Ágil</span>
                  </Link>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isItemActive = isActive(item.href);
                    const isPremiumLocked = item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive;
                    
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href, item.premium)}
                        disabled={isPremiumLocked}
                        className={`${
                          isItemActive
                            ? 'bg-blue-100 text-blue-900'
                            : isPremiumLocked
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                      >
                        <item.icon
                          className={`${
                            isItemActive ? 'text-blue-500' : isPremiumLocked ? 'text-gray-300' : 'text-gray-400'
                          } mr-3 flex-shrink-0 h-5 w-5`}
                        />
                        {item.name}
                        {item.premium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Premium
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {userProfile?.nome_oficina || 'Oficina'}
                      </p>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                        {userProfile?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="ml-2"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header com menu sanduíche */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Logo/título para mobile */}
              <div className="md:hidden">
                <Link to="/" className="text-lg font-bold text-oficina-dark">
                  Oficina<span className="text-oficina-accent">Ágil</span>
                </Link>
              </div>
              
              {/* Menu de usuário para mobile */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Área de conteúdo */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default DashboardLayout;

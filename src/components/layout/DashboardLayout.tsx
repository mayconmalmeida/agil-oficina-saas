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
import SidebarNavigation from './SidebarNavigation';
import MobileHeader from './MobileHeader';

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
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <SidebarNavigation onLogout={handleLogout} />
        </div>

        {/* Sidebar Mobile (mantém implementação modal, mas pode ser extraído no futuro) */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              {/* Header Sidebar mobile */}
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fechar menu</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              {/* SidebarNavigation no mobile, com onLogout */}
              <SidebarNavigation onLogout={handleLogout} />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Header mobile */}
          <MobileHeader 
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={handleLogout}
          />

          {/* Área de conteúdo com margem de segurança */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default DashboardLayout;

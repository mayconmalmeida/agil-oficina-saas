
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
import DashboardMainContent from "./DashboardMainContent";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, handleLogout } = useUserProfile();
  const { subscriptionStatus } = useSubscription();

  const handleNavigation = (href: string, isPremium?: boolean) => {
    // Se é premium e usuário não tem plano premium, bloquear
    if (isPremium && !subscriptionStatus.isPremium && !subscriptionStatus.isTrialActive) {
      return;
    }
    navigate(href);
    setSidebarOpen(false);
  };

  const handleMenuToggle = () => {
    console.log('Menu toggle clicked, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    console.log('Closing sidebar');
    setSidebarOpen(false);
  };

  return (
    <SubscriptionGuard>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <SidebarNavigation onLogout={handleLogout} />
        </div>

        {/* Sidebar Mobile - Fixed overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-50 lg:hidden">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={handleCloseSidebar}
              aria-hidden="true"
            />
            
            {/* Sidebar panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out">
              {/* Close button */}
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-600 hover:bg-opacity-25 transition-colors"
                  onClick={handleCloseSidebar}
                >
                  <span className="sr-only">Fechar menu</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              {/* Sidebar content */}
              <SidebarNavigation 
                onLogout={handleLogout} 
                onNavigate={handleCloseSidebar}
              />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <MobileHeader 
            onMenuClick={handleMenuToggle}
            onLogout={handleLogout}
          />

          <DashboardMainContent />
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default DashboardLayout;

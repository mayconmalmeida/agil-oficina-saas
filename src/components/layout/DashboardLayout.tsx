
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNavigation from './SidebarNavigation';
import DashboardHeader from './DashboardHeader';
import MobileHeader from './MobileHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavigate = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar visível apenas em telas md+ */}
        <div className="hidden md:block">
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarContent>
              <SidebarNavigation onLogout={handleLogout} />
            </SidebarContent>
          </Sidebar>
        </div>

        {/* Menu mobile via Sheet, apenas em telas menores que md */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarNavigation 
                onLogout={handleLogout} 
                onNavigate={handleMobileNavigate}
              />
            </SheetContent>
          </Sheet>
        </div>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header: renderizado em telas menores que md */}
          <div className="md:hidden">
            <MobileHeader 
              onMenuClick={handleMobileMenuToggle}
              onLogout={handleLogout}
            />
          </div>
          
          {/* Desktop Header com botão de sidebar: visível apenas em md+ */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b">
            <SidebarTrigger />
            <DashboardHeader />
          </div>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

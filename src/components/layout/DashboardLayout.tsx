
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNavigation from './SidebarNavigation';
import DashboardHeader from './DashboardHeader';
import MobileHeader from './MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavigate = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0">
          <SidebarNavigation onLogout={handleLogout} />
        </div>
      )}

      {/* Mobile Menu Sheet */}
      {isMobile && (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarNavigation 
              onLogout={handleLogout} 
              onNavigate={handleMobileNavigate}
            />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <MobileHeader 
            onMenuClick={handleMobileMenuToggle}
            onLogout={handleLogout}
          />
        )}
        
        {/* Desktop Header */}
        {!isMobile && <DashboardHeader />}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

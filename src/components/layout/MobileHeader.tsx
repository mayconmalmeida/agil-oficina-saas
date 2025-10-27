
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  onLogout
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`
      bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 
      ${isMobile ? 'block' : 'lg:hidden'}
    `}>
      <div className={`
        flex items-center justify-between 
        ${isMobile ? 'px-2 py-2' : 'px-3 py-2 sm:px-4 sm:py-3'}
      `}>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 sm:h-12 sm:w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:bg-gray-100 transition-colors" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        
        <div className="flex-1 flex justify-center">
          <Link to="/dashboard" className="flex items-center">
            {/* Logo oficial */}
            <img src="/oficinago-logo-backup.png" alt="OficinaGO" className="h-8 sm:h-10 w-auto" />
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout} 
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileHeader;

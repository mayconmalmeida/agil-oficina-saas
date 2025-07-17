
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  onLogout
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 lg:hidden">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
        <button 
          className="h-10 w-10 sm:h-12 sm:w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 hover:bg-gray-100 transition-colors" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">O</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Oficina Go</span>
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout} 
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MobileHeader;

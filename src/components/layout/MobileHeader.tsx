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
  return <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/9fef4ca2-faa7-4cfe-b8d1-20c95046fdb3.png" alt="OficinaGO" style={{
            width: '240px',
            height: '160px'
          }} className="w-40 h-20 object-contain" />
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="p-2">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>;
};
export default MobileHeader;
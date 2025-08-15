
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

interface SidebarNavigationProps {
  onLogout: () => void;
  onNavigate?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onLogout, onNavigate }) => {
  const location = useLocation();
  const { filteredMenuItems, getMenuAccessInfo } = useMenuPermissions();

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">Oficina Go</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                         (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const accessInfo = getMenuAccessInfo(item);
          const isAccessible = accessInfo.canAccess;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : isAccessible
                    ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.isPremium && accessInfo.isTrialAccess && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                  Trial
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Subscription info */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/dashboard/assinatura"
          onClick={handleNavClick}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <CreditCard className="h-5 w-5" />
          <span>Assinatura</span>
        </NavLink>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default SidebarNavigation;

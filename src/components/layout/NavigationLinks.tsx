
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';
import { menuItems, premiumMenuItems } from '@/config/menuConfig';

interface NavigationLinksProps {
  subscriptionStatus: any;
  onNavigate: (href: string, isPremium?: boolean) => void;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ 
  subscriptionStatus, 
  onNavigate 
}) => {
  const location = useLocation();
  const { filteredMenuItems, getMenuAccessInfo, isPremiumTrial, diasRestantes } = useMenuPermissions();

  const renderNavigationItem = (item: any) => {
    const isActive = location.pathname === item.path;
    const accessInfo = getMenuAccessInfo(item);
    const isAccessible = accessInfo.canAccess;

    console.log('NavigationLinks: Item:', item.name, {
      isPremium: item.isPremium,
      requiredPlan: item.requiredPlan,
      isAccessible,
      accessInfo
    });

    return (
      <Link
        key={item.name}
        to={item.path}
        onClick={(e) => {
          if (!isAccessible) {
            e.preventDefault();
            onNavigate(item.path, item.isPremium);
          }
        }}
        className={cn(
          'group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-oficina text-white'
            : isAccessible
              ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
        )}
      >
        <item.icon
          className={cn(
            'mr-3 flex-shrink-0 h-5 w-5',
            isActive
              ? 'text-white'
              : isAccessible
                ? 'text-gray-500 group-hover:text-gray-700'
                : 'text-gray-300'
          )}
          aria-hidden="true"
        />
        <span className="flex-1">{item.name}</span>
        {item.isPremium && !isAccessible && (
          <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            Premium
          </Badge>
        )}
        {item.isPremium && isAccessible && accessInfo.isTrialAccess && (
          <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-300">
            Trial
          </Badge>
        )}
      </Link>
    );
  };

  // Separar menus básicos dos premium para melhor organização
  const basicMenus = filteredMenuItems.filter(item => !item.isPremium);
  const premiumMenus = filteredMenuItems.filter(item => item.isPremium);

  return (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {/* Navegação Principal */}
      <div className="space-y-1">
        {basicMenus.map(renderNavigationItem)}
      </div>

      {/* Recursos Premium */}
      {premiumMenus.length > 0 && (
        <div className="pt-6">
          <div className="px-4 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recursos Premium
              {isPremiumTrial && diasRestantes > 0 && (
                <span className="ml-2 text-green-600">(Trial Ativo)</span>
              )}
            </h3>
          </div>
          <div className="space-y-1">
            {premiumMenus.map(renderNavigationItem)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationLinks;

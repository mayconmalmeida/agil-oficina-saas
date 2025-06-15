
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface UserMenuProps {
  userProfile: {
    nome_oficina?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userProfile, onLogout }) => (
  <div className="flex-shrink-0 flex border-t border-gray-200 p-4 mt-auto">
    <div className="flex-shrink-0 w-full group block">
      <div className="flex items-center">
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
            {userProfile?.nome_oficina || 'Oficina'}
          </p>
          <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 truncate">
            {userProfile?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="ml-2 flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default UserMenu;

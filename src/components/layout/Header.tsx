
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const displayName = user?.nome_oficina || user?.email || 'Usuário';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {displayName}
                </span>
              </div>
              
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

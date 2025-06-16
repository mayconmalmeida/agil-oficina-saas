
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WelcomeHeaderProps {
  name?: string;
  workshopName?: string;
  logoUrl?: string | null;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  workshopName = 'Oficina',
  logoUrl = null
}) => {
  const initials = workshopName?.substring(0, 2) || 'OF';

  return (
    <div className="flex items-center gap-4 mb-6">
      <Avatar className="h-16 w-16 border-2 border-oficina">
        {logoUrl ? (
          <AvatarImage 
            src={logoUrl} 
            alt={workshopName} 
            className="object-contain p-1"
          />
        ) : (
          <AvatarFallback className="bg-oficina text-white text-xl font-bold">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {workshopName}
        </h1>
        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
      </div>
    </div>
  );
};

export default WelcomeHeader;

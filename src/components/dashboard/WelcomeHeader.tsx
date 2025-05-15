
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WelcomeHeaderProps {
  name?: string;
  workshopName?: string;
  logoUrl?: string | null;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  name = 'Usuário',
  workshopName = 'sua oficina',
  logoUrl = null
}) => {
  const initials = workshopName?.substring(0, 2) || 'OF';

  return (
    <div className="flex items-center gap-4 mb-6">
      <Avatar className="h-14 w-14 border-2 border-oficina">
        {logoUrl ? (
          <AvatarImage src={logoUrl} alt={workshopName} />
        ) : (
          <AvatarFallback className="bg-oficina text-white text-xl">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {name}!
        </h1>
        <p className="text-gray-600">
          Bem-vindo(a) ao painel da {workshopName}
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;

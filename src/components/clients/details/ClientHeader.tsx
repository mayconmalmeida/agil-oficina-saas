
import React from 'react';
import { User } from 'lucide-react';

interface ClientHeaderProps {
  nome: string;
  created_at: string;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ nome, created_at }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gray-100 p-2 rounded-full">
        <User className="h-6 w-6 text-gray-600" />
      </div>
      <div>
        <h3 className="font-medium">{nome}</h3>
        <p className="text-sm text-gray-500">Cliente desde {formatDate(created_at)}</p>
      </div>
    </div>
  );
};

export default ClientHeader;

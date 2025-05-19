
import React from 'react';
import { User } from 'lucide-react';

interface ClientHeaderProps {
  nome: string;
  created_at?: string;
  logoUrl?: string;
  documento?: string;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ nome, created_at, logoUrl, documento }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gray-100 p-2 rounded-full">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-6 w-6 object-contain" 
          />
        ) : (
          <User className="h-6 w-6 text-gray-600" />
        )}
      </div>
      <div>
        <h3 className="font-medium">{nome}</h3>
        {documento && <p className="text-xs text-gray-500">CPF/CNPJ: {documento}</p>}
        {created_at && <p className="text-sm text-gray-500">Cliente desde {formatDate(created_at)}</p>}
      </div>
    </div>
  );
};

export default ClientHeader;

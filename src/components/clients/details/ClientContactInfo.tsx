
import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ClientContactInfoProps {
  telefone: string;
  email?: string;
}

const ClientContactInfo: React.FC<ClientContactInfoProps> = ({ telefone, email }) => {
  return (
    <>
      <div>
        <h3 className="text-sm font-medium mb-2">Informações de Contato</h3>
        
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-gray-500" />
          <span>{telefone}</span>
        </div>
        
        {email && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{email}</span>
          </div>
        )}
      </div>
      <Separator />
    </>
  );
};

export default ClientContactInfo;


import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ClientContactInfoProps {
  telefone: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const ClientContactInfo: React.FC<ClientContactInfoProps> = ({ 
  telefone, 
  email,
  endereco,
  cidade,
  estado,
  cep
}) => {
  const hasAddress = endereco || cidade || estado || cep;
  
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
        
        {hasAddress && (
          <div className="flex items-start gap-2 text-sm mt-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              {endereco && <p>{endereco}</p>}
              {(cidade || estado || cep) && (
                <p className="text-gray-500">
                  {cidade}{estado && `, ${estado}`}{cep && ` - CEP: ${cep}`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <Separator />
    </>
  );
};

export default ClientContactInfo;


import React from 'react';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopAddressInfoProps {
  workshop: WorkshopDetails;
}

const WorkshopAddressInfo = ({ workshop }: WorkshopAddressInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Endereço</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-500">Endereço:</div>
        <div>{workshop.endereco || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">Cidade:</div>
        <div>{workshop.cidade || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">Estado:</div>
        <div>{workshop.estado || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">CEP:</div>
        <div>{workshop.cep || 'Não definido'}</div>
      </div>
    </div>
  );
};

export default WorkshopAddressInfo;

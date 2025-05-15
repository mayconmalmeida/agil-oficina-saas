
import React from 'react';
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopGeneralInfoProps {
  workshop: WorkshopDetails;
}

const WorkshopGeneralInfo = ({ workshop }: WorkshopGeneralInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Informações gerais</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-500">Nome:</div>
        <div>{workshop.nome_oficina || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">CNPJ:</div>
        <div>{workshop.cnpj || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">Responsável:</div>
        <div>{workshop.responsavel || 'Não definido'}</div>
        
        <div className="text-sm text-gray-500">Email:</div>
        <div>{workshop.email}</div>
        
        <div className="text-sm text-gray-500">Telefone:</div>
        <div>{workshop.telefone || 'Não definido'}</div>
      </div>
    </div>
  );
};

export default WorkshopGeneralInfo;

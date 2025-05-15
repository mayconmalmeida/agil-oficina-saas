
import React from 'react';
import { Progress } from '@/components/ui/progress';

const ClientsPageHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-oficina-dark">
        Adicione seu Primeiro Cliente
      </h1>
      <p className="mt-2 text-oficina-gray">
        Cadastre os dados básicos do cliente e seu veículo
      </p>
      
      <div className="mt-4">
        <Progress value={50} className="h-2 w-full max-w-xs mx-auto" />
        <p className="text-xs text-oficina-gray mt-1">Etapa 2 de 4</p>
      </div>
    </div>
  );
};

export default ClientsPageHeader;

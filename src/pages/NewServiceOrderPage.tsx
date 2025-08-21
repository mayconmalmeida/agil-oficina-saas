
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrdemServicoForm from '@/components/ordem-servico/OrdemServicoForm';

const NewServiceOrderPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
      </div>
      
      <OrdemServicoForm 
        onSuccess={() => {
          // Redirect to orders list after success
          window.location.href = '/ordens-servico';
        }}
      />
    </div>
  );
};

export default NewServiceOrderPage;

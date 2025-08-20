
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewOrdemServicoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/ordens-servico')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Ordens de Serviço
        </Button>
        
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
        <p className="text-gray-600 mt-2">Crie uma nova ordem de serviço</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar Ordem de Serviço</CardTitle>
          <CardDescription>
            Esta funcionalidade está em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              A página de criação de ordens de serviço está sendo desenvolvida.
            </p>
            <Button onClick={() => navigate('/ordens-servico')}>
              Voltar para Lista de Ordens de Serviço
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrdemServicoPage;

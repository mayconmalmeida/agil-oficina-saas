
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Share, Mail } from 'lucide-react';

const OrdemServicoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/ordens-servico')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Ordens de Serviço
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ordem de Serviço #{id}</h1>
            <p className="text-gray-600 mt-2">Detalhes da ordem de serviço</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              E-mail
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Ordem de Serviço</CardTitle>
          <CardDescription>
            Esta funcionalidade está em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              A visualização detalhada da ordem de serviço está sendo desenvolvida.
            </p>
            <Button onClick={() => navigate('/dashboard/ordens-servico')}>
              Voltar para Lista de Ordens de Serviço
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdemServicoDetailPage;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const ConfiguracoesPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>
            Gerencie as configurações da sua oficina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Painel de configurações em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesPage;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileSpreadsheet, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IntegracaoContabilPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Integração Contábil</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <span>Exportar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Exporte seus dados financeiros em formatos compatíveis com sistemas contábeis.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar XML (NFCe/NFe)
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Importar Dados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Importe dados de outros sistemas contábeis para o OficinaÁgil.
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar do Excel
              </Button>
              <Button className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure as integrações com sistemas contábeis externos como Sage, Domínio, ContaAzul, entre outros.
          </p>
          <Button>Configurar Integrações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracaoContabilPage;

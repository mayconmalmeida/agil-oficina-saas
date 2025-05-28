
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';

const UsersSubscriptionsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciar Usuários e Assinaturas
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os usuários da plataforma e suas assinaturas.
        </p>
      </div>

      {/* Filtros e ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou ID..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b font-medium text-sm">
              <div>Usuário</div>
              <div>Email</div>
              <div>Plano</div>
              <div>Status</div>
              <div>Ações</div>
            </div>
            
            {/* Linhas placeholder */}
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">U{index}</span>
                  </div>
                  <span className="font-medium">Usuário {index}</span>
                </div>
                <div className="text-gray-600">usuario{index}@email.com</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    index % 2 === 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {index % 2 === 0 ? 'Premium' : 'Essencial'}
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    index % 3 === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {index % 3 === 0 ? 'Ativo' : 'Expirado'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-gray-500">
            <p>Funcionalidade em desenvolvimento - Em breve você poderá gerenciar usuários e assinaturas aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersSubscriptionsPage;

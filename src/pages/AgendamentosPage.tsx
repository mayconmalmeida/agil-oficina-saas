
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const AgendamentosPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Agendamentos</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Agendamentos</CardTitle>
          <CardDescription>
            Visualize e gerencie os agendamentos da oficina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Sistema de agendamentos em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendamentosPage;

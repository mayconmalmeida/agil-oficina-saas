
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

const EditClientPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Cliente ID: {id}</CardTitle>
          <CardDescription>
            Formulário para editar os dados do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Formulário de edição em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClientPage;

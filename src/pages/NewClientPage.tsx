
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClientForm from '@/components/clients/ClientForm';

const NewClientPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard/clientes');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Novo Cliente</CardTitle>
          <CardDescription>
            Adicione um novo cliente ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewClientPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ClientList from '@/components/clients/ClientList';
import ClientsPageHeader from '@/components/clients/ClientsPageHeader';
import ClientSearchForm from '@/components/clients/ClientSearchForm';
import { PlusCircle } from 'lucide-react';

const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleViewClient = (clientId: string) => {
    navigate(`/clientes/${clientId}`);
  };
  
  const handleEditClient = (clientId: string) => {
    navigate(`/clientes/editar/${clientId}`);
  };
  
  const handleDeleteClient = (clientId: string) => {
    // Implement delete functionality, example: show confirmation dialog
    console.log(`Delete client with ID: ${clientId}`);
  };
  
  const handleAddClient = () => {
    navigate('/clientes/novo');
  };
  
  return (
    <div className="space-y-6">
      <ClientsPageHeader />
      
      <div className="grid gap-6 md:grid-cols-2">
        <ClientSearchForm onSearchChange={handleSearchChange} />
        
        <div className="flex justify-end">
          <Button onClick={handleAddClient}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>
      
      <Card>
        <ClientList 
          searchTerm={searchTerm} 
          onViewClient={handleViewClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
        />
      </Card>
    </div>
  );
};

export default ClientsPage;

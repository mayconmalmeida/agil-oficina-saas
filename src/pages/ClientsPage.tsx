
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ClientList from '@/components/clients/ClientList';
import ClientsPageHeader from '@/components/clients/ClientsPageHeader';
import ClientSearchForm from '@/components/clients/ClientSearchForm';
import ClientDetailsPanel from '@/components/clients/ClientDetailsPanel';
import ClientEditDialog from '@/components/clients/ClientEditDialog';
import { PlusCircle } from 'lucide-react';

const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowDetails(true);
    setShowEditDialog(false);
  };
  
  const handleEditClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowEditDialog(true);
    setShowDetails(false);
  };
  
  const handleDeleteClient = (clientId: string) => {
    // Implement delete functionality, example: show confirmation dialog
    console.log(`Delete client with ID: ${clientId}`);
  };
  
  const handleAddClient = () => {
    navigate('/dashboard/clientes/novo');
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClientId(null);
  };

  const handleCloseEdit = () => {
    setShowEditDialog(false);
    setSelectedClientId(null);
  };

  const handleEditFromDetails = () => {
    setShowDetails(false);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    setShowEditDialog(false);
    setSelectedClientId(null);
    // Refresh the client list if needed
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${showDetails ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Card>
            <ClientList 
              searchTerm={searchTerm} 
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
            />
          </Card>
        </div>
        
        {showDetails && selectedClientId && (
          <div className="lg:col-span-1">
            <ClientDetailsPanel 
              clientId={selectedClientId}
              onClose={handleCloseDetails}
              onEdit={handleEditFromDetails}
            />
          </div>
        )}
      </div>

      {showEditDialog && selectedClientId && (
        <ClientEditDialog
          clientId={selectedClientId}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ClientsPage;

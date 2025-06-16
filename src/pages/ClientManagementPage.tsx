
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, Car, User, Filter, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientList from '@/components/clients/ClientList';
import ClientDetailsPanel from '@/components/clients/ClientDetailsPanel';
import EnhancedClientForm from '@/components/clients/EnhancedClientForm';
import ClientSearchForm from '@/components/clients/ClientSearchForm';
import ClientsPageHeader from '@/components/clients/ClientsPageHeader';

const ClientManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleNewClient = () => {
    setActiveTab('novo');
    setSelectedClientId(null);
    setShowDetails(false);
    setSaveSuccess(false);
    setEditMode(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowDetails(true);
    setEditMode(false);
    setActiveTab('lista');
  };
  
  const handleEditClient = (clientId: string) => {
    console.log('Edit client clicked:', clientId);
    setSelectedClientId(clientId);
    setEditMode(true);
    setActiveTab('editar');
    setShowDetails(false);
  };
  
  const handleViewClient = (clientId: string) => {
    console.log('View client clicked:', clientId);
    setSelectedClientId(clientId);
    setShowDetails(true);
    setEditMode(false);
    setActiveTab('lista');
  };
  
  const handleDeleteClient = (clientId: string) => {
    // Handle client deletion logic
    console.log('Delete client:', clientId);
    // Add confirmation modal or direct deletion logic
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClientId(null);
    setEditMode(false);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setActiveTab('lista');
    if (selectedClientId) {
      setShowDetails(true);
    }
  };
  
  const handleSearchFilterChange = (filters: any) => {
    setSearchFilters(filters);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleToggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };
  
  const handleClientSaved = () => {
    setSaveSuccess(true);
    toast({
      title: editMode ? "Cliente atualizado" : "Cliente adicionado",
      description: editMode 
        ? "O cliente foi atualizado com sucesso."
        : "O cliente foi cadastrado com sucesso.",
    });
    
    // Retorna para a lista após um breve delay
    setTimeout(() => {
      setActiveTab('lista');
      setSaveSuccess(false);
      setEditMode(false);
      
      // If we were editing and have a selected client, show details again
      if (editMode && selectedClientId) {
        setShowDetails(true);
      }
    }, 1500);
  };
  
  const handleViewVehicles = () => {
    navigate('/dashboard/veiculos');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleViewVehicles}
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" /> 
              Ver Veículos
            </Button>
            <Button onClick={handleNewClient} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          </div>
        </div>

        {/* Show welcome message only on the new client tab */}
        {activeTab === 'novo' && (
          <ClientsPageHeader showWelcomeMessage={true} />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${showDetails && !editMode ? '2' : '3'}`}>
            <Card className="overflow-visible bg-white">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <TabsList>
                      <TabsTrigger value="lista" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> 
                        Clientes
                      </TabsTrigger>
                      <TabsTrigger value="novo" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> 
                        Novo Cliente
                      </TabsTrigger>
                      {editMode && (
                        <TabsTrigger value="editar" className="flex items-center gap-2">
                          <Edit className="h-4 w-4" /> 
                          Editar Cliente
                        </TabsTrigger>
                      )}
                    </TabsList>
                    
                    {activeTab === 'lista' && (
                      <Button 
                        variant="outline" 
                        onClick={handleToggleAdvancedSearch}
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        {showAdvancedSearch ? 'Ocultar filtros' : 'Filtros avançados'}
                      </Button>
                    )}
                  </div>
                  
                  {activeTab === 'lista' && showAdvancedSearch && (
                    <div className="mb-6 border rounded-md p-4 bg-gray-50">
                      <ClientSearchForm 
                        onSearchChange={handleSearchChange} 
                        onFilterChange={handleSearchFilterChange}
                      />
                    </div>
                  )}
                  
                  <TabsContent value="lista" className="mt-0">
                    <ClientList 
                      searchTerm={searchTerm}
                      onViewClient={handleViewClient}
                      onEditClient={handleEditClient}
                      onDeleteClient={handleDeleteClient}
                      filters={searchFilters}
                      onSelectClient={handleClientSelect}
                    />
                  </TabsContent>
                  
                  <TabsContent value="novo" className="mt-0 overflow-visible">
                    <EnhancedClientForm 
                      onSave={handleClientSaved}
                      isLoading={isLoading}
                      saveSuccess={saveSuccess}
                    />
                  </TabsContent>
                  
                  <TabsContent value="editar" className="mt-0 overflow-visible">
                    {editMode && selectedClientId && (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-medium">Editar Cliente</h2>
                          <Button variant="ghost" onClick={handleCancelEdit}>
                            Cancelar
                          </Button>
                        </div>
                        <EnhancedClientForm 
                          onSave={handleClientSaved}
                          isLoading={isLoading}
                          saveSuccess={saveSuccess}
                          isEditing={true}
                          clientId={selectedClientId}
                        />
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {showDetails && !editMode && selectedClientId && (
            <div className="lg:col-span-1">
              <ClientDetailsPanel 
                clientId={selectedClientId} 
                onClose={handleCloseDetails}
                onEdit={() => handleEditClient(selectedClientId)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManagementPage;

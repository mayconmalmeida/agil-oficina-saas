
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientList from '@/components/clients/ClientList';
import ClientDetailsPanel from '@/components/clients/ClientDetailsPanel';
import EnhancedClientForm from '@/components/clients/EnhancedClientForm';
import ClientSearchForm from '@/components/clients/ClientSearchForm';

const ClientManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleNewClient = () => {
    setActiveTab('novo');
    setSelectedClientId(null);
    setShowDetails(false);
    setSaveSuccess(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClientId(null);
  };
  
  const handleSearchFilterChange = (filters: any) => {
    setSearchFilters(filters);
  };
  
  const handleToggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };
  
  const handleClientSaved = async () => {
    setSaveSuccess(true);
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi cadastrado com sucesso.",
    });
    
    // Retorna para a lista após um breve delay
    setTimeout(() => {
      setActiveTab('lista');
      setSaveSuccess(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <Button onClick={handleNewClient} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${showDetails ? '2' : '3'}`}>
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <TabsList>
                      <TabsTrigger value="lista" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> 
                        Clientes
                      </TabsTrigger>
                      <TabsTrigger value="novo" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> 
                        Novo Cliente
                      </TabsTrigger>
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
                      <ClientSearchForm onFilterChange={handleSearchFilterChange} />
                    </div>
                  )}
                  
                  <TabsContent value="lista" className="mt-0">
                    <ClientList 
                      onSelectClient={handleClientSelect} 
                      filters={searchFilters}
                    />
                  </TabsContent>
                  
                  <TabsContent value="novo" className="mt-0">
                    <EnhancedClientForm 
                      onSave={handleClientSaved}
                      isLoading={isLoading}
                      saveSuccess={saveSuccess}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {showDetails && (
            <div className="lg:col-span-1">
              <ClientDetailsPanel 
                clientId={selectedClientId!} 
                onClose={handleCloseDetails}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManagementPage;

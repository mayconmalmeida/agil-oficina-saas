
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Users } from 'lucide-react';
import ClientList from '@/components/clients/ClientList';
import ClientForm from '@/components/clients/ClientForm';
import ClientDetailsPanel from '@/components/clients/ClientDetailsPanel';
import { useToast } from '@/hooks/use-toast';

const ClientsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };
  
  const handleNewClient = () => {
    setActiveTab('novo');
    setSelectedClientId(null);
    setShowDetails(false);
    setSaveSuccess(false);
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowDetails(true);
  };
  
  const handleEditClient = (clientId: string) => {
    // Navigate to edit page or change state
    console.log("Edit client:", clientId);
  };
  
  const handleDeleteClient = (clientId: string) => {
    // Handle deletion logic
    console.log("Delete client:", clientId);
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClientId(null);
  };
  
  const handleSubmitClient = async (values: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSaveSuccess(true);
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi cadastrado com sucesso.",
      });
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente",
        description: "Ocorreu um erro ao cadastrar o cliente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    setActiveTab('lista');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <Button onClick={handleNewClient}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${showDetails ? '2' : '3'}`}>
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex justify-between items-center mb-6">
                    <TabsList>
                      <TabsTrigger value="lista" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" /> 
                        Lista de Clientes
                      </TabsTrigger>
                      <TabsTrigger value="novo" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" /> 
                        Novo Cliente
                      </TabsTrigger>
                    </TabsList>
                    
                    {activeTab === 'lista' && (
                      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="Buscar por nome, CPF, telefone..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="icon">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </div>
                  
                  <TabsContent value="lista" className="mt-0">
                    <ClientList 
                      searchTerm={searchQuery}
                      onViewClient={handleViewClient}
                      onEditClient={handleEditClient}
                      onDeleteClient={handleDeleteClient}
                      searchQuery={searchQuery}
                      onSelectClient={handleClientSelect}
                    />
                  </TabsContent>
                  
                  <TabsContent value="novo" className="mt-0">
                    <ClientForm 
                      onSubmit={handleSubmitClient}
                      onSkip={handleSkip}
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
                onEdit={handleEditClient}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsManagementPage;

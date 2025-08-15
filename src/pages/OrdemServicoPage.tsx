
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import OrdemServicoList from '@/components/ordem-servico/OrdemServicoList';
import OrdemServicoForm from '@/components/ordem-servico/OrdemServicoForm';

const OrdemServicoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };
  
  const handleNewOrdemServico = () => {
    setActiveTab('nova');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <Button onClick={handleNewOrdemServico}>
            <Plus className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="lista" className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4" /> 
                    Lista de Ordens
                  </TabsTrigger>
                  <TabsTrigger value="nova" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Nova Ordem
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'lista' && (
                  <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-lg">
                    <Input
                      type="text"
                      placeholder="Buscar ordens de serviço..."
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
                <OrdemServicoList searchQuery={searchQuery} />
              </TabsContent>
              
              <TabsContent value="nova" className="mt-0">
                <OrdemServicoForm 
                  onSuccess={() => setActiveTab('lista')}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdemServicoPage;

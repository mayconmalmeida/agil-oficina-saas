
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Printer, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
import { Input } from '@/components/ui/input';

const BudgetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };
  
  const handleNewBudget = () => {
    setActiveTab('novo');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Orçamentos</h1>
          <Button onClick={handleNewBudget}>
            <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="lista" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Lista de Orçamentos
                  </TabsTrigger>
                  <TabsTrigger value="novo" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Novo Orçamento
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'lista' && (
                  <div className="flex flex-col md:flex-row gap-2 w-full md:max-w-lg">
                    <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                      <Input
                        type="text"
                        placeholder="Buscar orçamentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                    
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="md:w-[180px]">
                        <SelectValue placeholder="Filtrar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendentes">Pendentes</SelectItem>
                        <SelectItem value="aprovados">Aprovados</SelectItem>
                        <SelectItem value="rejeitados">Rejeitados</SelectItem>
                        <SelectItem value="convertidos">Convertidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <TabsContent value="lista" className="mt-0">
                <BudgetList searchQuery={searchQuery} filter={filter} />
              </TabsContent>
              
              <TabsContent value="novo" className="mt-0">
                <BudgetForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetPage;

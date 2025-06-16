
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Plus, Search } from 'lucide-react';

interface ProductsTabsHeaderProps {
  activeTab: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

const ProductsTabsHeader: React.FC<ProductsTabsHeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <TabsList>
        <TabsTrigger value="lista" className="flex items-center">
          <Package className="mr-2 h-4 w-4" /> 
          Lista de Produtos
        </TabsTrigger>
        <TabsTrigger value="novo" className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> 
          Novo Produto
        </TabsTrigger>
      </TabsList>
      
      {activeTab === 'lista' && (
        <div className="flex flex-col md:flex-row gap-2 w-full md:max-w-lg">
          <form onSubmit={onSearchSubmit} className="flex items-center space-x-2 flex-1">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductsTabsHeader;

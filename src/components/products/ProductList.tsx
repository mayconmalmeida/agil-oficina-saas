
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Plus, Minus, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductListProps {
  onSelectProduct: (productId: string) => void;
  searchQuery?: string;
  filter?: string;
  showInventoryControls?: boolean;
}

// Mock data - replace with actual data from your API
const mockProducts = [
  {
    id: "1",
    nome: "Óleo de Motor Sintético 5W30",
    codigo: "OL-5W30",
    tipo: "peca",
    precoCusto: 45.0,
    precoVenda: 89.9,
    estoque: 12,
    estoqueMinimo: 5,
    fornecedor: "AutoParts Ltda"
  },
  {
    id: "2",
    nome: "Filtro de Óleo Universal",
    codigo: "FO-1234",
    tipo: "peca",
    precoCusto: 15.0,
    precoVenda: 35.0,
    estoque: 8,
    estoqueMinimo: 10,
    fornecedor: "FilterTech"
  },
  {
    id: "3",
    nome: "Pastilha de Freio Dianteira",
    codigo: "PF-2022",
    tipo: "peca",
    precoCusto: 65.0,
    precoVenda: 120.0,
    estoque: 2,
    estoqueMinimo: 4,
    fornecedor: "BrakeMaster"
  },
  {
    id: "4",
    nome: "Troca de Óleo e Filtros",
    codigo: "SRV-001",
    tipo: "servico",
    precoCusto: 0,
    precoVenda: 150.0,
    estoque: null,
    estoqueMinimo: null,
    fornecedor: null
  },
  {
    id: "5",
    nome: "Revisão Completa",
    codigo: "SRV-002",
    tipo: "servico",
    precoCusto: 0,
    precoVenda: 350.0,
    estoque: null,
    estoqueMinimo: null,
    fornecedor: null
  },
  {
    id: "6",
    nome: "Bateria 60Ah",
    codigo: "BAT-60",
    tipo: "peca",
    precoCusto: 200.0,
    precoVenda: 320.0,
    estoque: 0,
    estoqueMinimo: 2,
    fornecedor: "PowerBat"
  },
];

const ProductList: React.FC<ProductListProps> = ({ 
  onSelectProduct, 
  searchQuery = '',
  filter = 'todos',
  showInventoryControls = false
}) => {
  // Filter products based on search query and filter
  const filteredProducts = mockProducts.filter(product => {
    // First apply search query filter
    const matchesSearch = !searchQuery || 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply category filter
    switch (filter) {
      case 'todos':
        return true;
      case 'pecas':
        return product.tipo === 'peca';
      case 'servicos':
        return product.tipo === 'servico';
      case 'baixo-estoque':
        return product.tipo === 'peca' && 
               product.estoque !== null && 
               product.estoqueMinimo !== null && 
               product.estoque <= product.estoqueMinimo;
      case 'esgotados':
        return product.tipo === 'peca' && product.estoque === 0;
      default:
        return true;
    }
  });
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStockStatus = (product: any) => {
    if (product.tipo === 'servico') return null;
    
    if (product.estoque === 0) {
      return { label: 'Esgotado', color: 'bg-red-100 text-red-800' };
    }
    
    if (product.estoque <= product.estoqueMinimo) {
      return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    return { label: 'OK', color: 'bg-green-100 text-green-800' };
  };
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            {!showInventoryControls ? (
              <TableHead className="text-center">Estoque</TableHead>
            ) : (
              <TableHead className="text-center">Controle</TableHead>
            )}
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell>{product.codigo}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    product.tipo === 'servico' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }>
                    {product.tipo === 'servico' ? 'Serviço' : 'Peça'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(product.precoVenda)}</TableCell>
                <TableCell className="text-center">
                  {product.tipo === 'peca' ? (
                    !showInventoryControls ? (
                      <Badge variant="outline" className={stockStatus?.color}>
                        {product.estoque} {stockStatus?.label && `(${stockStatus.label})`}
                      </Badge>
                    ) : (
                      <div className="flex justify-center items-center space-x-2">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{product.estoque}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-1">
                          <RotateCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectProduct(product.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductList;

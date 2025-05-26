
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatUtils';

interface Product {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
}

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface ProductSelectorProps {
  selectedItems: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ selectedItems, onItemsChange }) => {
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [products] = useState<Product[]>([
    { id: '1', nome: 'Óleo 5W30 Sintético', tipo: 'produto', valor: 49.9 },
    { id: '2', nome: 'Filtro de Óleo', tipo: 'produto', valor: 25.5 },
    { id: '3', nome: 'Troca de Óleo', tipo: 'servico', valor: 50.0 },
    { id: '4', nome: 'Alinhamento', tipo: 'servico', valor: 80.0 },
  ]);

  const handleAddItem = (product: Product) => {
    const newItem: SelectedItem = {
      id: product.id,
      nome: product.nome,
      tipo: product.tipo,
      quantidade: 1,
      valor_unitario: product.valor,
      valor_total: product.valor,
    };
    
    const updatedItems = [...(selectedItems || []), newItem];
    onItemsChange(updatedItems);
    setProductSearchOpen(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedItems = (selectedItems || []).filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };
  
  const handleQuantityChange = (itemId: string, newValue: number) => {
    if (newValue < 1) return;
    
    const safeItems = Array.isArray(selectedItems) ? selectedItems : [];
    const updatedItems = safeItems.map(item => {
      if (item.id === itemId) {
        const valor_total = item.valor_unitario * newValue;
        return { ...item, quantidade: newValue, valor_total };
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos e Serviços</h3>
        <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-72">
            <Command>
              <CommandInput placeholder="Buscar produto ou serviço..." />
              <CommandEmpty>Nenhum item encontrado</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-48">
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.nome}
                      onSelect={() => handleAddItem(product)}
                      className="cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{product.nome}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                          <span className="capitalize">{product.tipo}</span>
                          <span>{formatCurrency(product.valor)}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {Array.isArray(selectedItems) && selectedItems.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="capitalize">{item.tipo}</TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-12 h-8 text-center p-1"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.valor_total)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-md">
          <p className="text-sm text-gray-500 mb-1">Nenhum item adicionado</p>
          <p className="text-xs text-gray-400">Clique em "Adicionar Item" para incluir produtos ou serviços</p>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
